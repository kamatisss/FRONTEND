import { useRef, useMemo, useEffect, Suspense, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, ContactShadows, Environment, Html, Preload } from '@react-three/drei';
import { EffectComposer, SSAO, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  Upload, AlertTriangle, Mountain, Sun, X
} from 'lucide-react';

import { useDesign } from '../context/DesignContext';
import { generateDepthMap } from '../services/api';
import GardenBackground from './GardenBackground';
import PlacedObject from './PlacedObject';
import AssetLibrarySidebar from './AssetLibrarySidebar';
import CostEstimatePanel from './CostEstimatePanel';
import SaveLoadPanel from './SaveLoadPanel';
import InventoryList from './InventoryList';
import PlacementPreview from './PlacementPreview';
import PlacementControls from './PlacementControls';
import ObjectTransformPanel from './ObjectTransformPanel';
import ErrorBoundary from './ErrorBoundary';

// ── Dynamic Sky ───────────────────────────────────────────────
function DynamicSky({ timeOfDay = 14 }) {
  const sunPosition = useMemo(() => {
    const azimuth = (timeOfDay - 12) * 15;
    const elevation = Math.max(15, 90 - Math.abs(timeOfDay - 12) * 7.5);
    return [
      Math.sin((azimuth * Math.PI) / 180) * 100,
      Math.sin((elevation * Math.PI) / 180) * 100,
      Math.cos((azimuth * Math.PI) / 180) * 100,
    ];
  }, [timeOfDay]);

  return (
    <Sky sunPosition={sunPosition} turbidity={0.3} rayleigh={0.4}
         mieCoefficient={0.003} mieDirectionalG={0.7} />
  );
}

// ── Sun Light that follows time of day ────────────────────────
function SunLight({ timeOfDay = 14 }) {
  const position = useMemo(() => {
    const azimuth = (timeOfDay - 12) * 15;
    const elevation = Math.max(15, 90 - Math.abs(timeOfDay - 12) * 7.5);
    return [
      Math.sin((azimuth * Math.PI) / 180) * 25,
      Math.sin((elevation * Math.PI) / 180) * 35,
      Math.cos((azimuth * Math.PI) / 180) * 15,
    ];
  }, [timeOfDay]);

  const intensity = useMemo(() => {
    if (timeOfDay < 7 || timeOfDay > 19) return 0.5;
    if (timeOfDay < 9 || timeOfDay > 17) return 1.8;
    return 2.8;
  }, [timeOfDay]);

  return (
    <directionalLight
      position={position} intensity={intensity} castShadow
      shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001}
      shadow-camera-far={100} shadow-camera-left={-30}
      shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30}
    />
  );
}

