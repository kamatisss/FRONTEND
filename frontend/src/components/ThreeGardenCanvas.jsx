import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getInventoryItems } from '../services/api';

export default function ThreeGardenCanvas({ plants, lotWidth, lotLength, backgroundImageUrl, arMode = false }) {
  const canvasRef = useRef(null);
  const aiPlantsGroupRef = useRef(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getInventoryItems('plant')
      .then(data => {
        if (isMounted) setInventory(data);
      })
      .catch(err => {
        console.error('Error fetching plant inventory in 3D Canvas:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // Effect 1: Initialize vanilla Three.js scene environment
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const width = parent.clientWidth || 800;
    const height = 450;

    const pad = 6;
    const currentWidth  = Math.max(Number(lotWidth)  || 10, 1);
    const currentLength = Math.max(Number(lotLength) || 10, 1);
    const gw = currentWidth  + pad;
    const gl = currentLength + pad;
    const cx = currentWidth  / 2;
    const cz = currentLength / 2;
    const camDist   = Math.max(gw, gl) * 1.1 + 6;
    const camHeight = Math.max(gw, gl) * 0.6 + 4;

    // 1. Scene
    const scene = new THREE.Scene();
    if (arMode && backgroundImageUrl) {
      const textureLoader = new THREE.TextureLoader();
      const bgTexture = textureLoader.load(backgroundImageUrl);
      scene.background = bgTexture;
    } else if (arMode) {
      // No photo uploaded — pleasant sky gradient fallback
      scene.background = new THREE.Color('#c8e8f4');
    } else {
      scene.background = new THREE.Color('#f8fafc');
    }

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    if (arMode) {
      // Low-angle perspective that approximates an outdoor photo horizon
      camera.position.set(cx, camHeight * 0.42, cz + camDist * 0.88);
    } else {
      camera.position.set(cx, camHeight, cz + camDist);
    }

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, arMode ? 0.9 : 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(cx + gw, Math.max(gw, gl) * 1.5, cz - gl);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = Math.max(gw, gl) * 8;
    const shadowBound = Math.max(gw, gl) * 1.5;
    dirLight.shadow.camera.left   = -shadowBound;
    dirLight.shadow.camera.right  =  shadowBound;
    dirLight.shadow.camera.top    =  shadowBound;
    dirLight.shadow.camera.bottom = -shadowBound;
    dirLight.target.position.set(cx, 0, cz);
    scene.add(dirLight.target);
    scene.add(dirLight);

    // 5. Ground plane
    const groundGeo = new THREE.PlaneGeometry(gw, gl);
    groundGeo.rotateX(-Math.PI / 2);
    let groundMat;
    if (arMode) {
      // Shadow-only ground: transparent plane that only shows plant shadows over the photo
      groundMat = new THREE.ShadowMaterial({ opacity: 0.28, transparent: true });
    } else {
      groundMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2d6a4f'),
        roughness: 0.75,
        metalness: 0.0,
      });
    }
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(cx, 0.0, cz);
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid — only in 3D mode
    let gridHelper = null;
    if (!arMode) {
      const gridSpan = Math.max(gw, gl);
      const gridDivs = Math.round(gridSpan);
      gridHelper = new THREE.GridHelper(gridSpan, gridDivs, 0xffffff, 0xffffff);
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.25;
      gridHelper.scale.set(gw / gridSpan, 1, gl / gridSpan);
      gridHelper.position.set(cx, 0.001, cz);
      scene.add(gridHelper);
    }

    // 6. Empty group for AI plants
    const aiGroup = new THREE.Group();
    scene.add(aiGroup);
    aiPlantsGroupRef.current = aiGroup;

    // 7. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(cx, 0, cz);
    if (arMode) {
      // Lock orbit to simulate a fixed photo horizon line
      controls.minPolarAngle = Math.PI / 4;
      controls.maxPolarAngle = Math.PI / 2.2;
      controls.minAzimuthAngle = -Math.PI / 5;
      controls.maxAzimuthAngle = Math.PI / 5;
      controls.enablePan = false;
    }
    controls.update();

    // 8. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = parent.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      ground.geometry.dispose();
      groundMat.dispose();
      if (gridHelper) gridHelper.dispose();
    };
  }, [lotWidth, lotLength, arMode, backgroundImageUrl]);

  // Effect 2: Place, position, rotate, and dispose AI plants when props change
  useEffect(() => {
    const aiGroup = aiPlantsGroupRef.current;
    if (!aiGroup) return;

    const disposeNode = (node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach((mat) => mat.dispose());
        } else {
          node.material.dispose();
        }
      }
      if (node.children) node.children.forEach(disposeNode);
    };

    // Clear existing children and dispose resources
    while (aiGroup.children.length > 0) {
      const child = aiGroup.children[0];
      aiGroup.remove(child);
      disposeNode(child);
    }

    if (!plants || !Array.isArray(plants)) return;

    const loader = new GLTFLoader();

    plants.forEach((plant) => {
      if (plant.is_existing) {
        let geometry;
        let material;

        let obstacleY;
        if (plant.type === 'structural_wall') {
          const wallH = plant.height || 4;
          geometry = new THREE.BoxGeometry(plant.width || 5, wallH, 1);
          // Invisible occluder: writes depth so plants behind walls are hidden
          material = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true });
          obstacleY = wallH / 2;
        } else {
          // Ground obstacles (pools, paths, etc.) — flat 2D boundary outline
          geometry = new THREE.BoxGeometry(plant.width || 2, 0.05, plant.width || 2);
          material = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            wireframe: true,
            transparent: true,
            opacity: 0.3
          });
          obstacleY = 0.025;
        }

        const obstacleMesh = new THREE.Mesh(geometry, material);
        obstacleMesh.position.set(plant.x, obstacleY, plant.z);
        obstacleMesh.visible = false; // Hide layout boundaries and debug obstacle meshes to prevent invisible wall slicing issues
        aiGroup.add(obstacleMesh);
        return;
      }

      const pId = plant.plant_id.toLowerCase();
      let placeholderMesh = null;

      if (pId.includes('tree') || pId.includes('oak') || pId.includes('palm')) {
        const trunkHeight = 2.4;
        const trunkRadius = 0.25;
        const trunkGeo = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
        const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
        trunkMesh.position.y = trunkHeight / 2;
        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;

        const canopyRadius = 1.0;
        const canopyGeo = new THREE.SphereGeometry(canopyRadius, 8, 8);
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
        const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
        canopyMesh.position.y = trunkHeight + canopyRadius * 0.7;
        canopyMesh.castShadow = true;
        canopyMesh.receiveShadow = true;

        const treeGroup = new THREE.Group();
        treeGroup.add(trunkMesh);
        treeGroup.add(canopyMesh);
        treeGroup.position.set(plant.x, 0, plant.z);
        treeGroup.rotation.y = (plant.rotation * Math.PI) / 180;

        placeholderMesh = treeGroup;

      } else if (pId.includes('shrub') || pId.includes('fern') || pId.includes('boxwood') || pId.includes('bamboo') || pId.includes('banana')) {
        const height = 1.2;
        const radius = 0.6;
        const geo = new THREE.ConeGeometry(radius, height, 8);
        const mat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(plant.x, height / 2, plant.z);
        mesh.rotation.y = (plant.rotation * Math.PI) / 180;

        placeholderMesh = mesh;

      } else {
        const radius = 0.35;
        const geo = new THREE.SphereGeometry(radius, 8, 8);
        const mat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(plant.x, radius, plant.z);
        mesh.rotation.y = (plant.rotation * Math.PI) / 180;

        placeholderMesh = mesh;
      }

      if (placeholderMesh) aiGroup.add(placeholderMesh);

      const match = inventory.find(item => {
        if (item.id.toString() === pId || item.id === parseInt(pId, 10)) return true;
        const itemName = item.name.toLowerCase();
        const terms = pId.split('_');
        return terms.some(term =>
          term !== 'plant' &&
          term !== 'tree' &&
          term !== 'flower' &&
          term !== 'shrub' &&
          itemName.includes(term)
        );
      });

      if (match && match.model_file) {
        const rawUrl = match.model_file;
        const modelUrl = rawUrl.startsWith('http')
          ? rawUrl
          : `${import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:8000'}${rawUrl}`;

        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene;

            model.position.set(plant.x, 0, plant.z);
            model.rotation.y = (plant.rotation * Math.PI) / 180;

            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.frustumCulled = false;
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                      mat.side = THREE.DoubleSide;
                    });
                  } else {
                    child.material.side = THREE.DoubleSide;
                  }
                }
                if (child.geometry) {
                  child.geometry.computeBoundingBox();
                  child.geometry.computeBoundingSphere();
                }
              }
            });

            model.updateWorldMatrix(true, true);
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);

            if (maxDim > 0) {
              let targetHeight = match.real_world_size || 1.0;
              if (!match.real_world_size) {
                if (pId.includes('tree')) targetHeight = 3.5;
                else if (pId.includes('shrub')) targetHeight = 1.5;
              }

              const scaleFactor = targetHeight / maxDim;
              model.scale.setScalar(scaleFactor);
              // Pin lowest point of the model to ground level
              model.position.y = -box.min.y * scaleFactor;
            }

            if (placeholderMesh) {
              aiGroup.remove(placeholderMesh);
              disposeNode(placeholderMesh);
            }
            aiGroup.add(model);
          },
          undefined,
          (err) => {
            console.error("Failed to load plant GLB model:", modelUrl, err);
          }
        );
      }
    });
  }, [plants, inventory]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full block focus:outline-none"
      style={{ height: '450px', display: 'block' }}
    />
  );
}
