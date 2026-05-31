import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText } from 'lucide-react';

const StaffDashboard = () => {
    const { authTokens, logoutUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/bookings/', {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await fetch(`http://localhost:8000/api/bookings/${id}/update_status/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`
                },
                body: JSON.stringify({ status })
            });
            fetchBookings();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const pendingBookings = bookings.filter(b => b.status === 'Pending');

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
                
                {/* Header */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    marginBottom: '32px'
                }}>
                    <FileText size={28} color="#1e293b" style={{ marginRight: '16px' }} />
                    <h1 style={{ color: '#1e293b', fontSize: '24px', margin: 0, fontWeight: '800' }}>Pending Bookings</h1>
                </div>

                {loading ? <p style={{ color: '#64748b' }}>Loading bookings...</p> : (
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        {pendingBookings.length === 0 ? (
                            <p style={{ padding: '32px', color: '#64748b', textAlign: 'center', margin: 0 }}>No pending bookings found.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>ID</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Customer</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Service</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Date</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Status</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Notes</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingBookings.map(b => (
                                        <tr key={b.id} style={{ background: '#ffffff', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>{b.id}</td>
                                            <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{ fontWeight: '700', color: '#0f172a' }}>
                                                    {b.customer_name || `User ${b.user}`} {b.customer_email ? `(${b.customer_email})` : ''}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9', textTransform: 'capitalize', fontWeight: '500' }}>{b.service_type}</td>
                                            <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>{b.scheduled_date}</td>
                                            <td style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>{b.status}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#64748b', borderBottom: '1px solid #f1f5f9', fontSize: '14px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.notes || '—'}</td>
                                            <td style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleUpdateStatus(b.id, 'Confirmed')} style={{ padding: '8px 16px', cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10b981'}>
                                                        Confirm
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(b.id, 'Cancelled')} style={{ padding: '8px 16px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}>
                                                        Cancel
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
            </div>
        </div>
    );
};

export default StaffDashboard;
