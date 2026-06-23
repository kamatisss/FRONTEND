import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, CreditCard, Truck, Box } from 'lucide-react';

const UserOrders = () => {
    const { authTokens, user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                const res = await fetch(`http://localhost:8000/api/orders/${orderId}/`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (res.ok) {
                    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                } else {
                    alert("Failed to cancel order.");
                }
            } catch (err) {
                console.error("Error cancelling order:", err);
            }
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/orders/', {
                    headers: {
                        'Authorization': `Bearer ${authTokens.access}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error("Failed to fetch orders.");
                }
                
                const data = await response.json();
                const userOrders = Array.isArray(data) ? data : (data.results || []);
                setOrders(userOrders);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.message || 'Failed to load your orders.');
            } finally {
                setLoading(false);
            }
        };

        if (authTokens) {
            fetchOrders();
        }
    }, [authTokens, user]);

    /* ── Shared Style Tokens ── */
    const label = {
        fontSize: '11px',
        fontWeight: 700,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '4px',
    };

    const getStatusBadge = (status) => {
        const base = {
            display: 'inline-block',
            padding: '5px 14px',
            borderRadius: 999,
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
        };
        switch (status) {
            case 'Pending':
                return { ...base, background: '#FEF3C7', color: '#92400E' };
            case 'Paid':
                return { ...base, background: '#D1FAE5', color: '#065F46' };
            case 'Shipped':
                return { ...base, background: '#DBEAFE', color: '#1E40AF' };
            case 'Out for Delivery':
                return { ...base, background: '#E0F2FE', color: '#0369A1' };
            case 'Delivered':
                return { ...base, background: '#D1FAE5', color: '#065F46' };
            case 'Cancelled':
                return { ...base, background: '#FEE2E2', color: '#B91C1C' };
            default:
                return { ...base, background: '#F1F5F9', color: '#475569' };
        }
    };

    /* ── Loading State ── */
    if (loading) {
        return (
            <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '4px solid #e2e8f0', borderTopColor: '#10b981',
                    animation: 'spin 0.8s linear infinite', marginBottom: 16,
                }} />
                <p style={{ color: '#64748b', fontWeight: 500 }}>Loading your orders...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    /* ── Error State ── */
    if (error) {
        return (
            <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '20px 28px', borderRadius: 12, maxWidth: 420, textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>Oops!</p>
                    <p style={{ fontSize: '0.88rem' }}>{error}</p>
                </div>
            </div>
        );
    }

    /* ── Empty State ── */
    if (orders.length === 0) {
        return (
            <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
                <div style={{ background: '#fff', padding: '48px 36px', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', maxWidth: 420, width: '100%', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Package size={32} color="#94a3b8" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>No orders yet</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 28, lineHeight: 1.6 }}>
                        You haven't placed any orders yet. Head over to the 3D Studio to start designing your dream garden and purchase items.
                    </p>
                    <button
                        onClick={() => navigate('/studio')}
                        style={{
                            width: '100%', padding: '14px', background: '#10b981', color: '#fff',
                            border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700,
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                        onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                    >
                        Go to 3D Studio
                    </button>
                </div>
            </div>
        );
    }

    /* ── Orders List ── */
    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f1f5f9', padding: '40px 24px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>

                {/* Page Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>Order History</h1>
                    <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Track and manage your garden design purchases.</p>
                </div>

                {/* Order Cards */}
                {orders.map((order) => (
                    <div key={order.id} style={{
                        background: '#ffffff', borderRadius: 14,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        border: '1px solid #e2e8f0',
                        marginBottom: 24, overflow: 'hidden',
                    }}>

                        {/* Card Header */}
                        <div style={{
                            background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                            padding: '20px 28px',
                            display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', justifyContent: 'space-between',
                        }}>
                            <div>
                                <p style={label}>Order Number</p>
                                <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                    #{String(order.id).padStart(5, '0')}
                                </p>
                            </div>
                            <div>
                                <p style={label}>Date Placed</p>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Calendar size={14} color="#94a3b8" />
                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={label}>Total Amount</p>
                                <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
                                    ₱{Number(order.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '24px 28px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px' }}>

                                {/* Left: Address */}
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <p style={{ ...label, marginBottom: 8 }}>Delivery Address</p>
                                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0, maxWidth: 360 }}>
                                        {order.customer_address}
                                    </p>
                                </div>

                                {/* Right: Status & Payment */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {order.status.toLowerCase() === 'pending' && (
                                            <button 
                                                onClick={() => handleCancelOrder(order.id)}
                                                style={{
                                                    fontSize: '0.75rem', fontWeight: 600, color: '#ef4444',
                                                    textUnderlineOffset: '2px', cursor: 'pointer',
                                                    background: 'none', border: 'none', padding: 0,
                                                    transition: 'all 0.2s', textDecoration: 'none'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        <span style={getStatusBadge(order.status)}>{order.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                        {order.payment_method === 'cod' ? (
                                            <><Truck size={15} color="#b45309" /> Cash on Delivery</>
                                        ) : (
                                            <><CreditCard size={15} color="#2563eb" /> Online Payment (Stripe)</>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                                <p style={{ ...label, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Box size={13} color="#94a3b8" /> Order Items
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                background: '#f1f5f9', padding: '6px 14px', borderRadius: 8,
                                            }}>
                                                <span style={{
                                                    fontSize: '11px', fontWeight: 800, color: '#64748b',
                                                    background: '#fff', padding: '2px 7px', borderRadius: 5,
                                                    border: '1px solid #e2e8f0',
                                                }}>
                                                    {item.quantity}x
                                                </span>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                                    {item.item_name}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No items listed.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserOrders;
