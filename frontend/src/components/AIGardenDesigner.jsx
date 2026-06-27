import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, ArrowLeft, Check, Compass, ShieldAlert, Upload, X } from 'lucide-react';
import ThreeGardenCanvas from './ThreeGardenCanvas';
import { useDesign } from '../context/DesignContext';

const AVAILABLE_PLANTS = [
  { id: 'tree_oak', name: 'Oak Tree', price: 1200, emoji: '🌳', type: 'Tree' },
  { id: 'flower_rose', name: 'Rose', price: 150, emoji: '🌹', type: 'Flower' },
  { id: 'shrub_fern', name: 'Fern', price: 250, emoji: '🌿', type: 'Shrub' },
  { id: 'tree_palm', name: 'Palm Tree', price: 800, emoji: '🌴', type: 'Tree' },
  { id: 'flower_lavender', name: 'Lavender', price: 180, emoji: '💜', type: 'Flower' },
  { id: 'shrub_boxwood', name: 'Boxwood', price: 300, emoji: '🫧', type: 'Shrub' },
  { id: 'plant_bamboo', name: 'Bamboo', price: 450, emoji: '🎋', type: 'Plant' },
  { id: 'plant_banana', name: 'Banana Plant', price: 350, emoji: '🍌', type: 'Plant' },
];

const BotanicalSVG = () => (
  <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
    {/* Large fern left */}
    <g transform="translate(60, 180)">
      {[-40,-25,-10,5,20,35,50].map((angle, i) => (
        <ellipse key={i} rx="38" ry="8" cx={Math.sin((angle*Math.PI)/180)*i*10} cy={-i*18}
          transform={`rotate(${angle})`} fill="#6B9E5A" />
      ))}
    </g>
    {/* Tree silhouette center-left */}
    <g transform="translate(200, 200)">
      <rect x="-5" y="-80" width="10" height="80" fill="#5C4033" />
      <circle cx="0" cy="-90" r="45" fill="#4A7A3A" />
      <circle cx="-25" cy="-75" r="30" fill="#3D6B2E" />
      <circle cx="28" cy="-72" r="33" fill="#4A7A3A" />
    </g>
    {/* Flowers scattered */}
    {[350, 420, 490, 560].map((x, i) => (
      <g key={i} transform={`translate(${x}, ${170 - i * 10})`}>
        <rect x="-2" y="-30" width="4" height="30" fill="#6B8F5A" />
        <circle cx="0" cy="-35" r="10" fill={['#E8A87C','#D4A5C9','#F0C060','#A8D5A2'][i]} />
      </g>
    ))}
    {/* Palm right */}
    <g transform="translate(680, 200)">
      <rect x="-4" y="-100" width="8" height="100" fill="#7A5C33" transform="rotate(5)" />
      {[-60,-30,0,30,60,90].map((angle, i) => (
        <ellipse key={i} rx="50" ry="6" cx="0" cy="-105"
          transform={`rotate(${angle})`} fill="#3D7A2E" />
      ))}
    </g>
    {/* Shrubs right area */}
    <circle cx="770" cy="185" r="28" fill="#4A7A3A" />
    <circle cx="790" cy="192" r="20" fill="#5C9440" />
    {/* Ground line */}
    <rect x="0" y="195" width="800" height="5" fill="#3D5C2E" rx="2" />
  </svg>
);

