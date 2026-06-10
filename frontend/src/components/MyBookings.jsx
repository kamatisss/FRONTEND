import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar } from 'lucide-react';

const MyBookings = () => {
    const { authTokens } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyBookings = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/bookings/', {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching my bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                const res = await fetch(`http://localhost:8000/api/bookings/${bookingId}/`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (res.ok) {
                    setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingId));
                } else {
                    alert("Failed to cancel booking.");
                }
            } catch (err) {
                console.error("Error cancelling booking:", err);
            }
        }
    };

    const getStatusBadge = (status) => {
        const base = {
            padding: '4px 14px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'inline-block',
            letterSpacing: '0.02em',
        };
        switch (status) {
            case 'Pending':
                return { ...base, background: '#FEF9C3', color: '#A16207', border: '1px solid #FDE68A' };
            case 'Confirmed':
                return { ...base, background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' };
            case 'Completed':
                return { ...base, background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' };
            case 'Cancelled':
                return { ...base, background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' };
            default:
                return { ...base, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' };
        }
    };

    /* ── Inline style objects ─────────────────────────────────── */
    const s = {
        page: {
            minHeight: 'calc(100vh - 64px)',
            background: '#F3F4F6',
            padding: '2rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        card: {
            width: '100%',
            maxWidth: '1024px',
            margin: '2.5rem auto 0',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            padding: '2rem',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #E5E7EB',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1e293b',
            letterSpacing: '-0.02em',
            margin: 0,
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
        },
        th: {
            padding: '12px 16px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
        },
        thCenter: {
            padding: '12px 16px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
            textAlign: 'center',
        },
        td: {
            padding: '14px 16px',
            fontSize: '0.9rem',
            color: '#1f2937',
            borderBottom: '1px solid #F3F4F6',
        },
        tdBold: {
            padding: '14px 16px',
            fontSize: '0.9rem',
            color: '#1f2937',
            fontWeight: 600,
            borderBottom: '1px solid #F3F4F6',
            whiteSpace: 'nowrap',
        },
        tdCenter: {
            padding: '14px 16px',
            fontSize: '0.9rem',
            color: '#1f2937',
            borderBottom: '1px solid #F3F4F6',
            textAlign: 'center',
        },
        tdCapitalize: {
            padding: '14px 16px',
            fontSize: '0.9rem',
            color: '#1f2937',
            borderBottom: '1px solid #F3F4F6',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
        },
        empty: {
            padding: '3rem 1rem',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '0.95rem',
            fontWeight: 500,
        },
        loading: {
            padding: '3rem 1rem',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '0.95rem',
            fontWeight: 500,
        },
    };

    return (
        <div style={s.page}>
            <div style={s.card}>

                {/* Card Header */}
                <div style={s.header}>
                    <Calendar size={28} style={{ color: '#10b981' }} />
                    <h2 style={s.title}>My Bookings</h2>
                </div>

                {loading ? (
                    <div style={s.loading}>Loading your bookings...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>Service</th>
                                    <th style={s.th}>Schedule & Location</th>
                                    <th style={s.thCenter}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.id}>
                                        <td style={s.td}>
                                            <div style={{ fontWeight: 600, color: '#111827', textTransform: 'capitalize', marginBottom: '4px' }}>
                                                {b.service_type}
                                            </div>
                                            {b.notes && (
                                                <div style={{
                                                    fontSize: '0.75rem', color: '#6B7280',
                                                    maxWidth: '200px', whiteSpace: 'nowrap',
                                                    overflow: 'hidden', textOverflow: 'ellipsis'
                                                }} title={b.notes}>
                                                    {b.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td style={s.td}>
                                            <div style={{ fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                                                {b.scheduled_date} {b.preferred_time ? `• ${b.preferred_time}` : ''}
                                            </div>
                                            {(b.service_address || b.contact_number) && (
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4, maxWidth: '250px' }}>
                                                    {b.service_address && <span style={{ display: 'block' }}>{b.service_address}</span>}
                                                    {b.contact_number && <span style={{ display: 'block' }}>{b.contact_number}</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={s.tdCenter}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                                                <span style={getStatusBadge(b.status)}>
                                                    {b.status}
                                                </span>
                                                {b.status.toLowerCase() === 'pending' && (
                                                    <button 
                                                        onClick={() => handleCancelBooking(b.id)}
                                                        style={{
                                                            fontSize: '0.75rem', fontWeight: 600, color: '#ef4444',
                                                            textUnderlineOffset: '2px', cursor: 'pointer',
                                                            background: 'none', border: 'none', padding: 0,
                                                            transition: 'all 0.2s', textDecoration: 'none'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={s.empty}>
                                            You don't have any bookings yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyBookings;
