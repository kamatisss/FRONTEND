import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Check, Clock, MapPin, AlertCircle, AlertTriangle } from 'lucide-react';

const getActiveStep = (status) => {
    switch (status) {
        case 'Pending': return 0;
        case 'Confirmed': return 1;
        case 'In Progress': return 2;
        case 'Completed': return 3;
        default: return -1;
    }
};

const BookingMilestoneTracker = ({ status }) => {
    const activeStep = getActiveStep(status);
    
    const steps = [
        { label: 'Request Submitted', desc: 'Booking request sent' },
        { label: 'AI Layout Created', desc: 'AI design generated' },
        { label: 'Staff Review', desc: 'Reviewing layout details' },
        { label: 'Finalized Studio Plan', desc: 'Ready in 3D Studio' }
    ];

    if (status === 'Cancelled') {
        return (
            <div style={{
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '1.5rem',
                marginBottom: '1.5rem',
            }}>
                <AlertTriangle size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#991B1B' }}>Booking Cancelled</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#B91C1C' }}>
                        This booking has been cancelled. If you need any assistance, please create a new booking request.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '2rem', marginBottom: '2rem', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', width: '100%' }}>
                
                {/* Background progress line */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '6%',
                    right: '6%',
                    height: '4px',
                    background: '#EDE8DF',
                    zIndex: 0,
                }} />

                {/* Active progress line fill */}
                {activeStep > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '6%',
                        width: `${(activeStep / (steps.length - 1)) * 88}%`,
                        height: '4px',
                        background: 'linear-gradient(135deg, #2D4A2D, #4A7A3A)',
                        zIndex: 1,
                        transition: 'width 0.4s ease-in-out',
                    }} />
                )}

                {/* Steps */}
                {steps.map((step, idx) => {
                    const isCompleted = idx < activeStep;
                    const isActive = idx === activeStep;

                    let nodeStyle = {
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                    };

                    if (isCompleted) {
                        nodeStyle = {
                            ...nodeStyle,
                            background: '#4A7A3A',
                            color: '#F7F3EC',
                            border: '2px solid #4A7A3A',
                        };
                    } else if (isActive) {
                        nodeStyle = {
                            ...nodeStyle,
                            background: '#FDFAF6',
                            color: '#4A7A3A',
                            border: '3px solid #4A7A3A',
                        };
                    } else {
                        nodeStyle = {
                            ...nodeStyle,
                            background: '#F5F0E8',
                            color: '#9A9080',
                            border: '2px solid #E8E1D4',
                        };
                    }

                    return (
                        <div key={idx} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '24%',
                            position: 'relative',
                            zIndex: 2,
                        }}>
                            {/* Circle Node */}
                            <div 
                                style={nodeStyle}
                                className={isActive ? "stepper-active-node" : ""}
                            >
                                {isCompleted ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : isActive ? (
                                    <Clock size={18} strokeWidth={2.5} />
                                ) : (
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{idx + 1}</span>
                                )}
                            </div>

                            {/* Labels */}
                            <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: isActive || isCompleted ? 700 : 500,
                                    color: isActive ? '#4A7A3A' : isCompleted ? '#1A2E1A' : '#9A9080',
                                    lineHeight: 1.25,
                                    marginBottom: '4px',
                                }}>
                                    {step.label}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: '#9A9080',
                                    fontWeight: 500,
                                }}>
                                    {step.desc}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MyBookings = () => {
    const { authTokens } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyBookings = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/bookings/`, {
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
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/bookings/${bookingId}/`, {
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
            border: '1.5px solid transparent'
        };
        switch (status) {
            case 'Pending':
                return { ...base, background: '#FDFAF6', color: '#C9883A', borderColor: '#E8E1D4' };
            case 'Confirmed':
                return { ...base, background: '#EAF0E4', color: '#4A7A3A', borderColor: '#8FAF7E' };
            case 'In Progress':
                return { ...base, background: '#F0EBE0', color: '#8A7E6E', borderColor: '#D4CAB8' };
            case 'Completed':
                return { ...base, background: '#EAF0E4', color: '#4A7A3A', borderColor: '#8FAF7E' };
            case 'Cancelled':
                return { ...base, background: '#FEF2F2', color: '#991B1B', borderColor: '#FECACA' };
            default:
                return { ...base, background: '#F5F0E8', color: '#9A9080', borderColor: '#E8E1D4' };
        }
    };

    const s = {
        page: {
            minHeight: 'calc(100vh - 64px)',
            background: 'linear-gradient(160deg, #F7F3EC 0%, #EAF0E4 60%, #F0EBE0 100%)',
            padding: '2.5rem 1.5rem',
            fontFamily: "'Inter', system-ui, sans-serif",
        },
        card: {
            width: '100%',
            maxWidth: '1024px',
            margin: '0 auto',
            background: '#FDFAF6',
            borderRadius: '20px',
            border: '1.5px solid #E8E1D4',
            boxShadow: '0 8px 30px rgba(45, 74, 45, 0.05)',
            overflow: 'hidden',
            padding: '2.5rem',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '2rem',
            paddingBottom: '1.25rem',
            borderBottom: '1.5px solid #EDE8DF',
        },
        title: {
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2rem',
            fontWeight: 800,
            color: '#1A2E1A',
            letterSpacing: '-0.01em',
            margin: 0,
        },
        empty: {
            padding: '4rem 1rem',
            textAlign: 'center',
            color: '#9A9080',
            fontSize: '1rem',
            fontWeight: 500,
        },
        loading: {
            padding: '4rem 1rem',
            textAlign: 'center',
            color: '#9A9080',
            fontSize: '1rem',
            fontWeight: 500,
        },
    };

    return (
        <div style={s.page}>
            <style>{`
                @keyframes stepperPulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(74, 122, 58, 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 8px rgba(74, 122, 58, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(74, 122, 58, 0);
                    }
                }
                .stepper-active-node {
                    animation: stepperPulse 2s infinite;
                }
            `}</style>
            <div style={s.card}>

                {/* Card Header */}
                <div style={s.header}>
                    <Calendar size={28} style={{ color: '#4A7A3A' }} />
                    <h2 style={s.title}>My Bookings</h2>
                </div>

                {loading ? (
                    <div style={s.loading}>Loading your bookings...</div>
                ) : bookings.length === 0 ? (
                    <div style={s.empty}>You don't have any bookings yet.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {bookings.map(b => (
                            <div key={b.id} style={{
                                background: '#ffffff',
                                borderRadius: '16px',
                                border: '1.5px solid #E8E1D4',
                                padding: '24px',
                                boxShadow: '0 4px 12px rgba(45, 74, 45, 0.03)',
                                display: 'flex',
                                flexDirection: 'column',
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
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 74, 45, 0.03)';
                            }}
                            >
                                {/* Top row: Service Type & Status Badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: '#EAF0E4',
                                            color: '#4A7A3A',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Service
                                        </span>
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1A2E1A', textTransform: 'capitalize' }}>
                                            {b.service_type}
                                        </h3>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={getStatusBadge(b.status)}>
                                            {b.status}
                                        </span>
                                        {b.status.toLowerCase() === 'pending' && (
                                            <button 
                                                onClick={() => handleCancelBooking(b.id)}
                                                style={{
                                                    fontSize: '0.8rem', fontWeight: 700, color: '#EF4444',
                                                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Booking details grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1.5px solid #F0EBE0' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8A7E6E', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Date & Time</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2D2D2D' }}>
                                            {b.scheduled_date} {b.preferred_time ? `• ${b.preferred_time}` : ''}
                                        </span>
                                    </div>
                                    {b.service_address && (
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8A7E6E', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Location</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2D2D2D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={14} style={{ color: '#4A7A3A', flexShrink: 0 }} />
                                                {b.service_address}
                                            </span>
                                        </div>
                                    )}
                                    {b.contact_number && (
                                        <div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8A7E6E', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Contact</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2D2D2D' }}>{b.contact_number}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Milestone Tracker */}
                                <BookingMilestoneTracker status={b.status} />

                                {/* Notes section if present */}
                                {b.notes && (
                                    <div style={{ marginTop: '16px', padding: '12px 16px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Notes</span>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>{b.notes}</p>
                                    </div>
                                )}

                                {/* Completed Photo Proof */}
                                {b.status === 'Completed' && b.clock_out_photo_url && (
                                    <div style={{ marginTop: '16px', padding: '16px', background: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#065F46', fontWeight: 800 }}>
                                            Service Completed Proof Photo
                                        </h4>
                                        <img 
                                            src={b.clock_out_photo_url.startsWith('http') ? b.clock_out_photo_url : `${import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:8000'}${b.clock_out_photo_url}`} 
                                            alt="Finished work proof" 
                                            style={{
                                                maxWidth: '400px',
                                                width: '100%',
                                                height: '240px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '1px solid #D1D5DB',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyBookings;
