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

    // parseNotes removed - fields are now properly separated by the backend

    const formatTime = (timeKey) => {
        const map = {
            'anytime': 'Anytime',
            'morning': 'Morning (8AM–12PM)',
            'afternoon': 'Afternoon (1PM–5PM)',
        };
        return map[timeKey] || timeKey || '—';
    };

    const thStyle = {
        padding: '16px 20px',
        color: '#475569',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #e2e8f0',
        fontWeight: '700',
    };

    const tdStyle = {
        padding: '16px 20px',
        borderBottom: '1px solid #f1f5f9',
        verticalAlign: 'top',
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
                                        <th style={thStyle}>ID</th>
                                        <th style={thStyle}>Customer Info</th>
                                        <th style={thStyle}>Service Details</th>
                                        <th style={thStyle}>Schedule</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingBookings.map(b => {
                                        return (
                                            <tr key={b.id} style={{ background: '#ffffff', transition: 'background 0.2s' }}>
                                                {/* ID */}
                                                <td style={{ ...tdStyle, fontWeight: '600', color: '#334155' }}>{b.id}</td>

                                                {/* Customer Info: Name, Phone, Address stacked */}
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px', marginBottom: '4px' }}>
                                                        {b.customer_name || `User ${b.user}`}
                                                    </div>
                                                    {b.contact_number && (
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>
                                                            📞 {b.contact_number}
                                                        </div>
                                                    )}
                                                    {b.service_address && (
                                                        <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '180px', lineHeight: '1.4' }}>
                                                            📍 {b.service_address}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Service Details: Type + Notes stacked */}
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: '600', color: '#334155', textTransform: 'capitalize', fontSize: '14px', marginBottom: '4px' }}>
                                                        {b.service_type}
                                                    </div>
                                                    {b.notes && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#94a3b8',
                                                            maxWidth: '180px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                            title={b.notes}
                                                        >
                                                            {b.notes}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Schedule: Date + Time stacked */}
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: '600', color: '#334155', fontSize: '14px', marginBottom: '4px' }}>
                                                        {new Date(b.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                        🕐 {formatTime(b.preferred_time)}
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td style={tdStyle}>
                                                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>{b.status}</span>
                                                </td>

                                                {/* Actions */}
                                                <td style={tdStyle}>
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
                                        );
                                    })}
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
