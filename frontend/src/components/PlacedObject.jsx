import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, ContactShadows } from '@react-three/drei';
import { useDesign } from '../context/DesignContext';
import * as THREE from 'three';
// Import your existing NormalizedModel component
import NormalizedModel from './NormalizedModel';

export default function PlacedObject({ item }) {
  const { state, dispatch } = useDesign();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  const isSelected = state.selectedItemId === item.id;
  const isPlacing = state.placementMode !== 'idle';

  // --- Scale Logic (User Multiplier) ---
  const rawScale = item.scale?.x ?? item.scale ?? 1;
  const objScale = Number.isFinite(rawScale) ? rawScale : 1;

  // --- Position & Rotation Logic (NaN Safety) ---
  const pos = [
    item.position?.x ?? 0,
    item.position?.y ?? 0,
    item.position?.z ?? 0,
  ];

  const rot = [
    item.rotation?.x ?? 0,
    item.rotation?.y ?? 0,
    item.rotation?.z ?? 0,
  ];

  // --- Backend Path Logic ---
  // prioritize the new Django model_file URL
  const modelUrl = item.model_file || item.modelPath || item.modelType;

  // Smooth hover effect using lerp
  useFrame(() => {
    if (groupRef.current) {
      const target = hovered ? 1.05 : 1.0;
      groupRef.current.scale.lerp(
        new THREE.Vector3(objScale * target, objScale * target, objScale * target),
        0.1
      );
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isPlacing) return;
    dispatch({ type: 'SELECT_ITEM', payload: item.id });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    dispatch({ type: 'START_EDITING', payload: item.id });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_ITEM', payload: item.id });
  };

  return (
    <group
      ref={groupRef}
      position={pos}
      rotation={rot}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* 
          Using your separate NormalizedModel component.
          It handles the Box3 math, grounding, and category-based sizing internally.
      */}
      <NormalizedModel
        url={modelUrl}
        category={item.category}
      />

      {/* Grounding Shadow: sits slightly above the floor to avoid flickering */}
      <ContactShadows
        position={[0, 0.01, 0]}
        scale={4 * objScale}
        blur={2.5}
        far={1}
        opacity={0.5}
        color="#222"
      />

      {/* Selection UI Elements */}
      {isSelected && (
        <>
          {/* Green selection ring on the floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.5, 0.55, 32]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>

          {/* Action buttons (Move/Delete) */}
          {!isPlacing && (
            <Html position={[0, 2.2, 0]} center distanceFactor={10}>
              <div className="flex gap-2 bg-white/95 p-2 rounded-full shadow-xl backdrop-blur-md border border-gray-100 ring-1 ring-black/5">
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-emerald-50 rounded-full text-emerald-600 transition-all active:scale-95"
                  title="Move Object"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 9l4-4 4 4M19 15l-4 4-4-4M9 5v14M15 19V5" />
                  </svg>
                </button>
                <div className="w-px h-6 bg-gray-200 my-auto" />
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-all active:scale-95"
                  title="Delete Object"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}