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
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/orders/${orderId}/`, {
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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/orders/`, {
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
        color: '#8A7E6E',
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
            border: '1.5px solid transparent'
        };
        switch (status) {
            case 'Pending':
                return { ...base, background: '#FDFAF6', color: '#C9883A', borderColor: '#E8E1D4' };
            case 'Paid':
                return { ...base, background: '#EAF0E4', color: '#4A7A3A', borderColor: '#8FAF7E' };
            case 'Shipped':
                return { ...base, background: '#FDFAF6', color: '#4A7A3A', borderColor: '#8FAF7E' };
            case 'Out for Delivery':
                return { ...base, background: '#F5F0E8', color: '#C9883A', borderColor: '#D4CAB8' };
            case 'Delivered':
                return { ...base, background: '#EAF0E4', color: '#4A7A3A', borderColor: '#8FAF7E' };
            case 'Cancelled':
                return { ...base, background: '#FEF2F2', color: '#991B1B', borderColor: '#FECACA' };
            default:
                return { ...base, background: '#F5F0E8', color: '#9A9080', borderColor: '#E8E1D4' };
        }
    };

    /* ── Loading State ── */
    if (loading) {
        return (
            <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg, #F7F3EC 0%, #EAF0E4 60%, #F0EBE0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '4px solid #EDE8DF', borderTopColor: '#4A7A3A',
                    animation: 'spin 0.8s linear infinite', marginBottom: 16,
                }} />
                <p style={{ color: '#8A7E6E', fontWeight: 500 }}>Loading your orders...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    /* ── Error State ── */
    if (error) {
        return (
            <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg, #F7F3EC 0%, #EAF0E4 60%, #F0EBE0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
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
            <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg, #F7F3EC 0%, #EAF0E4 60%, #F0EBE0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
                <div style={{ background: '#FDFAF6', padding: '48px 36px', borderRadius: 20, boxShadow: '0 8px 30px rgba(45, 74, 45, 0.05)', border: '1.5px solid #E8E1D4', maxWidth: 420, width: '100%', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Package size={32} color="#9A9080" />
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', fontWeight: 800, color: '#1A2E1A', marginBottom: 8 }}>No orders yet</h3>
                    <p style={{ color: '#8A7E6E', fontSize: '0.95rem', marginBottom: 28, lineHeight: 1.6 }}>
                        You haven't placed any orders yet. Head over to the 3D Studio to start designing your dream garden and purchase items.
                    </p>
                    <button
                        onClick={() => navigate('/studio')}
                        style={{
                            width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1A2E1A 0%, #2D4A2D 100%)', color: '#fff',
                            border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700,
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(45,74,45,0.25)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1A2E1A'}
                        onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #1A2E1A 0%, #2D4A2D 100%)'}
                    >
                        Go to 3D Studio
                    </button>
                </div>
            </div>
        );
    }

    /* ── Orders List ── */
    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg, #F7F3EC 0%, #EAF0E4 60%, #F0EBE0 100%)', padding: '40px 24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>

                {/* Page Header */}
                <div style={{ marginBottom: 32, borderBottom: '1.5px solid #EDE8DF', paddingBottom: '16px' }}>
                    <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.25rem', fontWeight: 800, color: '#1A2E1A', letterSpacing: '-0.01em', margin: '0 0 6px 0' }}>Order History</h1>
                    <p style={{ fontSize: '1rem', color: '#8A7E6E', fontWeight: 500, margin: 0 }}>Track and manage your garden design purchases.</p>
                </div>

                {/* Order Cards */}
                {orders.map((order) => (
                    <div key={order.id} style={{
                        background: '#FDFAF6', borderRadius: 20,
                        boxShadow: '0 4px 20px rgba(45, 74, 45, 0.04)',
                        border: '1.5px solid #E8E1D4',
                        marginBottom: 28, overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#8FAF7E';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 74, 45, 0.08)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#E8E1D4';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 74, 45, 0.04)';
                    }}
                    >

                        {/* Card Header */}
                        <div style={{
                            background: '#F5F0E8', borderBottom: '1.5px solid #E8E1D4',
                            padding: '20px 28px',
                            display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', justifyContent: 'space-between',
                        }}>
                            <div>
                                <p style={label}>Order Number</p>
                                <p style={{ fontSize: '14px', fontWeight: 800, color: '#1A2E1A', margin: 0 }}>
                                    #{String(order.id).padStart(5, '0')}
                                </p>
                            </div>
                            <div>
                                <p style={label}>Date Placed</p>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#2D2D2D', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Calendar size={14} color="#9A9080" />
                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={label}>Total Amount</p>
                                <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4A7A3A', margin: 0 }}>
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
                                    <p style={{ fontSize: '14px', color: '#2D2D2D', lineHeight: 1.6, margin: 0, maxWidth: 360 }}>
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
                                                    fontSize: '0.75rem', fontWeight: 700, color: '#EF4444',
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 600, color: '#4A7A3A' }}>
                                        {order.payment_method === 'cod' ? (
                                            <><Truck size={15} color="#C9883A" /> Cash on Delivery</>
                                        ) : (
                                            <><CreditCard size={15} color="#4A7A3A" /> Online Payment (Stripe)</>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1.5px solid #EDE8DF' }}>
                                <p style={{ ...label, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Box size={13} color="#9A9080" /> Order Items
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                background: '#F5F0E8', padding: '6px 14px', borderRadius: 8,
                                                border: '1.5px solid #E8E1D4',
                                            }}>
                                                <span style={{
                                                    fontSize: '11px', fontWeight: 800, color: '#4A7A3A',
                                                    background: '#fff', padding: '2px 7px', borderRadius: 5,
                                                    border: '1.5px solid #E8E1D4',
                                                }}>
                                                    {item.quantity}x
                                                </span>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A2E1A' }}>
                                                    {item.item_name}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '13px', color: '#9A9080', fontStyle: 'italic' }}>No items listed.</span>
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
