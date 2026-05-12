import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';

const ManageAvailability = () => {
    const { authTokens } = useAuth();
    const [blackoutDates, setBlackoutDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const fetchBlackoutDates = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/blackout-dates/');
            const data = await res.json();
            setBlackoutDates(data);
        } catch (error) {
            console.error('Error fetching blackout dates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlackoutDates();
    }, []);

    const handleDateChange = async (date) => {
        // Create an exact YYYY-MM-DD string accounting for timezone
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset*60*1000));
        const formattedDate = localDate.toISOString().split('T')[0];
        
        const existingBlackout = blackoutDates.find(b => b.date === formattedDate);

        try {
            if (existingBlackout) {
                // Delete
                await fetch(`http://localhost:8000/api/blackout-dates/${existingBlackout.id}/`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
            } else {
                // Add
                await fetch('http://localhost:8000/api/blackout-dates/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authTokens.access}`
                    },
                    body: JSON.stringify({ date: formattedDate, reason: 'Manual Blackout' })
                });
            }
            fetchBlackoutDates(); // refresh
        } catch (error) {
            console.error('Error toggling blackout date:', error);
        }
    };

    const highlightWithRanges = [
        {
            "react-datepicker__day--highlighted-custom-1": blackoutDates.map(b => new Date(b.date + 'T00:00:00'))
        }
    ];

    if (loading) return <p>Loading calendar...</p>;

    return (
        <div style={{ padding: '30px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>📅 Manage Availability</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Click on any date to toggle its blackout status. Red dates are marked as closed/unavailable.</p>
            <style>{`
                .react-datepicker__day--highlighted-custom-1 {
                    background-color: #e74c3c !important;
                    color: white !important;
                    font-weight: bold;
                }
            `}</style>
            <div style={{ background: 'white', display: 'inline-block', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    inline
                    highlightDates={highlightWithRanges}
                />
            </div>
        </div>
    );
};

export default ManageAvailability;
