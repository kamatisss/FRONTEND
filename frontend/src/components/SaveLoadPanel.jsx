import { useState, useEffect } from 'react';
import { useDesign } from '../context/DesignContext';
import { saveDesign, listDesigns, loadDesign, deleteDesign, submitDesign } from '../services/api';
import {
  Save, FolderOpen, Sparkles, X, Loader, HardDrive, Send
} from 'lucide-react';

export default function SaveLoadPanel() {
  const { state, dispatch, totalCost } = useDesign();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmitForReview = async () => {
    if (!state.designId) {
      setMessage('Please save the design first.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setSubmitting(true);
    try {
      await submitDesign(state.designId);
      setMessage('Design submitted for review!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch saved designs when modal opens
  useEffect(() => {
    if (showModal) {
      fetchDesigns();
    }
  }, [showModal]);

  const fetchDesigns = async () => {
    setLoadingList(true);
    try {
      const designs = await listDesigns();
      dispatch({ type: 'SET_SAVED_DESIGNS', payload: designs });
    } catch (err) {
      console.error('Failed to load designs:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        id: state.designId || undefined,
        name: state.designName,
        original_image_url: state.originalImageUrl || '',
        depth_data: state.depthData || {},
        placed_items: state.placedItems.map(item => ({
          product_id: item.productId,
          name: item.name,
          model_type: item.modelType,
          price: item.price,
          position: item.position,
          rotation: item.rotation,
          scale: item.scale,
        })),
        dimensions: state.dimensions,
        total_cost: totalCost,
        terrain_height: state.terrainHeight,
        time_of_day: state.timeOfDay,
      };

      const result = await saveDesign(payload);
      dispatch({ type: 'SET_DESIGN_META', payload: { designId: result.id } });
      dispatch({ type: 'MARK_CLEAN' });
      setMessage('Design saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (id) => {
    try {
      const design = await loadDesign(id);
      dispatch({
        type: 'LOAD_DESIGN',
        payload: {
          designId: design.id,
          designName: design.name,
          depthData: design.depth_data,
          placedItems: (design.placed_items || []).map((item, idx) => ({
            id: Date.now() + idx,
            productId: item.product_id,
            name: item.name,
            modelType: item.model_type,
            price: item.price,
            position: item.position,
            rotation: item.rotation,
            scale: item.scale,
          })),
          dimensions: design.dimensions || { width: 10, length: 15, terrainType: 'flat' },
          terrainHeight: design.terrain_height || 1.5,
          timeOfDay: design.time_of_day || 14,
        },
      });
      setShowModal(false);
      setMessage('Design loaded!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Load failed: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this design?')) return;
    try {
      await deleteDesign(id);
      fetchDesigns();
    } catch (err) {
      setMessage('Delete failed');
    }
  };

  const handleNew = () => {
    if (state.isDirty && !confirm('Unsaved changes will be lost. Continue?')) return;
    dispatch({ type: 'RESET' });
    setMessage('');
  };

  return (
    <div className="save-load-panel">
      <h3>
        <HardDrive size={15} style={{ marginRight: 6, verticalAlign: 'middle', color: '#10b981' }} />
        Designs
      </h3>

      {/* Design name */}
      <input
        type="text"
        className="design-name-input"
        value={state.designName}
        onChange={e => dispatch({ type: 'SET_DESIGN_META', payload: { designName: e.target.value } })}
        placeholder="Design name..."
      />

      {/* Action buttons */}
      <div className="save-load-actions">
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader size={13} className="spin-icon" style={{ marginRight: 4 }} /> Saving...</>
          ) : (
            <><Save size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Save</>
          )}
        </button>
        <button className="load-btn" onClick={() => setShowModal(true)}>
          <FolderOpen size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Load
        </button>
        <button className="new-btn" onClick={handleNew}>
          <Sparkles size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          New
        </button>
        {state.designId && (
          <button className="submit-btn" onClick={handleSubmitForReview} disabled={submitting || state.isDirty} style={{ background: '#3b82f6', color: 'white' }}>
            <Send size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        )}
      </div>

      {/* Status */}
      {message && <p className="save-message">{message}</p>}
      {state.isDirty && <p className="unsaved-indicator">● Unsaved changes</p>}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FolderOpen size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Saved Designs
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {loadingList && <p>Loading...</p>}
              {!loadingList && state.savedDesigns.length === 0 && <p>No saved designs yet</p>}
              {state.savedDesigns.map(d => (
                <div key={d.id} className="saved-design-item">
                  <div className="saved-design-info">
                    <span className="saved-name">{d.name}</span>
                    <span className="saved-meta">
                      ₱{Number(d.total_cost).toLocaleString()} · {new Date(d.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="saved-design-actions">
                    <button onClick={() => handleLoad(d.id)}>Open</button>
                    <button className="delete" onClick={() => handleDelete(d.id)}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
