import { useCallback, useEffect, useRef, useState } from 'react';
import { useDesign } from '../context/DesignContext';
import { patchItemRotation } from '../services/api';
import {
  RotateCw, X, Save, Compass, RotateCcw, CheckCircle2
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   OBJECT TRANSFORM PANEL
   
   Shows when an object is selected. Provides:
   - Y-axis rotation slider (degrees 0–360 → radians for Three.js)
   - Quick rotation buttons (±15°, ±45°, ±90°)
   - Object info (name, position, scale)
   - Save rotation to Django backend via PATCH
   ═══════════════════════════════════════════════════════════════ */

// ── Conversion helpers ────────────────────────────────────────
const radToDeg = (rad) => ((rad * 180) / Math.PI) % 360;
const degToRad = (deg) => (deg * Math.PI) / 180;

// Normalize to 0–360 range
const normalizeDeg = (deg) => ((deg % 360) + 360) % 360;

export default function ObjectTransformPanel() {
  const { state, dispatch } = useDesign();
  const { placedItems, selectedItemId, placementMode } = state;
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saved' | 'error'
  const saveTimeoutRef = useRef(null);

  // Find the selected item
  const selectedItem = placedItems.find(i => i.id === selectedItemId);

  // Cleanup timeout on unmount (Must be called before any early returns to obey Rules of Hooks)
  useEffect(() => {
    return () => clearTimeout(saveTimeoutRef.current);
  }, []);

  // Don't render if nothing selected or in placement mode
  if (!selectedItem || placementMode !== 'idle') return null;

  let rawRotY = selectedItem.rotation?.y;
  if (typeof rawRotY === 'string') rawRotY = parseFloat(rawRotY);
  const currentRadians = Number.isFinite(rawRotY) ? rawRotY : 0;
  const currentDegrees = normalizeDeg(radToDeg(currentRadians));

  // ── Update rotation (Y-axis only) ──────────────────────────
  const updateRotation = (newDegrees) => {
    const normalized = normalizeDeg(newDegrees);
    const newRadians = degToRad(normalized);

    dispatch({
      type: 'UPDATE_ITEM',
      payload: {
        id: selectedItem.id,
        updates: {
          rotation: {
            x: selectedItem.rotation?.x || 0,
            y: newRadians,
            z: selectedItem.rotation?.z || 0,
          },
        },
      },
    });

    // Clear any pending save status
    setSaveStatus('');
  };

  // ── Slider handler ─────────────────────────────────────────
  const handleSliderChange = (e) => {
    updateRotation(Number(e.target.value));
  };

  // ── Quick rotate buttons ───────────────────────────────────
  const rotateBy = (deltaDeg) => {
    updateRotation(currentDegrees + deltaDeg);
  };

  // ── Persist to Django backend ──────────────────────────────
  const handleSaveRotation = async () => {
    if (!selectedItem.productId) {
      setSaveStatus('saved'); // Local-only item, just mark as saved
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveStatus(''), 2500);
      return;
    }

    setSaving(true);
    setSaveStatus('');
    try {
      await patchItemRotation(selectedItem.productId, selectedItem.id, {
        rotation_y: selectedItem.rotation?.y || 0,
      });
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save rotation:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const pos = selectedItem.position;
  const scale = selectedItem.scale?.x || selectedItem.scale || 1;

  return (
    <div className="transform-panel" id="transform-panel">
      <h3>
        <Compass size={15} style={{ marginRight: 6, verticalAlign: 'middle', color: '#8b5cf6' }} />
        Transform
      </h3>

      {/* Object info */}
      <div className="transform-object-info">
        <span className="transform-object-name">{selectedItem.name}</span>
        {selectedItem.autoDetected && (
          <span className="transform-auto-badge">Auto-detected</span>
        )}
      </div>

      {/* ── Y-Axis Rotation ──────────────────────────────────── */}
      <div className="transform-section">
        <div className="transform-section-header">
          <RotateCw size={13} style={{ color: '#8b5cf6' }} />
          <span>Y-Axis Rotation</span>
          <span className="transform-value">{Math.round(currentDegrees)}°</span>
        </div>

        {/* Rotation slider */}
        <div className="rotation-slider-wrap">
          <input
            type="range"
            className="rotation-slider"
            min="0"
            max="360"
            step="1"
            value={Math.round(currentDegrees)}
            onChange={handleSliderChange}
            id="rotation-y-slider"
          />
          <div className="rotation-slider-labels">
            <span>0°</span>
            <span>90°</span>
            <span>180°</span>
            <span>270°</span>
            <span>360°</span>
          </div>
        </div>

        {/* Degree input */}
        <div className="rotation-input-row">
          <label className="rotation-input-label">Degrees:</label>
          <input
            type="number"
            className="rotation-degree-input"
            min="0"
            max="360"
            step="1"
            value={Math.round(currentDegrees)}
            onChange={(e) => updateRotation(Number(e.target.value))}
            id="rotation-y-input"
          />
          <span className="rotation-unit">°</span>
        </div>

        {/* Quick rotation buttons */}
        <div className="rotation-quick-btns">
          <button onClick={() => rotateBy(-90)} title="Rotate -90°" className="rot-quick-btn">
            <RotateCcw size={11} /> -90°
          </button>
          <button onClick={() => rotateBy(-45)} title="Rotate -45°" className="rot-quick-btn">
            -45°
          </button>
          <button onClick={() => rotateBy(-15)} title="Rotate -15°" className="rot-quick-btn">
            -15°
          </button>
          <button onClick={() => rotateBy(15)} title="Rotate +15°" className="rot-quick-btn">
            +15°
          </button>
          <button onClick={() => rotateBy(45)} title="Rotate +45°" className="rot-quick-btn">
            +45°
          </button>
          <button onClick={() => rotateBy(90)} title="Rotate +90°" className="rot-quick-btn">
            <RotateCw size={11} /> +90°
          </button>
        </div>

        {/* Reset rotation */}
        <button
          className="rotation-reset-btn"
          onClick={() => updateRotation(0)}
          title="Reset rotation to 0°"
        >
          <X size={12} />
          Reset to 0°
        </button>
      </div>

      {/* ── Position (read-only info) ────────────────────────── */}
      <div className="transform-section transform-info-section">
        <div className="transform-section-header">
          <span>Position</span>
        </div>
        <div className="transform-coords">
          <span className="coord-item">
            <span className="coord-label">X</span>
            <span className="coord-value">{Number(pos?.x || 0).toFixed(2)}</span>
          </span>
          <span className="coord-item">
            <span className="coord-label">Y</span>
            <span className="coord-value">{Number(pos?.y || 0).toFixed(2)}</span>
          </span>
          <span className="coord-item">
            <span className="coord-label">Z</span>
            <span className="coord-value">{Number(pos?.z || 0).toFixed(2)}</span>
          </span>
        </div>
      </div>

      {/* ── Scale (read-only info) ───────────────────────────── */}
      <div className="transform-section transform-info-section">
        <div className="transform-section-header">
          <span>Scale</span>
          <span className="transform-value">{Number(scale || 1).toFixed(2)}</span>
        </div>
      </div>

      {/* ── Save to Backend ──────────────────────────────────── */}
      <button
        className="rotation-save-btn"
        onClick={handleSaveRotation}
        disabled={saving}
      >
        {saving ? (
          <><span className="spin-icon"><RotateCw size={13} /></span> Saving...</>
        ) : saveStatus === 'saved' ? (
          <><CheckCircle2 size={13} /> Saved!</>
        ) : (
          <><Save size={13} /> Save Rotation</>
        )}
      </button>

      {saveStatus === 'error' && (
        <p className="rotation-save-error">Failed to save — check connection</p>
      )}

      {/* ── Math reference (dev hint) ────────────────────────── */}
      <div className="transform-math-hint">
        <span>
          {Math.round(currentDegrees)}° = {currentRadians.toFixed(4)} rad
        </span>
      </div>
    </div>
  );
}
