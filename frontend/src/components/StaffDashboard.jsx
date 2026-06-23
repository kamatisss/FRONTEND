import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDesign } from '../context/DesignContext';
import { loadDesign } from '../services/api';
import { Shield, ChevronDown, ChevronUp, Eye, CheckCircle, XCircle, ShoppingBag, Calendar, FileText, AlertTriangle, Truck } from 'lucide-react';

const StaffDashboard = () => {
    const { authTokens } = useAuth();
    const { dispatch } = useDesign();
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [orders, setOrders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
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

        const fetchBookings = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/bookings/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (!response.ok) throw new Error('Failed to fetch bookings');
                const data = await response.json();
                setBookings(data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchInventory = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/inventory/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (!response.ok) throw new Error('Failed to fetch inventory');
                const data = await response.json();
                setInventoryItems(data);
            } catch (err) {
                setError(err.message);
            }
        };

        if (authTokens) {
            Promise.all([
                fetchSubmittedDesigns(),
                fetchOrders(),
                fetchBookings(),
                fetchInventory()
            ]).finally(() => setLoading(false));
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

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/update_status/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const ordRes = await fetch('http://localhost:8000/api/orders/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (ordRes.ok) {
                    const ordData = await ordRes.json();
                    setOrders(ordData);
                }
            } else {
                const data = await response.json();
                alert("Failed to update status: " + (data.error || JSON.stringify(data)));
            }
        } catch (err) {
            console.error('Failed to update order status', err);
            alert('Failed to update order status');
        }
    };

    const getOrderStatusStyle = (status) => {
        const base = {
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.02em',
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

    const pendingDesignsCount = designs.length;

    const localDate = new Date();
    const yyyy = localDate.getFullYear();
    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
    const dd = String(localDate.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const todaysBookingsCount = bookings.filter(b => b.scheduled_date === todayStr).length;

    const pendingOrdersCount = orders.filter(order => order.status && order.status.toLowerCase() === 'pending').length;
    const lowStockAlertsCount = inventoryItems.filter(item => Number(item.stock_quantity || 0) < 10).length;

    return (
        <div className="px-6 pr-6" style={{ backgroundColor: '#f1f5f9', minHeight: '100%', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
            <div className="px-6 pr-6" style={{ 
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
                        <h1 style={{ color: '#1e293b', fontSize: '28px', margin: '0 0 4px 0', fontWeight: '800' }}>Staff Dashboard</h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Review submitted garden designs</p>
                    </div>
                </div>

                {/* Analytics Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 mt-4" style={{ marginTop: '36px', paddingTop: '24px', marginBottom: '32px' }}>
                    {/* Today's Bookings */}
                    <div 
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'default'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div>
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Bookings</p>
                            <h3 style={{ color: '#1e293b', fontSize: '24px', fontWeight: '800', margin: 0 }}>{todaysBookingsCount}</h3>
                        </div>
                        <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px' }}>
                            <Calendar size={24} color="#10b981" />
                        </div>
                    </div>

                    {/* Pending Orders */}
                    <div 
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'default'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div>
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Orders</p>
                            <h3 style={{ color: '#1e293b', fontSize: '24px', fontWeight: '800', margin: 0 }}>{pendingOrdersCount}</h3>
                        </div>
                        <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px' }}>
                            <ShoppingBag size={24} color="#10b981" />
                        </div>
                    </div>

                    {/* Pending Designs */}
                    <div 
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'default'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div>
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Designs</p>
                            <h3 style={{ color: '#1e293b', fontSize: '24px', fontWeight: '800', margin: 0 }}>{pendingDesignsCount}</h3>
                        </div>
                        <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px' }}>
                            <FileText size={24} color="#10b981" />
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div 
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'default'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div>
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Alerts</p>
                            <h3 style={{ color: '#1e293b', fontSize: '24px', fontWeight: '800', margin: 0 }}>{lowStockAlertsCount}</h3>
                        </div>
                        <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px' }}>
                            <AlertTriangle size={24} color="#10b981" />
                        </div>
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
                    designs.length === 0 ? (
                        <p style={{ padding: '32px', color: '#64748b', textAlign: 'center', margin: 0, border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff' }}>No designs are currently pending review.</p>
                    ) : (
                        <div className="w-full overflow-x-auto" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>ID</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Name</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'right' }}>Total Cost</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Submitted At</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', minWidth: '260px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {designs.map((design, index) => (
                                        <tr key={design.id} style={{ background: '#ffffff', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>{design.id}</td>
                                            <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>{design.name}</td>
                                            <td style={{ padding: '16px 24px', color: '#10b981', borderBottom: '1px solid #f1f5f9', fontWeight: '700', textAlign: 'right' }}>₱{Number(design.total_cost).toLocaleString()}</td>
                                            <td style={{ padding: '16px 24px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{new Date(design.updated_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', minWidth: '260px' }}>
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
                        </div>
                    )
                )}

                {/* Customer Orders Table */}
                {!loading && !error && activeTab === 'orders' && (
                    orders.length === 0 ? (
                        <p style={{ padding: '32px', color: '#64748b', textAlign: 'center', margin: 0, border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff' }}>No orders have been placed yet.</p>
                    ) : (
                        <div className="w-full overflow-x-auto" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th className="text-left" style={{ padding: '12px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'left' }}>Order #</th>
                                        <th className="max-w-[150px] text-left" style={{ padding: '12px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'left' }}>Customer</th>
                                        <th className="max-w-[150px] text-left" style={{ padding: '12px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'left' }}>Contact Info</th>
                                        <th className="text-right" style={{ padding: '12px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'right' }}>Total Price</th>
                                        <th className="text-center" style={{ padding: '12px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'center' }}>Payment</th>
                                        <th className="text-center" style={{ padding: '12px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'center' }}>Status</th>
                                        <th className="text-left" style={{ padding: '12px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textAlign: 'left' }}>Date</th>
                                        <th className="w-[140px] min-w-[140px] text-left" style={{ padding: '12px 12px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700', width: '140px', minWidth: '140px', textAlign: 'left' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <React.Fragment key={order.id}>
                                            <tr style={{ background: '#ffffff', transition: 'background 0.2s' }}>
                                                <td className="py-3 text-left" style={{ padding: '12px 24px', color: '#334155', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', fontWeight: '500', textAlign: 'left' }}>{order.id}</td>
                                                <td className="max-w-[150px] py-3 text-left" style={{ padding: '12px 24px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', textAlign: 'left' }}>
                                                    <div className="max-w-[150px] truncate block" style={{ color: '#334155', fontWeight: '600', fontSize: '14px' }}>{order.customer_name}</div>
                                                </td>
                                                <td className="max-w-[150px] py-3 text-left" style={{ padding: '12px 24px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', textAlign: 'left' }}>
                                                    <div className="max-w-[150px] truncate block" style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{order.customer_email}</div>
                                                    <div className="max-w-[150px] truncate block" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{order.customer_address}</div>
                                                </td>
                                                <td className="whitespace-nowrap py-3 text-right" style={{ padding: '12px 24px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', fontWeight: '800', color: '#10b981', textAlign: 'right', fontSize: '16px', whiteSpace: 'nowrap' }}>₱{Number(order.total_price).toLocaleString()}</td>
                                                <td className="whitespace-nowrap py-3 text-center" style={{ padding: '12px 24px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    {order.payment_method === 'cod' ? (
                                                        <span style={{
                                                            display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                                                            background: '#FEF3C7', color: '#92400E',
                                                            fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em',
                                                            whiteSpace: 'nowrap'
                                                        }}>COD</span>
                                                    ) : (
                                                        <span style={{
                                                            display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                                                            background: '#D1FAE5', color: '#065F46',
                                                            fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em',
                                                            whiteSpace: 'nowrap'
                                                        }}>Paid Online</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap py-3 text-center" style={{ padding: '12px 24px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    <span style={getOrderStatusStyle(order.status)}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap py-3 text-left" style={{ padding: '12px 24px', color: '#64748b', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', whiteSpace: 'nowrap', textAlign: 'left' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td className="w-[140px] min-w-[140px] py-3 text-left" style={{ padding: '12px 12px', borderBottom: expandedOrder === order.id ? 'none' : '1px solid #f1f5f9', width: '140px', minWidth: '140px', textAlign: 'left' }}>
                                                    <button 
                                                        onClick={() => toggleOrderDetails(order.id)}
                                                        style={{ 
                                                            padding: '6px 10px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '6px', 
                                                            cursor: 'pointer', 
                                                            background: '#ffffff', 
                                                            color: '#334155', 
                                                            border: '1px solid #cbd5e1', 
                                                            borderRadius: '8px', 
                                                            fontWeight: '600', 
                                                            fontSize: '13px',
                                                            transition: 'all 0.2s',
                                                            whiteSpace: 'nowrap'
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
                                                    <td colSpan="8" style={{ padding: '0 24px 24px 24px', borderBottom: '1px solid #e2e8f0' }}>
                                                        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
                                                            <h4 style={{ color: '#475569', margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Ordered Items</h4>
                                                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                                                                {order.items.map(item => (
                                                                    <li key={item.id}>
                                                                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.quantity}x</span> {item.item_name} <span style={{ color: '#10b981', fontWeight: '600' }}>(₱{Number(item.price_at_booking).toLocaleString()})</span>
                                                                    </li>
                                                                ))}
                                                            </ul>

                                                            {/* Update Fulfillment Status Control Panel */}
                                                            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                                                <h4 style={{ color: '#475569', margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Update Fulfillment Status</h4>
                                                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                                    
                                                                    <div style={{ marginRight: '16px', fontSize: '13.5px', color: '#64748b' }}>
                                                                        Current Order Status: <strong style={{ color: '#0f172a' }}>{order.status}</strong>
                                                                        {order.payment_status && (
                                                                            <> · Payment: <strong style={{ color: order.payment_status === 'Paid' ? '#10b981' : '#f59e0b' }}>{order.payment_status}</strong></>
                                                                        )}
                                                                    </div>

                                                                    {(order.status === 'Pending' || order.status === 'Paid') && (
                                                                        <button 
                                                                            onClick={() => handleUpdateOrderStatus(order.id, 'Shipped')} 
                                                                            style={{ padding: '8px 16px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(59,130,246,0.15)' }}
                                                                            onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                                                                            onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                                                                        >
                                                                            <Truck size={14} /> Approve & Ship
                                                                        </button>
                                                                    )}

                                                                    {(order.status === 'Pending' || order.status === 'Paid' || order.status === 'Shipped' || order.status === 'Out for Delivery') && (
                                                                        <button 
                                                                            onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')} 
                                                                            style={{ padding: '8px 16px', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(16,185,129,0.15)' }}
                                                                            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                                                                            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                                                                        >
                                                                            <CheckCircle size={14} /> Mark as Delivered
                                                                        </button>
                                                                    )}

                                                                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                                        <button 
                                                                            onClick={() => {
                                                                                if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                                                                                    handleUpdateOrderStatus(order.id, 'Cancelled');
                                                                                }
                                                                            }} 
                                                                            style={{ padding: '8px 16px', background: '#ffffff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                                                                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                                                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                                                                        >
                                                                            <XCircle size={14} /> Cancel Order
                                                                        </button>
                                                                    )}

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
