import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

    return (
        <div style={{ padding: '30px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📋 Pending Bookings</h2>
            {loading ? <p>Loading bookings...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ background: '#34495e', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>User ID</th>
                            <th style={{ padding: '15px' }}>Service</th>
                            <th style={{ padding: '15px' }}>Date</th>
                            <th style={{ padding: '15px' }}>Status</th>
                            <th style={{ padding: '15px' }}>Notes</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.filter(b => b.status === 'Pending').map(b => (
                            <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px' }}>{b.id}</td>
                                <td style={{ padding: '15px' }}>{b.user}</td>
                                <td style={{ padding: '15px', textTransform: 'capitalize' }}>{b.service_type}</td>
                                <td style={{ padding: '15px' }}>{b.scheduled_date}</td>
                                <td style={{ padding: '15px' }}><span style={{ background: '#f1c40f', color: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{b.status}</span></td>
                                <td style={{ padding: '15px' }}>{b.notes}</td>
                                <td style={{ padding: '15px' }}>
                                    <button onClick={() => handleUpdateStatus(b.id, 'Confirmed')} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' }}>Confirm</button>
                                    <button onClick={() => handleUpdateStatus(b.id, 'Cancelled')} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                </td>
                            </tr>
                        ))}
                        {bookings.filter(b => b.status === 'Pending').length === 0 && (
                            <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>No pending bookings.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default StaffDashboard;
