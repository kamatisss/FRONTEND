import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';
import { CalendarPlus } from 'lucide-react';

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

    return (
        <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <CalendarPlus size={24} style={{ marginRight: '10px' }} />
                Book a Service
            </h2>
            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Select a date, service type, and let us know how we can help.</p>
            
            {message && <div style={{ padding: '15px', marginBottom: '20px', background: message.includes('Error') ? '#f8d7da' : '#d4edda', color: message.includes('Error') ? '#721c24' : '#155724', borderRadius: '5px' }}>{message}</div>}

            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Service Type</label>
                    <select 
                        value={serviceType} 
                        onChange={(e) => setServiceType(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="maintenance">Maintenance</option>
                        <option value="consultation">Consultation</option>
                        <option value="hardscaping">Full Hardscaping</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Scheduled Date</label>
                    <div className="custom-datepicker-wrapper">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            excludeDates={blackoutDates}
                            minDate={new Date()}
                            placeholderText="Click to select an available date"
                            className="date-picker-input"
                        />
                    </div>
                    <style>{`
                        .custom-datepicker-wrapper .react-datepicker-wrapper {
                            width: 100%;
                        }
                        .date-picker-input {
                            width: 100%;
                            padding: 10px;
                            border-radius: 5px;
                            border: 1px solid #ccc;
                            box-sizing: border-box;
                            font-size: 16px;
                        }
                    `}</style>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Project Details / Notes</label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Tell us more about what you need..."
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <button type="submit" disabled={loading} style={{ background: '#3498db', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px' }}>
                    {loading ? 'Submitting...' : 'Confirm Booking'}
                </button>
            </form>
        </div>
    );
};

export default BookService;
