import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDesign } from '../context/DesignContext';
import { loadDesign } from '../services/api';

const AdminDashboard = () => {
    const { authTokens, logoutUser } = useAuth();
    const { dispatch } = useDesign();
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('designs');

    useEffect(() => {
        const fetchSubmittedDesigns = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/designs/submitted_designs/', {
                    headers: {
                        'Authorization': `Bearer ${authTokens.access}`,
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch designs');
                }
                
                const data = await response.json();
                setDesigns(data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/orders/', {
                    headers: {
                        'Authorization': `Bearer ${authTokens.access}`,
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                
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
                // Remove from the list since it's no longer 'submitted'
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

    return (
        <div className="admin-dashboard" style={{ padding: '20px', color: 'white' }}>
            <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>🛡️ Admin Dashboard</h1>
                    <p className="subtitle">Review submitted garden designs</p>
                </div>
                <button onClick={logoutUser} style={{ padding: '10px 20px', cursor: 'pointer', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px' }}>Logout</button>
            </header>

            <main className="admin-content" style={{ marginTop: '30px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setActiveTab('designs')} 
                        style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'designs' ? '#10b981' : '#34495e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
                    >
                        Pending Designs
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')} 
                        style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'orders' ? '#10b981' : '#34495e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
                    >
                        Customer Orders
                    </button>
                </div>

                {loading && <p>Loading data...</p>}
                {error && <p className="error-message">{error}</p>}
                
                {!loading && !error && activeTab === 'designs' && (
                    <>
                        <h2>Submitted Designs</h2>
                        {designs.length === 0 ? (
                            <p>No designs are currently pending review.</p>
                        ) : (
                            <table className="designs-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                <thead>
                                    <tr style={{ background: '#34495e', textAlign: 'left' }}>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>ID</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Name</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Total Cost</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Submitted At</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {designs.map(design => (
                                        <tr key={design.id} style={{ background: '#2c3e50' }}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>{design.id}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>{design.name}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>₱{design.total_cost}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>{new Date(design.updated_at).toLocaleString()}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>
                                                <button onClick={() => handleViewDesign(design.id)} style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer', background: '#f39c12', color: 'white', border: 'none', borderRadius: '3px', fontWeight: 'bold' }}>View</button>
                                                <button onClick={() => handleUpdateStatus(design.id, 'approved')} style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '3px', fontWeight: 'bold' }}>Approve</button>
                                                <button onClick={() => handleUpdateStatus(design.id, 'rejected')} style={{ padding: '5px 10px', cursor: 'pointer', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', fontWeight: 'bold' }}>Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {!loading && !error && activeTab === 'orders' && (
                    <>
                        <h2>Customer Orders</h2>
                        {orders.length === 0 ? (
                            <p>No orders have been placed yet.</p>
                        ) : (
                            <table className="designs-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                <thead>
                                    <tr style={{ background: '#34495e', textAlign: 'left' }}>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Order #</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Customer</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Email & Address</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Total Price</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Date</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} style={{ background: '#2c3e50', verticalAlign: 'top' }}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>{order.id}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>{order.customer_name}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>
                                                <div>{order.customer_email}</div>
                                                <div style={{ fontSize: '0.85em', color: '#bdc3c7', marginTop: '4px' }}>{order.customer_address}</div>
                                            </td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d', fontWeight: 'bold', color: '#2ecc71' }}>₱{order.total_price}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>{new Date(order.created_at).toLocaleString()}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #7f8c8d' }}>
                                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
                                                    {order.items.map(item => (
                                                        <li key={item.id}>
                                                            {item.quantity}x {item.item_name} (₱{item.price_at_booking})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
