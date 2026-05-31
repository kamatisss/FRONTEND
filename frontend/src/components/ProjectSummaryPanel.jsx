import { useState } from 'react';
import { useDesign } from '../context/DesignContext';
import { ClipboardList, Pencil, Trash2, ShoppingCart, X, CreditCard, Loader2 } from 'lucide-react';
import { submitOrder, createCheckoutSession } from '../services/api';

/* ═══════════════════════════════════════════════════════════════════════════
   INLINE STYLES — bypass Tailwind JIT issues
   ═══════════════════════════════════════════════════════════════════════════ */
const P = {
  fab: (open) => ({
    width: 56, height: 56, borderRadius: '50%', border: open ? 'none' : '1px solid #E5E7EB',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.3s', position: 'relative',
    background: open ? '#059669' : '#fff',
    color: open ? '#fff' : '#059669',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    transform: open ? 'rotate(90deg)' : 'none',
  }),
  badge: {
    position: 'absolute', top: -4, right: -4, width: 22, height: 22,
    background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700,
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid #fff',
  },
  card: {
    position: 'absolute', bottom: 80, right: 0, width: 380,
    background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    border: '1px solid #E5E7EB', overflow: 'hidden', zIndex: 50,
  },
  cardHeader: {
    padding: '16px 20px', borderBottom: '1px solid #E5E7EB',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#FAFAFA',
  },
  cardTitle: {
    fontSize: '0.95rem', fontWeight: 700, color: '#1f2937',
    display: 'flex', alignItems: 'center', gap: 8, margin: 0,
  },
  itemCount: {
    fontSize: 10, fontWeight: 700, color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  scrollArea: { maxHeight: 320, overflowY: 'auto' },
  emptyWrap: { padding: '48px 24px', textAlign: 'center' },
  emptyIcon: {
    width: 56, height: 56, background: '#F3F4F6', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyText: { fontSize: '0.85rem', color: '#9CA3AF', fontStyle: 'italic' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '10px 20px', fontSize: 10, fontWeight: 700, color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    borderBottom: '1px solid #F3F4F6',
  },
  td: { padding: '14px 20px', borderBottom: '1px solid #F9FAFB' },
  itemName: { fontSize: '0.85rem', fontWeight: 700, color: '#1f2937', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  actionRow: { display: 'flex', gap: 8, marginTop: 4 },
  actionBtn: (color) => ({
    fontSize: 10, fontWeight: 700, color, background: 'none', border: 'none',
    cursor: 'pointer', textDecoration: 'underline', padding: 0,
  }),
  qtyTd: { padding: '14px 20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 500, color: '#6B7280', borderBottom: '1px solid #F9FAFB' },
  priceTd: { padding: '14px 20px', textAlign: 'right', borderBottom: '1px solid #F9FAFB' },
  priceText: { fontSize: '0.85rem', fontWeight: 700, color: '#059669', fontFamily: 'monospace' },
  footer: {
    padding: 24, background: '#FAFAFA', borderTop: '1px solid #E5E7EB',
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  totalLabel: { fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' },
  totalValue: { fontSize: '1.5rem', fontWeight: 900, color: '#1f2937', fontFamily: 'monospace', letterSpacing: '-0.02em' },
  checkoutBtn: {
    width: '100%', padding: 16, background: '#059669', color: '#fff',
    border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 4px 14px rgba(5,150,105,0.25)', transition: 'background 0.2s',
  },
  /* ── Checkout Modal ── */
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  modalCard: {
    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB', overflow: 'hidden',
  },
  modalHeader: {
    padding: '20px 32px', borderBottom: '1px solid #E5E7EB',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: '1.2rem', fontWeight: 900, color: '#111827',
    display: 'flex', alignItems: 'center', gap: 12, margin: 0,
  },
  modalTitleIcon: {
    width: 40, height: 40, background: '#F0FDF4', borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669',
  },
  modalCloseBtn: {
    width: 36, height: 36, background: '#F3F4F6', border: 'none', borderRadius: '50%',
    cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modalForm: { padding: 32 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: {
    display: 'block', fontSize: 11, fontWeight: 800, color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, paddingLeft: 2,
  },
  fieldInput: {
    width: '100%', padding: '12px 16px', background: '#F9FAFB',
    border: '1px solid #D1D5DB', borderRadius: 12,
    color: '#111827', fontSize: '0.9rem', fontWeight: 500,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  fieldTextarea: {
    width: '100%', padding: '12px 16px', background: '#F9FAFB',
    border: '1px solid #D1D5DB', borderRadius: 12,
    color: '#111827', fontSize: '0.9rem', fontWeight: 500,
    outline: 'none', boxSizing: 'border-box', resize: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  amountBox: {
    padding: 20, background: '#F0FDF4', borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    border: '1px solid #BBF7D0', marginBottom: 20,
  },
  amountLabel: { fontSize: 11, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.08em' },
  amountValue: { fontSize: '1.3rem', fontWeight: 900, color: '#065F46' },
  submitBtn: {
    width: '100%', padding: 16, background: '#111827', color: '#fff',
    border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: 'background 0.2s',
  },
};

export default function ProjectSummaryPanel() {
  const { totalCost, costBreakdown, state, dispatch } = useDesign();
  const { placedItems, placementMode } = state;
  const isPlacing = placementMode !== 'idle';
  const [showSummary, setShowSummary] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleEdit = (itemId) => {
    if (isPlacing) return;
    dispatch({ type: 'START_EDITING', payload: itemId });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (placedItems.length === 0) return;
    setLoading(true);
    try {
      const items = costBreakdown.map(item => {
        const product = state.products.find(p => p.name === item.name);
        return { id: product ? product.id : null, quantity: item.quantity };
      }).filter(item => item.id !== null);

      const orderResult = await submitOrder({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_address: formData.address,
        total_price: totalCost,
        items: items,
      });
      const sessionData = await createCheckoutSession(orderResult.order_id);
      dispatch({ type: 'CLEAR_DESIGN' });
      window.location.href = sessionData.checkout_url;
    } catch (error) {
      alert(`Checkout failed: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button onClick={() => setShowSummary(!showSummary)} style={P.fab(showSummary)} title="Project Summary">
        {showSummary ? <X size={24} /> : <ClipboardList size={24} />}
        {placedItems.length > 0 && !showSummary && (
          <span style={P.badge}>{placedItems.length}</span>
        )}
      </button>

      {/* Summary Card */}
      {showSummary && (
        <div style={P.card}>
          <div style={P.cardHeader}>
            <h3 style={P.cardTitle}>
              <ShoppingCart size={18} style={{ color: '#10b981' }} />
              Project Summary
            </h3>
            <span style={P.itemCount}>{placedItems.length} Items</span>
          </div>

          <div style={P.scrollArea}>
            {placedItems.length === 0 ? (
              <div style={P.emptyWrap}>
                <div style={P.emptyIcon}>
                  <ClipboardList size={24} style={{ color: '#D1D5DB' }} />
                </div>
                <p style={P.emptyText}>No items placed yet.</p>
              </div>
            ) : (
              <table style={P.table}>
                <thead>
                  <tr>
                    <th style={{ ...P.th, textAlign: 'left' }}>Item</th>
                    <th style={{ ...P.th, textAlign: 'center' }}>Qty</th>
                    <th style={{ ...P.th, textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {costBreakdown.map((item, i) => (
                    <tr key={i}>
                      <td style={P.td}>
                        <p style={P.itemName}>{item.name}</p>
                        <div style={P.actionRow}>
                          <button
                            onClick={() => {
                              const found = placedItems.find(p => p.name === item.name);
                              if (found) handleEdit(found.id);
                            }}
                            style={P.actionBtn('#059669')}
                          >Edit</button>
                          <button
                            onClick={() => {
                              placedItems.filter(p => p.name === item.name)
                                .forEach(p => dispatch({ type: 'REMOVE_ITEM', payload: p.id }));
                            }}
                            style={P.actionBtn('#EF4444')}
                          >Remove</button>
                        </div>
                      </td>
                      <td style={P.qtyTd}>{item.quantity}</td>
                      <td style={P.priceTd}>
                        <span style={P.priceText}>₱{item.subtotal.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {placedItems.length > 0 && (
            <div style={P.footer}>
              <div style={P.totalRow}>
                <span style={P.totalLabel}>Total Estimate</span>
                <span style={P.totalValue}>₱{totalCost.toLocaleString()}</span>
              </div>
              <button onClick={() => setShowCheckout(true)} style={P.checkoutBtn}
                onMouseEnter={e => e.currentTarget.style.background = '#047857'}
                onMouseLeave={e => e.currentTarget.style.background = '#059669'}>
                <ShoppingCart size={18} />
                Checkout and Order
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Checkout Modal ── */}
      {showCheckout && (
        <div style={P.modalOverlay}>
          <div style={P.modalCard}>
            <div style={P.modalHeader}>
              <h3 style={P.modalTitle}>
                <div style={P.modalTitleIcon}><ShoppingCart size={20} /></div>
                Checkout
              </h3>
              <button onClick={() => setShowCheckout(false)} style={P.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCheckout} style={P.modalForm}>
              <div style={P.fieldGroup}>
                <label style={P.fieldLabel}>Full Name</label>
                <input required type="text" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={P.fieldInput} placeholder="John Doe"
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={P.fieldGroup}>
                <label style={P.fieldLabel}>Email Address</label>
                <input required type="email" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={P.fieldInput} placeholder="john@example.com"
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={P.fieldGroup}>
                <label style={P.fieldLabel}>Delivery Address</label>
                <textarea required rows="2" value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={P.fieldTextarea} placeholder="123 Garden St..."
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={P.amountBox}>
                <span style={P.amountLabel}>Amount Due</span>
                <span style={P.amountValue}>₱{totalCost.toLocaleString()}</span>
              </div>

              <button type="submit" disabled={loading} style={{ ...P.submitBtn, opacity: loading ? 0.5 : 1 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#000'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#111827'; }}>
                {loading ? (
                  <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                ) : (
                  <><CreditCard size={20} /> Secure Checkout</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