// ── Main Component ────────────────────────────────────────────
export default function GardenDesigner() {
  const { state, dispatch } = useDesign();
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef();
  const terrainRef = useRef();

  const isPlacing = state.placementMode !== 'idle';

  const getMediaUrl = (path) => path ? `http://localhost:8000${path}` : null;

  // ── Image Upload ──────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      dispatch({ type: 'SET_ERROR', payload: 'Please upload a JPG, PNG, or WebP image.' });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      dispatch({ type: 'SET_ERROR', payload: 'File must be under 15MB.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    dispatch({ type: 'SET_IMAGE', payload: URL.createObjectURL(file) });

    try {
      const result = await generateDepthMap(file);
      if (!result.depth_map_url) throw new Error('Missing depth map');
      dispatch({
        type: 'SET_DEPTH_DATA',
        payload: {
          depth_map_url: result.depth_map_url,
          normal_map_url: result.normal_map_url || result.depth_map_url,
          rock_mask_url: result.rock_mask_url || result.depth_map_url,
          grass_mask_url: result.grass_mask_url || result.depth_map_url,
        },
      });

      // ── Auto-place detected objects as 3D models ──
      if (result.detected_objects && result.detected_objects.length > 0) {
        // 1. Validation Logic: Filter against inventory
        const validObjects = [];
        let ignoredCount = 0;

        result.detected_objects.forEach(obj => {
          const matchedProduct = state.products.find(p => {
            const objName = (obj.model_type || obj.name || '').toLowerCase();
            const pPath = (p.model_path || '').toLowerCase();
            const pName = (p.name || '').toLowerCase();
            // Match perfectly or if one includes the other
            return (pPath === objName || objName.includes(pName) || pName.includes(objName)) && p.model_path;
          });

          if (matchedProduct) {
            validObjects.push({ ...obj, matchedProduct });
          } else {
            ignoredCount++;
          }
        });

        // 2. Safe Rendering: Only map over validated objects
        const TERRAIN_SIZE = 24;
        const TERRAIN_Y_OFFSET = -2; // matches GardenBackground group position

        validObjects.forEach((obj, idx) => {
          const worldX = obj.position.norm_x * (TERRAIN_SIZE / 2);
          const worldZ = obj.position.norm_z * (TERRAIN_SIZE / 2);
          // Match the terrain's exact depth formula to perfectly ground the objects
          const yNorm = (obj.position.norm_z + 1) / 2;
          const groundHeight = 0.1 + 0.05 * Math.sin(yNorm * Math.PI * 0.5);
          const worldY = TERRAIN_Y_OFFSET + (groundHeight + 0.015) * (state.terrainHeight * 5);

          dispatch({
            type: 'ADD_ITEM',
            payload: {
              id: Date.now() + idx + Math.random(),
              productId: obj.matchedProduct.id,
              name: obj.matchedProduct.name,
              modelType: obj.matchedProduct.model_path,
              price: Number(obj.matchedProduct.unit_price || 0),
              position: { x: worldX, y: worldY, z: worldZ },
              rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
              scale: { x: obj.scale, y: obj.scale, z: obj.scale },
              autoDetected: true, // flag for UI
            },
          });
        });

        // 3. UI Feedback
        setAnalysisResult({ added: validObjects.length, ignored: ignoredCount });
        setTimeout(() => setAnalysisResult(null), 8000);

        console.log(`Auto-placed ${validObjects.length} objects, ignored ${ignoredCount}`);
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to generate terrain.' });
      dispatch({ type: 'SET_DEPTH_DATA', payload: null });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ── Terrain click — confirm placement if in placing mode ──
  const handleTerrainClick = useCallback((e) => {
    if (isPlacing && state.previewValid) {
      // Quick-confirm: clicking terrain while placing = confirm
      dispatch({ type: 'CONFIRM_PLACEMENT' });
      return;
    }

    // If not placing and a product is selected (legacy fallback — shouldn't happen now)
    // Do nothing — placement is now handled via preview mode
  }, [isPlacing, state.previewValid, dispatch]);

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      // Placement-mode keys are handled by PlacementControls
      if (isPlacing) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedItemId) {
          dispatch({ type: 'REMOVE_ITEM', payload: state.selectedItemId });
        }
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'DESELECT_ALL' });
        dispatch({ type: 'SELECT_PRODUCT', payload: null });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.selectedItemId, dispatch, isPlacing]);

  const fogColor = useMemo(() => {
    if (state.timeOfDay < 7 || state.timeOfDay > 19) return '#1a1a2e';
    if (state.timeOfDay < 9 || state.timeOfDay > 17) return '#ff9a76';
    return '#d4e4f7';
  }, [state.timeOfDay]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900 font-sans">
      
      {/* ── CENTER: 3D CANVAS (Full screen behind panels) ── */}
      <div className="absolute inset-0 z-0" id="canvas-container">
        <ErrorBoundary onReset={() => window.location.reload()}>
          <Canvas
            ref={canvasRef} shadows dpr={[1, 2]}
            camera={{ position: [0, 12, 22], fov: 50, near: 0.1, far: 200 }}
            gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9,
                  antialias: true, powerPreference: 'high-performance' }}
          >
          <color attach="background" args={[fogColor]} />
          <fog attach="fog" args={[fogColor, 30, 100]} />

          <ambientLight intensity={0.5} color="#fff8dc" />
          <hemisphereLight args={[fogColor, '#2d2d44', 0.4]} position={[0, 50, 0]} />
          <SunLight timeOfDay={state.timeOfDay} />
          <directionalLight position={[-20, 15, -20]} intensity={0.6} color="#fff5e6" />

          <DynamicSky timeOfDay={state.timeOfDay} />
          <Environment preset="park" background={false} />

          <Suspense fallback={
            <Html center>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg font-bold text-slate-700 dark:text-slate-200 animate-pulse">Generating terrain...</div>
            </Html>
          }>
            {state.depthData && state.originalImageUrl && (
              <GardenBackground
                ref={terrainRef}
                originalImageUrl={state.originalImageUrl}
                depthMapUrl={getMediaUrl(state.depthData.depth_map_url)}
                normalMapUrl={getMediaUrl(state.depthData.normal_map_url)}
                rockMaskUrl={getMediaUrl(state.depthData.rock_mask_url)}
                grassMaskUrl={getMediaUrl(state.depthData.grass_mask_url)}
                heightScale={state.terrainHeight}
                onTerrainClick={handleTerrainClick}
              />
            )}

            {/* Placed items — hide the one being edited */}
            {state.placedItems.map(item => (
              item.id === state.editingItemId ? null : (
                <PlacedObject key={item.id} item={item} />
              )
            ))}

            {/* Placement preview (only during placing/editing mode) */}
            {isPlacing && (
              <PlacementPreview terrainRef={terrainRef} />
            )}
          </Suspense>



          <EffectComposer disableNormalPass multisampling={4}>
            <SSAO radius={12} intensity={1.8} luminanceInfluence={0.7} samples={12} />
            <Bloom luminanceThreshold={0.75} intensity={0.3} mipmapBlur levels={6} />
            <Vignette eskil={false} offset={0.12} darkness={0.5} />
          </EffectComposer>

          <OrbitControls makeDefault enablePan={!isPlacing} enableZoom enableRotate
            panSpeed={0.5} zoomSpeed={0.6} rotateSpeed={0.4}
            minPolarAngle={0.1} maxPolarAngle={Math.PI / 2.1}
            minDistance={5} maxDistance={80}
            enableDamping dampingFactor={0.1}
          />
          <Preload all />
          </Canvas>
        </ErrorBoundary>

        {/* Placement controls overlay */}
        {isPlacing && <PlacementControls />}

        {state.loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-bold text-lg drop-shadow-md">Creating your 3D garden...</p>
          </div>
        )}
      </div>

      {/* ── LEFT PANEL (Floating) ── */}
      <div className="absolute top-4 left-4 z-10 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 p-5 flex flex-col gap-4 pointer-events-auto">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 6, color: '#10b981' }}>
            <path d="M7 20h10"/>
            <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
          </svg>
          Garden Studio
        </h3>

        {/* Upload */}
        <label className="flex items-center justify-center w-full px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl cursor-pointer font-bold transition-all shadow-sm">
          <Upload size={18} className="mr-2" />
          Upload Garden Photo
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                 onChange={handleImageUpload} disabled={state.loading} hidden />
        </label>

        {/* Image previews */}
        {state.originalImageUrl && (
          <div className="flex gap-2">
            <img src={state.originalImageUrl} alt="Original" className="w-1/2 h-24 object-cover rounded-xl shadow-inner border border-slate-200 dark:border-slate-700" />
            {state.depthData?.depth_map_url && (
              <img src={getMediaUrl(state.depthData.depth_map_url)} alt="Depth" className="w-1/2 h-24 object-cover rounded-xl shadow-inner border border-slate-200 dark:border-slate-700" style={{ filter: 'grayscale(100%)' }} />
            )}
          </div>
        )}

        {state.loading && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Analyzing terrain...</p>
          </div>
        )}
        {state.error && (
          <div className="error" role="alert">
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            {state.error}
            <button onClick={() => dispatch({ type: 'SET_ERROR', payload: '' })}
                    className="error-dismiss">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Terrain controls */}
        {state.depthData && (
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <label className="block">
              <span className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <Mountain size={14} className="mr-1.5" />
                Terrain Height: <span className="ml-auto text-emerald-600 dark:text-emerald-400">{state.terrainHeight.toFixed(1)}m</span>
              </span>
              <input type="range" min="0.5" max="5" step="0.1" value={state.terrainHeight}
                     onChange={e => dispatch({ type: 'SET_TERRAIN_HEIGHT', payload: +e.target.value })} 
                     className="w-full accent-emerald-500" />
            </label>
            <label className="block">
              <span className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <Sun size={14} className="mr-1.5" />
                Time of Day: <span className="ml-auto text-emerald-600 dark:text-emerald-400">{state.timeOfDay}:00</span>
              </span>
              <input type="range" min="6" max="20" step="1" value={state.timeOfDay}
                     onChange={e => dispatch({ type: 'SET_TIME_OF_DAY', payload: +e.target.value })} 
                     className="w-full accent-emerald-500" />
            </label>
          </div>
        )}

        {/* Analysis Result Feedback */}
        {analysisResult && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl mt-4 text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
            <p className="font-bold mb-1 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Analysis Complete
            </p>
            <p>Added <strong>{analysisResult.added}</strong> matching plants from inventory.</p>
            {analysisResult.ignored > 0 && (
              <p className="text-amber-600 dark:text-amber-400 mt-1">Ignored <strong>{analysisResult.ignored}</strong> unrecognized or missing items.</p>
            )}
          </div>
        )}

        {/* Asset library */}
        {state.depthData && <AssetLibrarySidebar />}
      </div>

      {/* ── RIGHT PANEL (Floating) ── */}
      <div className="absolute top-4 right-4 z-10 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar flex flex-col gap-4 pointer-events-auto">
        <SaveLoadPanel />
        <ObjectTransformPanel />
        <CostEstimatePanel />
        <InventoryList />
      </div>
    </div>
  );
}