export default function AIGardenDesigner() {
  const navigate = useNavigate();
  const { dispatch } = useDesign();

  const [budget, setBudget] = useState(5000);

  const handleDesignManually = () => {
    dispatch({ type: 'RESET' });
    navigate('/studio');
  };
  const [lotWidth, setLotWidth] = useState(10.0);
  const [lotLength, setLotLength] = useState(10.0);
  const [preferredPlants, setPreferredPlants] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLayouts, setGeneratedLayouts] = useState([]);
  const [activeLayout, setActiveLayout] = useState(null);
  const [activeView, setActiveView] = useState('3d');

  const handleTogglePlant = (id) => {
    setPreferredPlants(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleGenerateDesigns = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const headers = {};
    const storedAuth = localStorage.getItem('authTokens');
    if (storedAuth) {
      try {
        const tokens = JSON.parse(storedAuth);
        if (tokens?.access) headers['Authorization'] = `Bearer ${tokens.access}`;
      } catch (err) { console.error(err); }
    }
    const formData = new FormData();
    formData.append('budget', Number(budget));
    formData.append('lot_width', Number(lotWidth));
    formData.append('lot_length', Number(lotLength));
    formData.append('preferred_plant_ids', JSON.stringify(preferredPlants));
    if (selectedImage) formData.append('image', selectedImage);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-layouts/`, formData, { headers });
      if (response.data?.designs) setGeneratedLayouts(response.data.designs);
      else throw new Error("Invalid response format");
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLayout = (layout) => setActiveLayout(layout);
  const handleReset = () => { setGeneratedLayouts([]); setError(''); setActiveLayout(null); };

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #F7F3EC 0%, #EAF0E4 60%, #F0EBE0 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '2rem 1rem',
    },
    container: {
      maxWidth: '900px',
      margin: '0 auto',
    },
    hero: {
      position: 'relative',
      background: 'linear-gradient(135deg, #1A2E1A 0%, #2D4A2D 60%, #1E3A1E 100%)',
      borderRadius: '24px 24px 0 0',
      padding: '3rem 2.5rem 5rem',
      overflow: 'hidden',
      marginBottom: '-2.5rem',
    },
    heroTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(201,136,58,0.18)',
      border: '1px solid rgba(201,136,58,0.35)',
      color: '#C9883A',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      padding: '5px 14px',
      borderRadius: '100px',
      marginBottom: '1.25rem',
    },
    heroTitle: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 800,
      color: '#F7F3EC',
      lineHeight: 1.15,
      margin: '0 0 0.75rem',
      letterSpacing: '-0.02em',
    },
    heroTitleAccent: {
      color: '#8FAF7E',
      fontStyle: 'italic',
    },
    heroSub: {
      color: 'rgba(247,243,236,0.6)',
      fontSize: '0.9rem',
      maxWidth: '440px',
      lineHeight: 1.6,
      margin: 0,
    },
    card: {
      background: '#FFFFFF',
      borderRadius: '0 0 24px 24px',
      padding: '3.5rem 2.5rem 2.5rem',
      boxShadow: '0 20px 60px rgba(26,46,26,0.1), 0 4px 16px rgba(26,46,26,0.06)',
    },
    sectionLabel: {
      display: 'block',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#8FAF7E',
      marginBottom: '8px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    inputWrapper: {
      position: 'relative',
    },
    inputPrefix: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#8FAF7E',
      fontWeight: 700,
      fontSize: '0.95rem',
      pointerEvents: 'none',
      zIndex: 1,
    },
    input: {
      width: '100%',
      background: '#F7F3EC',
      border: '1.5px solid #E8E1D4',
      borderRadius: '12px',
      padding: '13px 16px',
      fontSize: '0.95rem',
      fontWeight: 600,
      color: '#1A2E1A',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box',
    },
    inputWithPrefix: {
      paddingLeft: '28px',
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.75rem',
    },
    divider: {
      border: 'none',
      borderTop: '1.5px solid #EDE8DF',
      margin: '1.75rem 0',
    },
    uploadZone: {
      border: '2px dashed #D4CAB8',
      borderRadius: '14px',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: '#FDFAF6',
      display: 'block',
    },
    uploadIcon: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #2D4A2D, #4A7A3A)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 12px',
    },
    plantsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '10px',
    },
    plantCard: (isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 14px',
      borderRadius: '12px',
      border: isSelected ? '2px solid #4A7A3A' : '1.5px solid #E8E1D4',
      background: isSelected ? 'linear-gradient(135deg, #F0F7ED, #EAF4E4)' : '#FDFAF6',
      cursor: 'pointer',
      transition: 'all 0.18s',
      boxShadow: isSelected ? '0 4px 16px rgba(74,122,58,0.15)' : 'none',
    }),
    plantEmoji: {
      fontSize: '1.5rem',
      lineHeight: 1,
    },
    plantInfo: {
      flex: 1,
    },
    plantName: (isSelected) => ({
      fontWeight: 700,
      fontSize: '0.8rem',
      color: isSelected ? '#2D4A2D' : '#3A3A3A',
      display: 'block',
    }),
    plantPrice: (isSelected) => ({
      fontSize: '0.72rem',
      color: isSelected ? '#4A7A3A' : '#9A9080',
      fontWeight: 600,
      marginTop: '2px',
      display: 'block',
    }),
    plantCheck: {
      width: '18px',
      height: '18px',
      background: '#4A7A3A',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    submitBtn: {
      width: '100%',
      padding: '15px 24px',
      background: 'linear-gradient(135deg, #2D4A2D 0%, #4A7A3A 100%)',
      color: '#F7F3EC',
      fontWeight: 700,
      fontSize: '0.95rem',
      border: 'none',
      borderRadius: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 8px 24px rgba(45,74,45,0.25)',
      transition: 'all 0.2s',
      marginTop: '1.75rem',
      letterSpacing: '0.01em',
    },
    secondaryBtn: {
      width: '100%',
      padding: '15px 24px',
      background: 'transparent',
      color: '#2D4A2D',
      fontWeight: 700,
      fontSize: '0.95rem',
      border: '2px solid #2D4A2D',
      borderRadius: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.2s',
      marginTop: '1rem',
      letterSpacing: '0.01em',
    },
    errorBox: {
      background: '#FEF2F2',
      border: '1.5px solid #FECACA',
      borderRadius: '12px',
      padding: '14px 16px',
      display: 'flex',
      gap: '12px',
      marginBottom: '1.5rem',
      color: '#991B1B',
    },
    loadingWrap: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 2rem',
      gap: '1.5rem',
    },
    spinner: {
      width: '56px',
      height: '56px',
      border: '4px solid #EAF0E4',
      borderTop: '4px solid #4A7A3A',
      borderRadius: '50%',
      animation: 'spin 0.9s linear infinite',
    },
    resultsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.75rem',
    },
    resultsTitle: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#1A2E1A',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.8rem',
      fontWeight: 700,
      color: '#8FAF7E',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px 14px',
      borderRadius: '8px',
      transition: 'all 0.15s',
    },
    layoutsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '1.25rem',
    },
    layoutCard: {
      background: '#FFFFFF',
      border: '1.5px solid #E8E1D4',
      borderRadius: '18px',
      overflow: 'hidden',
      transition: 'all 0.25s',
      boxShadow: '0 2px 12px rgba(26,46,26,0.06)',
    },
    layoutCardTop: {
      background: 'linear-gradient(135deg, #1A2E1A 0%, #2D4A2D 100%)',
      padding: '1.5rem',
    },
    layoutBadge: {
      fontSize: '9px',
      fontWeight: 800,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: '#8FAF7E',
      background: 'rgba(143,175,126,0.15)',
      border: '1px solid rgba(143,175,126,0.25)',
      borderRadius: '100px',
      padding: '3px 10px',
      display: 'inline-block',
      marginBottom: '10px',
    },
    layoutName: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '1.15rem',
      fontWeight: 800,
      color: '#F7F3EC',
      margin: '0 0 8px',
    },
    layoutCost: {
      fontSize: '1.6rem',
      fontWeight: 800,
      color: '#C9883A',
      fontFamily: "'Playfair Display', Georgia, serif",
    },
    layoutBody: {
      padding: '1.25rem 1.5rem 1.5rem',
    },
    plantListLabel: {
      fontSize: '9px',
      fontWeight: 800,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#9A9080',
      marginBottom: '10px',
      display: 'block',
    },
    plantItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #F0EBE0',
    },
    plantItemName: {
      fontSize: '0.8rem',
      fontWeight: 600,
      color: '#2D2D2D',
    },
    plantItemCoord: {
      fontSize: '0.68rem',
      fontWeight: 600,
      color: '#9A9080',
      background: '#F5F0E8',
      padding: '2px 8px',
      borderRadius: '6px',
      fontFamily: 'monospace',
    },
    selectBtn: {
      width: '100%',
      padding: '11px 20px',
      background: 'linear-gradient(135deg, #2D4A2D 0%, #4A7A3A 100%)',
      color: '#F7F3EC',
      fontWeight: 700,
      fontSize: '0.83rem',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      marginTop: '1.25rem',
      letterSpacing: '0.02em',
      transition: 'all 0.18s',
    },
    previewPanel: {
      marginTop: '2rem',
      background: '#F7F3EC',
      border: '1.5px solid #E8E1D4',
      borderRadius: '18px',
      padding: '1.75rem',
    },
    previewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.25rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    previewTitle: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '1.2rem',
      fontWeight: 800,
      color: '#1A2E1A',
      margin: '0 0 4px',
    },
    previewSub: {
      fontSize: '0.75rem',
      color: '#8A7E6E',
      margin: 0,
    },
    previewCostBadge: {
      background: 'linear-gradient(135deg, #C9883A, #D4A860)',
      color: '#FFFFFF',
      fontWeight: 800,
      fontSize: '0.85rem',
      padding: '8px 18px',
      borderRadius: '100px',
      whiteSpace: 'nowrap',
    },
    canvasPlaceholder: {
      background: '#EAF0E4',
      borderRadius: '12px',
      height: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6B9E5A',
      fontWeight: 600,
      fontSize: '0.9rem',
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .garden-input:focus { border-color: #4A7A3A !important; box-shadow: 0 0 0 3px rgba(74,122,58,0.12) !important; }
        .upload-zone:hover { border-color: #8FAF7E !important; background: #F5FAF0 !important; }
        .plant-card:hover { transform: translateY(-1px); }
        .layout-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(26,46,26,0.14) !important; }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(45,74,45,0.35) !important; }
        .secondary-btn:hover { background: #EAF0E4 !important; }
        .back-btn:hover { background: #EAF0E4 !important; color: #2D4A2D !important; }
        .select-btn:hover { opacity: 0.88; }
        .fade-in { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div className="w-full min-h-screen flex flex-col items-center justify-start bg-[#f6f6f4] py-6 px-4 md:px-8" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="w-full max-w-6xl flex flex-col gap-6">

          {/* Hero Banner */}
          <div style={styles.hero}>
            <BotanicalSVG />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={styles.heroTag}>
                <Compass size={11} />
                AI-Powered · 3D Visualization
              </div>
              <h1 style={styles.heroTitle}>
                Design your <span style={styles.heroTitleAccent}>dream garden</span><br />
                in three dimensions.
              </h1>
              <p style={styles.heroSub}>
                Set your budget, define the lot, pick your flora — and let the AI compose a garden layout tailored to your space.
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div style={styles.card}>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '3px' }}>Generation failed</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{error}</div>
                </div>
              </div>
            )}

            {/* FORM */}
            {!loading && generatedLayouts.length === 0 && (
              <form onSubmit={handleGenerateDesigns}>

                {/* Budget + Dimensions */}
                <div style={styles.grid3}>
                  <div style={styles.inputGroup}>
                    <label style={styles.sectionLabel}>Budget (₱)</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputPrefix}>₱</span>
                      <input
                        type="number" min="500" value={budget}
                        onChange={e => setBudget(e.target.value)}
                        className="garden-input"
                        style={{ ...styles.input, paddingLeft: '26px' }}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.sectionLabel}>Lot Width (m)</label>
                    <input
                      type="number" step="0.1" min="1" max="100" value={lotWidth}
                      onChange={e => setLotWidth(e.target.value)}
                      className="garden-input"
                      style={styles.input} required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.sectionLabel}>Lot Length (m)</label>
                    <input
                      type="number" step="0.1" min="1" max="100" value={lotLength}
                      onChange={e => setLotLength(e.target.value)}
                      className="garden-input"
                      style={styles.input} required
                    />
                  </div>
                </div>

                <hr style={styles.divider} />

                {/* Image Upload */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={styles.sectionLabel}>Reference Photo <span style={{ color: '#B0A89A', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <label className="upload-zone" style={{ ...styles.uploadZone, flex: 1 }}>
                      <div style={styles.uploadIcon}>
                        <Upload size={16} color="#8FAF7E" />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#3A3A3A', marginBottom: '4px' }}>
                        Drop a photo of your garden space
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9A9080' }}>
                        PNG, JPG or WEBP · max 5MB
                      </div>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    </label>

                    {imagePreview && (
                      <div style={{ position: 'relative', width: '88px', height: '88px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1.5px solid #E8E1D4' }} className="group">
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button" onClick={handleRemoveImage}
                          style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 700, border: 'none', cursor: 'pointer', gap: '4px' }}
                        >
                          <X size={14} /><span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <hr style={styles.divider} />

                {/* Plant Picker */}
                <div>
                  <label style={styles.sectionLabel}>Preferred Plants <span style={{ color: '#B0A89A', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <div style={styles.plantsGrid}>
                    {AVAILABLE_PLANTS.map(plant => {
                      const isSelected = preferredPlants.includes(plant.id);
                      return (
                        <button
                          key={plant.id} type="button"
                          onClick={() => handleTogglePlant(plant.id)}
                          className="plant-card"
                          style={styles.plantCard(isSelected)}
                        >
                          <span style={styles.plantEmoji}>{plant.emoji}</span>
                          <span style={styles.plantInfo}>
                            <span style={styles.plantName(isSelected)}>{plant.name}</span>
                            <span style={styles.plantPrice(isSelected)}>₱{plant.price.toLocaleString()}</span>
                          </span>
                          {isSelected && (
                            <span style={styles.plantCheck}>
                              <Check size={10} color="#fff" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="submit-btn" style={styles.submitBtn}>
                  <Sparkles size={16} />
                  Generate AI Garden Designs
                </button>

                <button 
                  type="button" 
                  className="secondary-btn" 
                  style={styles.secondaryBtn} 
                  onClick={handleDesignManually}
                >
                  Design Manually from Scratch
                </button>
              </form>
            )}

            {/* Loading */}
            {loading && (
              <div style={styles.loadingWrap}>
                <div style={styles.spinner} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: '1.3rem', color: '#1A2E1A', marginBottom: '8px' }}>
                    Composing your garden…
                  </div>
                  <div style={{ fontSize: '0.83rem', color: '#8A7E6E' }}>
                    Balancing flora, budget, and spatial harmony
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {!loading && generatedLayouts.length > 0 && (
              <div className="fade-in">
                <div style={styles.resultsHeader}>
                  <h2 style={styles.resultsTitle}>
                    <Sparkles size={20} color="#4A7A3A" />
                    Your Garden Options
                  </h2>
                  <button onClick={handleReset} className="back-btn" style={styles.backBtn}>
                    <ArrowLeft size={14} />
                    Adjust parameters
                  </button>
                </div>

                <div style={styles.layoutsGrid}>
                  {generatedLayouts.map((design, index) => (
                    <div key={index} className="layout-card" style={styles.layoutCard}>
                      <div style={styles.layoutCardTop}>
                        <span style={styles.layoutBadge}>Option {index + 1}</span>
                        <h3 style={styles.layoutName}>{design.design_name}</h3>
                        <div style={styles.layoutCost}>₱{design.total_cost.toLocaleString()}</div>
                      </div>
                      <div style={styles.layoutBody}>
                        <span style={styles.plantListLabel}>Flora Arrangement · {design.plants?.length || 0} plants</span>
                        <div>
                          {design.plants?.slice(0, 5).map((plant, pIdx) => {
                            const detail = AVAILABLE_PLANTS.find(p => p.id === plant.plant_id);
                            return (
                              <div key={pIdx} style={styles.plantItem}>
                                <span style={styles.plantItemName}>{detail ? `${detail.emoji} ${detail.name}` : plant.plant_id}</span>
                                <span style={styles.plantItemCoord}>{plant.x.toFixed(1)}, {plant.z.toFixed(1)}</span>
                              </div>
                            );
                          })}
                          {design.plants?.length > 5 && (
                            <div style={{ textAlign: 'center', padding: '10px 0 2px', fontSize: '0.78rem', color: '#8A7E6E', fontWeight: 600 }}>
                              + {design.plants.length - 5} more plants
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleSelectLayout(design)}
                          className="select-btn"
                          style={styles.selectBtn}
                        >
                          View in 3D →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3D / AR Preview */}
                {activeLayout && (
                  <div style={styles.previewPanel} className="fade-in">
                    <div style={styles.previewHeader}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <h3 style={{ ...styles.previewTitle, margin: 0 }}>{activeLayout.design_name}</h3>
                          {/* View Segment Controller */}
                          <div style={{
                            display: 'inline-flex',
                            background: '#EDE8DF',
                            borderRadius: '10px',
                            padding: '3px',
                            gap: '2px',
                          }}>
                            {[
                              { key: '3d', label: 'Interactive 3D Canvas' },
                              { key: 'ar', label: 'Photo Overlay Preview' },
                            ].map(tab => (
                              <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveView(tab.key)}
                                style={{
                                  padding: '5px 13px',
                                  borderRadius: '7px',
                                  border: activeView === tab.key
                                    ? '1.5px solid #4A7A3A'
                                    : '1.5px solid transparent',
                                  cursor: 'pointer',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  transition: 'all 0.2s',
                                  background: activeView === tab.key ? '#2D4A2D' : 'transparent',
                                  color: activeView === tab.key ? '#F7F3EC' : '#9A9080',
                                  letterSpacing: '0.01em',
                                  lineHeight: 1.2,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p style={styles.previewSub}>
                          {activeView === 'ar'
                            ? 'Camera locked to photo perspective · Scroll to zoom'
                            : 'Left click + drag to rotate · Scroll to zoom · Right drag to pan'}
                        </p>
                      </div>
                      <div style={styles.previewCostBadge}>₱{activeLayout.total_cost.toLocaleString()}</div>
                    </div>

                    <div style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', height: '450px' }}>
                      <ThreeGardenCanvas
                        plants={activeLayout.plants}
                        lotWidth={Number(lotWidth)}
                        lotLength={Number(lotLength)}
                        backgroundImageUrl={imagePreview}
                        arMode={activeView === 'ar'}
                      />
                      {activeView === 'ar' && !imagePreview && (
                        <div style={{
                          position: 'absolute',
                          bottom: '16px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(45,74,45,0.85)',
                          color: '#F7F3EC',
                          padding: '8px 20px',
                          borderRadius: '100px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backdropFilter: 'blur(8px)',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                        }}>
                          Upload a garden photo above to enable the overlay effect
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
