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

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return '#f1c40f'; // yellow
            case 'Confirmed': return '#2ecc71'; // green
            case 'Completed': return '#3498db'; // blue
            case 'Cancelled': return '#e74c3c'; // red
            default: return '#95a5a6'; // grey
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <Calendar size={28} style={{ marginRight: '10px' }} />
                My Bookings
            </h2>
            
            {loading ? <p>Loading your bookings...</p> : (
                <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#ecf0f1', color: '#2c3e50', textAlign: 'left' }}>
                                <th style={{ padding: '15px' }}>Date</th>
                                <th style={{ padding: '15px' }}>Service Type</th>
                                <th style={{ padding: '15px' }}>Status</th>
                                <th style={{ padding: '15px' }}>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{b.scheduled_date}</td>
                                    <td style={{ padding: '15px', textTransform: 'capitalize' }}>{b.service_type}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ 
                                            background: getStatusColor(b.status), 
                                            color: b.status === 'Pending' ? '#333' : 'white', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '12px', 
                                            fontWeight: 'bold' 
                                        }}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', color: '#7f8c8d' }}>{b.notes || '-'}</td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                                        You don't have any bookings yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
