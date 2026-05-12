import { useMemo, useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   HYBRID 3D TERRAIN RENDERER

   Instead of treating depth as pure height map:
   - Ground plane stays FLAT (with very gentle slope)
   - Object regions get moderate vertical extrusion
   - Sky regions get zero height
   - Smooth transitions at boundaries
   ═══════════════════════════════════════════════════════════════ */

// ── Terrain Vertex Shader ─────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vHeight;

  void main() {
    vUv = uv;
    vHeight = position.y;   // Height was set during CPU displacement
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ── Terrain Fragment Shader ───────────────────────────────────
const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vHeight;

  uniform sampler2D colorMap;
  uniform sampler2D normalMap;
  uniform vec3 sunPosition;
  uniform float maxHeight;

  void main() {
    // Original image texture
    vec4 baseColor = texture2D(colorMap, vUv);
    vec3 norm = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;

    // Height-based shading: darken low areas slightly, brighten high
    float heightFactor = smoothstep(0.0, maxHeight * 0.7, vHeight);

    // Slope detection for subtle rock on steep faces
    float slope = 1.0 - abs(vWorldNormal.y);
    float rockBlend = smoothstep(0.5, 0.85, slope);

    // Subtle rock color on very steep faces only
    vec3 rockColor = vec3(0.35, 0.30, 0.24);
    vec3 finalColor = mix(baseColor.rgb, rockColor, rockBlend * 0.6);

    // ── Lighting ──
    vec3 lightDir = normalize(sunPosition - vWorldPosition);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normalVec = normalize(vWorldNormal + norm * 0.15);

    // Diffuse
    float diff = max(dot(normalVec, lightDir), 0.0);

    // Specular (Blinn-Phong)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normalVec, halfDir), 0.0), 48.0);

    // Fresnel rim
    float fresnel = pow(1.0 - max(dot(viewDir, normalVec), 0.0), 4.0);

    // Ambient occlusion from height
    float ao = 0.6 + 0.4 * smoothstep(0.0, 0.3, vHeight / max(maxHeight, 0.1));

    vec3 ambient = vec3(0.25, 0.25, 0.28);
    vec3 sunColor = vec3(1.25, 1.15, 1.0);

    vec3 lighting = ambient + diff * sunColor * 0.9 + spec * 0.12 + fresnel * vec3(0.04);
    vec3 color = finalColor * lighting * ao;

    // Tone mapping (ACES approximation)
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ── Side skirt shader ─────────────────────────────────────────
const sideVS = `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const sideFS = `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vec3 earth = vec3(0.22, 0.16, 0.10);
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diff = max(dot(normalize(vNormal), lightDir), 0.0);
    vec3 color = earth * (0.35 + 0.65 * diff);
    float fade = smoothstep(-4.0, 0.0, vWorldPos.y);
    color *= (0.25 + 0.75 * fade);
    color = pow(color, vec3(1.0 / 2.2));
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ── Read depth map pixels into float array ────────────────────
function readDepthPixels(texture, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (texture.image) {
    ctx.drawImage(texture.image, 0, 0, size, size);
  }
  const data = ctx.getImageData(0, 0, size, size).data;
  const result = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    result[i] = data[i * 4] / 255.0;
  }
  return result;
}

// ── Build CPU-displaced terrain mesh ──────────────────────────
function buildTerrain(depthData, segments, terrainSize, heightScale) {
  const geo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const count = pos.count;
  const depthRes = Math.round(Math.sqrt(depthData.length));

  let maxH = 0;

  for (let i = 0; i < count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);

    // Bilinear sample from depth map
    const px = Math.min(Math.floor(u * (depthRes - 1)), depthRes - 1);
    const py = Math.min(Math.floor((1 - v) * (depthRes - 1)), depthRes - 1);
    const idx = py * depthRes + px;
    const h = (depthData[idx] || 0) * heightScale;

    pos.setY(i, pos.getY(i) + h);
    if (h > maxH) maxH = h;
  }

  geo.computeVertexNormals();
  pos.needsUpdate = true;

  return { geometry: geo, maxHeight: maxH };
}

// ── Build side skirt ──────────────────────────────────────────
function buildSkirt(topGeo, skirtDepth) {
  const pos = topGeo.attributes.position;
  const segsPlusOne = Math.round(Math.sqrt(pos.count));
  const segs = segsPlusOne - 1;
  const stride = segsPlusOne;

  // Collect edge vertices around the perimeter
  const edges = [];

  // Bottom row (max z)
  for (let i = 0; i <= segs; i++) {
    const idx = segs * stride + i;
    edges.push([pos.getX(idx), pos.getY(idx), pos.getZ(idx)]);
  }
  // Right column
  for (let j = segs; j >= 0; j--) {
    const idx = j * stride + segs;
    edges.push([pos.getX(idx), pos.getY(idx), pos.getZ(idx)]);
  }
  // Top row
  for (let i = segs; i >= 0; i--) {
    edges.push([pos.getX(i), pos.getY(i), pos.getZ(i)]);
  }
  // Left column
  for (let j = 0; j <= segs; j++) {
    const idx = j * stride;
    edges.push([pos.getX(idx), pos.getY(idx), pos.getZ(idx)]);
  }

  const verts = [];
  const norms = [];
  const bottomY = -skirtDepth;

  for (let i = 0; i < edges.length; i++) {
    const [ax, ay, az] = edges[i];
    const [bx, by, bz] = edges[(i + 1) % edges.length];

    // Two triangles per quad
    verts.push(ax, ay, az,  bx, by, bz,  ax, bottomY, az);
    verts.push(bx, by, bz,  bx, bottomY, bz,  ax, bottomY, az);

    // Outward-facing normal
    const dx = bz - az, dz = -(bx - ax);
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    const nx = dx / len, nz = dz / len;
    for (let t = 0; t < 6; t++) norms.push(nx, 0, nz);
  }

  const skirtGeo = new THREE.BufferGeometry();
  skirtGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  skirtGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
  return skirtGeo;
}


// ── Main Component ────────────────────────────────────────────
const GardenBackground = forwardRef(function GardenBackground({
  originalImageUrl,
  depthMapUrl,
  normalMapUrl,
  rockMaskUrl,
  grassMaskUrl,
  heightScale = 1.5,
  onTerrainClick,
}, ref) {
  const [textures, setTextures] = useState(null);
  const [terrainData, setTerrainData] = useState(null);
  const meshRef = useRef();

  const TERRAIN_SIZE = 24;
  const SEGMENTS = 200;
  const SKIRT_DEPTH = 2.5;

  // Expose the terrain mesh ref to parent via forwardRef
  useImperativeHandle(ref, () => meshRef.current, [terrainData]);

  // ── Load textures ──
  useEffect(() => {
    if (!depthMapUrl) return;

    const loader = new THREE.TextureLoader();
    const loadTex = (url, fallback) =>
      new Promise(resolve => {
        if (!url) {
          const c = document.createElement('canvas');
          c.width = c.height = 4;
          const ctx = c.getContext('2d');
          ctx.fillStyle = `rgb(${fallback.join(',')})`;
          ctx.fillRect(0, 0, 4, 4);
          resolve(new THREE.CanvasTexture(c));
          return;
        }
        loader.load(url, tex => {
          tex.anisotropy = 8;
          tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        }, undefined, () => {
          const c = document.createElement('canvas');
          c.width = c.height = 4;
          resolve(new THREE.CanvasTexture(c));
        });
      });

    Promise.all([
      loadTex(originalImageUrl, [100, 130, 80]),
      loadTex(depthMapUrl, [128, 128, 128]),
      loadTex(normalMapUrl, [128, 128, 255]),
    ]).then(([colorMap, depthMap, normalMap]) => {
      // Don't use sRGB for data textures
      depthMap.colorSpace = THREE.LinearSRGBColorSpace;
      normalMap.colorSpace = THREE.LinearSRGBColorSpace;
      depthMap.generateMipmaps = false;
      depthMap.minFilter = depthMap.magFilter = THREE.LinearFilter;
      normalMap.generateMipmaps = false;
      normalMap.minFilter = normalMap.magFilter = THREE.LinearFilter;

      setTextures({ colorMap, depthMap, normalMap });
    });
  }, [originalImageUrl, depthMapUrl, normalMapUrl]);

  // ── Build displaced geometry when textures or heightScale change ──
  useEffect(() => {
    if (!textures?.depthMap?.image) return;

    const depthPixels = readDepthPixels(textures.depthMap, 256);

    // The corrected depth map from backend has:
    // Ground ≈ 0.0-0.15 (very flat)
    // Objects ≈ 0.15-0.7 (moderate height)
    // Sky = 0
    // We scale these into world units
    const effectiveScale = heightScale * 5;

    const { geometry, maxHeight } = buildTerrain(
      depthPixels, SEGMENTS, TERRAIN_SIZE, effectiveScale
    );
    const skirtGeo = buildSkirt(geometry, SKIRT_DEPTH);

    setTerrainData({ geometry, skirtGeo, maxHeight });

    return () => {
      geometry.dispose();
      skirtGeo.dispose();
    };
  }, [textures, heightScale]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (onTerrainClick) onTerrainClick(e);
  }, [onTerrainClick]);

  if (!textures || !terrainData) {
    return (
      <Html center>
        <div className="loading-3d">Building 3D terrain...</div>
      </Html>
    );
  }

  return (
    <group position={[0, -2, 0]}>
      {/* Main terrain surface */}
      <mesh
        ref={meshRef}
        geometry={terrainData.geometry}
        receiveShadow
        castShadow
        onClick={handleClick}
      >
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            colorMap: { value: textures.colorMap },
            normalMap: { value: textures.normalMap },
            sunPosition: { value: new THREE.Vector3(15, 25, 10) },
            maxHeight: { value: terrainData.maxHeight },
          }}
        />
      </mesh>

      {/* Side skirt — earth/soil walls */}
      <mesh geometry={terrainData.skirtGeo} receiveShadow>
        <shaderMaterial vertexShader={sideVS} fragmentShader={sideFS} />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, -SKIRT_DEPTH, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE]} />
        <meshStandardMaterial color="#120a05" roughness={1} />
      </mesh>

      {/* Shadow-catching ground */}
      <mesh position={[0, -SKIRT_DEPTH - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0d0d1a" roughness={1} transparent opacity={0.3} />
      </mesh>
    </group>
  );
});

export default GardenBackground;