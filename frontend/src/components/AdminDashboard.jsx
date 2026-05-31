import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDesign } from '../context/DesignContext';
import { loadDesign } from '../services/api';
import { Shield, ChevronDown, ChevronUp, Eye, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
    const { authTokens } = useAuth();
    const { dispatch } = useDesign();
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('designs');
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        const fetchSubmittedDesigns = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/designs/submitted_designs/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (!response.ok) throw new Error('Failed to fetch designs');
                const data = await response.json();
                setDesigns(data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/orders/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (!response.ok) throw new Error('Failed to fetch orders');
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            }
        };

        if (authTokens) {
            Promise.all([fetchSubmittedDesigns(), fetchOrders()]).finally(() => setLoading(false));
        }
    }, [authTokens]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:8000/api/designs/${id}/update_status/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                setDesigns(designs.filter(d => d.id !== id));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleViewDesign = async (id) => {
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
            navigate('/studio');
        } catch (err) {
            console.error('Failed to load design for viewing:', err);
            alert('Could not load the design.');
        }
    };

    const toggleOrderDetails = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100%', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                padding: '32px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
            }}>
                
                {/* Hero Section */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    marginBottom: '32px'
                }}>
                    <Shield size={36} color="#10b981" style={{ marginRight: '20px' }} />
                    <div>
                        <h1 style={{ color: '#1e293b', fontSize: '28px', margin: '0 0 4px 0', fontWeight: '800' }}>Admin Dashboard</h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Review submitted garden designs</p>
                    </div>
                </div>

                {/* Controls / Tabs */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button 
                        onClick={() => setActiveTab('designs')} 
                        style={{ 
                            padding: '12px 24px', 
                            cursor: 'pointer', 
                            background: activeTab === 'designs' ? '#10b981' : '#f1f5f9', 
                            color: activeTab === 'designs' ? 'white' : '#475569', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: '700',
                            fontSize: '15px',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'designs' ? '0 4px 14px rgba(16,185,129,0.3)' : 'none'
                        }}
                    >
                        Pending Designs
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')} 
                        style={{ 
                            padding: '12px 24px', 
                            cursor: 'pointer', 
                            background: activeTab === 'orders' ? '#10b981' : '#f1f5f9', 
                            color: activeTab === 'orders' ? 'white' : '#475569', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: '700',
                            fontSize: '15px',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'orders' ? '0 4px 14px rgba(16,185,129,0.3)' : 'none'
                        }}
                    >
                        Customer Orders
                    </button>
                </div>

                {loading && <p style={{ color: '#64748b' }}>Loading data...</p>}
                {error && <p style={{ color: '#ef4444' }}>{error}</p>}
                
                {/* Pending Designs Table */}
                {!loading && !error && activeTab === 'designs' && (
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        {designs.length === 0 ? (
                            <p style={{ padding: '32px', color: '#64748b', textAlign: 'center', margin: 0 }}>No designs are currently pending review.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>ID</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Name</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'right' }}>Total Cost</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Submitted At</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {designs.map((design, index) => (
                                        <tr key={design.id} style={{ background: '#ffffff', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>{design.id}</td>
                                            <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>{design.name}</td>
                                            <td style={{ padding: '16px 24px', color: '#10b981', borderBottom: '1px solid #f1f5f9', fontWeight: '700', textAlign: 'right' }}>₱{Number(design.total_cost).toLocaleString()}</td>
                                            <td style={{ padding: '16px 24px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{new Date(design.updated_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleViewDesign(design.id)} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#ffffff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>
                                                        <Eye size={14} /> View
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(design.id, 'approved')} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10b981'}>
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(design.id, 'rejected')} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}>
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Customer Orders Table */}
                {!loading && !error && activeTab === 'orders' && (
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        {orders.length === 0 ? (
                            <p style={{ padding: '32px', color: '#64748b', textAlign: 'center', margin: 0 }}>No orders have been placed yet.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Order #</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Customer</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Contact Info</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'right' }}>Total Price</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Date</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <React.Fragment key={order.id}>
                                            <tr style={{ background: '#ffffff', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '16px 24px', color: '#334155', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', fontWeight: '500' }}>{order.id}</td>
                                                <td style={{ padding: '16px 24px', color: '#334155', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', fontWeight: '600' }}>{order.customer_name}</td>
                                                <td style={{ padding: '16px 24px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9' }}>
                                                    <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{order.customer_email}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{order.customer_address}</div>
                                                </td>
                                                <td style={{ padding: '16px 24px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', fontWeight: '800', color: '#10b981', textAlign: 'right', fontSize: '16px' }}>₱{Number(order.total_price).toLocaleString()}</td>
                                                <td style={{ padding: '16px 24px', color: '#64748b', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td style={{ padding: '16px 24px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9' }}>
                                                    <button 
                                                        onClick={() => toggleOrderDetails(order.id)}
                                                        style={{ 
                                                            padding: '8px 16px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px', 
                                                            cursor: 'pointer', 
                                                            background: '#ffffff', 
                                                            color: '#334155', 
                                                            border: '1px solid #cbd5e1', 
                                                            borderRadius: '8px', 
                                                            fontWeight: '600', 
                                                            fontSize: '13px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                                    >
                                                        View Details 
                                                        {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Expanded Details Row */}
                                            {expandedOrder === order.id && (
                                                <tr style={{ background: '#f8fafc' }}>
                                                    <td colSpan="6" style={{ padding: '0 24px 24px 24px', borderBottom: '1px solid #e2e8f0' }}>
                                                        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
                                                            <h4 style={{ color: '#475569', margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Ordered Items</h4>
                                                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                                                                {order.items.map(item => (
                                                                    <li key={item.id}>
                                                                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.quantity}x</span> {item.item_name} <span style={{ color: '#10b981', fontWeight: '600' }}>(₱{Number(item.price_at_booking).toLocaleString()})</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
