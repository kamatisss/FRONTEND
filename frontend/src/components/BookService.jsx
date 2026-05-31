import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';
import { CalendarPlus, CheckCircle2, Clock, CalendarCheck, AlertCircle } from 'lucide-react';

const BookService = () => {
    const { authTokens } = useAuth();
    const [blackoutDates, setBlackoutDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [serviceType, setServiceType] = useState('maintenance');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchBlackoutDates = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/blackout-dates/');
                const data = await res.json();
                setBlackoutDates(data.map(b => new Date(b.date + 'T00:00:00')));
            } catch (error) {
                console.error('Error fetching blackout dates:', error);
            }
        };
        fetchBlackoutDates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate) {
            setMessage('Please select a valid date.');
            return;
        }

        setLoading(true);
        setMessage('');

        const offset = selectedDate.getTimezoneOffset();
        const localDate = new Date(selectedDate.getTime() - (offset*60*1000));
        const formattedDate = localDate.toISOString().split('T')[0];

        try {
            const res = await fetch('http://localhost:8000/api/bookings/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`
                },
                body: JSON.stringify({
                    service_type: serviceType,
                    scheduled_date: formattedDate,
                    notes: notes
                })
            });

            if (res.ok) {
                setMessage('Booking submitted successfully! Our staff will review it shortly.');
                setSelectedDate(null);
                setNotes('');
            } else {
                const data = await res.json();
                setMessage('Error: ' + JSON.stringify(data));
            }
        } catch (error) {
            setMessage('Error submitting booking.');
        } finally {
            setLoading(false);
        }
    };

    /* Inline style objects -- guarantees rendering regardless of Tailwind JIT */
    const styles = {
        page: {
            minHeight: 'calc(100vh - 64px)',
            background: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        card: {
            width: '100%',
            maxWidth: '960px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
        },
        leftCol: {
            width: '55%',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        },
        rightCol: {
            width: '45%',
            background: '#F0FDF4',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderLeft: '1px solid #DCFCE7',
        },
        heading: {
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
        },
        subtitle: {
            fontSize: '1rem',
            color: '#6b7280',
            fontWeight: 500,
            marginBottom: '2rem',
        },
        label: {
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#334155',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
        },
        inputBase: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#334155',
            fontSize: '0.95rem',
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
        },
        selectWrap: {
            position: 'relative',
        },
        selectArrow: {
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#94a3b8',
        },
        formGroup: {
            marginBottom: '1.5rem',
        },
        button: {
            width: '100%',
            padding: '16px',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: '1.5rem',
            boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
            transition: 'background 0.2s, transform 0.15s',
        },
        buttonDisabled: {
            background: '#86efac',
            cursor: 'not-allowed',
        },
        rightHeading: {
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#14532d',
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
        },
        stepRow: {
            display: 'flex',
            gap: '16px',
            marginBottom: '2rem',
        },
        stepIcon: {
            flexShrink: 0,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#DCFCE7',
            border: '3px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
        stepTitle: {
            fontWeight: 700,
            color: '#14532d',
            fontSize: '1.05rem',
            marginBottom: '4px',
        },
        stepDesc: {
            color: 'rgba(22,101,52,0.75)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
        },
        alertSuccess: {
            padding: '14px 16px',
            marginBottom: '1.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#166534',
            fontSize: '0.88rem',
            fontWeight: 500,
        },
        alertError: {
            padding: '14px 16px',
            marginBottom: '1.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: '0.88rem',
            fontWeight: 500,
        },
    };

    const isError = message.includes('Error') || message.includes('Please select');

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* Left Column: The Form */}
                <div style={styles.leftCol}>
                    <h2 style={styles.heading}>
                        <CalendarPlus style={{ color: '#10b981' }} size={30} />
                        Book a Service
                    </h2>
                    <p style={styles.subtitle}>
                        Select a date, service type, and let us know how we can help.
                    </p>

                    {message && (
                        <div style={isError ? styles.alertError : styles.alertSuccess}>
                            {isError
                                ? <AlertCircle style={{ flexShrink: 0, marginTop: '2px' }} size={18} />
                                : <CheckCircle2 style={{ flexShrink: 0, marginTop: '2px' }} size={18} />
                            }
                            <span>{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Service Type */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Service Type</label>
                            <div style={styles.selectWrap}>
                                <select
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    style={{ ...styles.inputBase, appearance: 'none', cursor: 'pointer', paddingRight: '40px' }}
                                >
                                    <option value="maintenance">Maintenance</option>
                                    <option value="consultation">Consultation</option>
                                    <option value="hardscaping">Full Hardscaping</option>
                                </select>
                                <div style={styles.selectArrow}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Scheduled Date */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Scheduled Date</label>
                            <div className="custom-datepicker-wrapper" style={{ position: 'relative' }}>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    excludeDates={blackoutDates}
                                    minDate={new Date()}
                                    placeholderText="Click to select an available date"
                                    className="book-date-input"
                                />
                                <div style={styles.selectArrow}>
                                    <CalendarPlus size={18} />
                                </div>
                            </div>
                            <style>{`
                                .custom-datepicker-wrapper .react-datepicker-wrapper {
                                    width: 100%;
                                }
                                .book-date-input {
                                    width: 100%;
                                    padding: 12px 40px 12px 16px;
                                    border-radius: 10px;
                                    border: 1px solid #e2e8f0;
                                    background: #f8fafc;
                                    color: #334155;
                                    font-size: 0.95rem;
                                    font-weight: 500;
                                    outline: none;
                                    box-sizing: border-box;
                                    cursor: pointer;
                                    transition: border-color 0.2s, box-shadow 0.2s;
                                }
                                .book-date-input:focus {
                                    border-color: #10b981;
                                    box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
                                }
                                .book-date-input::placeholder {
                                    color: #94a3b8;
                                }
                                .react-datepicker {
                                    font-family: inherit;
                                    border: 1px solid #e2e8f0;
                                    border-radius: 12px;
                                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                                    padding: 8px;
                                }
                                .react-datepicker__header {
                                    background-color: white;
                                    border-bottom: 1px solid #f1f5f9;
                                }
                                .react-datepicker__day--selected,
                                .react-datepicker__day--keyboard-selected {
                                    background-color: #10b981 !important;
                                    color: white !important;
                                    border-radius: 8px;
                                }
                                .react-datepicker__day:hover {
                                    border-radius: 8px;
                                    background-color: #d1fae5;
                                }
                                .react-datepicker__day--excluded {
                                    color: #cbd5e1 !important;
                                    text-decoration: line-through;
                                }
                            `}</style>
                        </div>

                        {/* Notes */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Project Details / Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                placeholder="Tell us more about what you need..."
                                style={{ ...styles.inputBase, resize: 'none' }}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : {}),
                            }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#059669'; }}
                            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#10b981'; }}
                        >
                            {loading ? 'Submitting...' : 'Confirm Booking'}
                        </button>
                    </form>
                </div>

                {/* Right Column: What to Expect */}
                <div style={styles.rightCol}>
                    <h3 style={styles.rightHeading}>What Happens Next?</h3>

                    <div style={styles.stepRow}>
                        <div style={styles.stepIcon}>
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={styles.stepTitle}>1. Request Submitted</div>
                            <div style={styles.stepDesc}>
                                Your booking details are securely sent to our management team for initial review.
                            </div>
                        </div>
                    </div>

                    <div style={styles.stepRow}>
                        <div style={styles.stepIcon}>
                            <Clock size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={styles.stepTitle}>2. Expert Review</div>
                            <div style={styles.stepDesc}>
                                Our gardening experts will review your timeline and assess resource availability.
                            </div>
                        </div>
                    </div>

                    <div style={{ ...styles.stepRow, marginBottom: 0 }}>
                        <div style={styles.stepIcon}>
                            <CalendarCheck size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={styles.stepTitle}>3. Booking Confirmed</div>
                            <div style={styles.stepDesc}>
                                You'll receive an email confirmation with full details of your upcoming service.
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookService;
