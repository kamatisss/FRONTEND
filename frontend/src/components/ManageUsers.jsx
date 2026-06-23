import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listUsers, createUser, updateUser } from '../services/api';
import { Users, Plus, Shield, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';

const ManageUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'customer' // staff or customer
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await listUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId, currentActive) => {
        if (userId === currentUser.id) {
            alert("You cannot deactivate your own account.");
            return;
        }
        try {
            await updateUser(userId, { is_active: !currentActive });
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
        } catch (err) {
            alert(err.message || 'Failed to update user status');
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleOpenModal = () => {
        setFormData({
            fullName: '',
            username: '',
            email: '',
            password: '',
            role: 'customer'
        });
        setFormError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        if (!formData.username.trim()) {
            setFormError("Username is required.");
            setSubmitting(false);
            return;
        }

        // Split fullName into first_name and last_name
        const nameParts = formData.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        try {
            await createUser({
                username: formData.username.trim(),
                first_name: firstName,
                last_name: lastName,
                email: formData.email,
                password: formData.password,
                input_role: formData.role
            });
            
            // Reload user list and close modal
            await fetchUsers();
            setModalOpen(false);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const query = searchTerm.toLowerCase();
        return fullName.includes(query) || email.includes(query) || username.includes(query);
    });

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100%', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
            {/* Modal */}
            {modalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '450px',
                        padding: '32px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #e2e8f0',
                        animation: 'modal-in 0.2s ease-out'
                    }}>
                        <style>{`
                            @keyframes modal-in {
                                from { opacity: 0; transform: scale(0.95) translateY(10px); }
                                to { opacity: 1; transform: scale(1) translateY(0); }
                            }
                        `}</style>
                        <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>Add New Account</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' }}>Create a new staff or customer account.</p>

                        {formError && (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Account Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', color: '#1e293b', backgroundColor: '#ffffff', cursor: 'pointer' }}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    style={{ padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#10b981', color: '#ffffff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 14px rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                                >
                                    {submitting ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                padding: '32px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
            }}>
                {/* Header / Hero */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '32px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Users size={36} color="#10b981" style={{ marginRight: '20px' }} />
                        <div>
                            <h1 style={{ color: '#1e293b', fontSize: '28px', margin: '0 0 4px 0', fontWeight: '800' }}>User Management</h1>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Manage administrative, staff, and customer accounts</p>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        style={{
                            padding: '12px 24px',
                            cursor: 'pointer',
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '15px',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.45)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; }}
                    >
                        <Plus size={18} /> Add New Account
                    </button>
                </div>

                {/* Search Bar / Filter Panel */}
                <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or username..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 42px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            outline: 'none',
                            color: '#334155',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = '#10b981'}
                        onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                    />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '12px' }}>
                        <Loader2 size={36} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
                        <span style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>Loading accounts...</span>
                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : error ? (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 12px 0', fontWeight: '700' }}>Failed to load users</p>
                        <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
                    </div>
                ) : (
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        {filteredUsers.length === 0 ? (
                            <p style={{ padding: '32px', color: '#64748b', textAlign: 'center', margin: 0 }}>No matching accounts found.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>User ID</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Name</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Email</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Role</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Status</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Date Created</th>
                                        <th style={{ padding: '16px 24px', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((item) => {
                                        const role = item.role || (item.is_superuser ? 'Admin' : item.is_staff ? 'Staff' : 'Customer');
                                        
                                        // Role badge styling
                                        let roleBg = '#F3F4F6';
                                        let roleColor = '#374151';
                                        if (role === 'Admin') {
                                            roleBg = '#F3E8FF';
                                            roleColor = '#6B21A8';
                                        } else if (role === 'Staff') {
                                            roleBg = '#D1FAE5';
                                            roleColor = '#065F46'; // matches Paid Online badge colors
                                        } else if (role === 'Customer') {
                                            roleBg = '#FEF3C7';
                                            roleColor = '#92400E'; // matches COD badge colors
                                        }

                                        return (
                                            <tr key={item.id} style={{ background: '#ffffff', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>
                                                <td style={{ padding: '16px 24px', color: '#475569', borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>{item.id}</td>
                                                <td style={{ padding: '16px 24px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>
                                                    {item.first_name || item.last_name ? `${item.first_name || ''} ${item.last_name || ''}`.trim() : item.username}
                                                </td>
                                                <td style={{ padding: '16px 24px', color: '#334155', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>{item.email || '-'}</td>
                                                <td style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <span style={{
                                                        display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                                                        background: roleBg, color: roleColor,
                                                        fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em',
                                                    }}>{role}</span>
                                                </td>
                                                <td style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: item.is_active ? '#10b981' : '#ef4444',
                                                            display: 'inline-block'
                                                        }} />
                                                        <span style={{
                                                            color: item.is_active ? '#065F46' : '#991B1B',
                                                            fontWeight: '700',
                                                            fontSize: '13px'
                                                        }}>
                                                            {item.is_active ? 'Active' : 'Deactivated'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px', color: '#64748b', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                                                    {new Date(item.date_joined).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <button 
                                                        onClick={() => handleToggleStatus(item.id, item.is_active)}
                                                        disabled={item.id === currentUser?.id}
                                                        style={{ 
                                                            padding: '8px 16px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px', 
                                                            cursor: (currentUser && item.id === currentUser.id) ? 'not-allowed' : 'pointer', 
                                                            background: '#ffffff', 
                                                            color: (currentUser && item.id === currentUser.id) ? '#94a3b8' : (item.is_active ? '#ef4444' : '#10b981'), 
                                                            border: `1px solid ${(currentUser && item.id === currentUser.id) ? '#e2e8f0' : (item.is_active ? '#fca5a5' : '#86efac')}`, 
                                                            borderRadius: '8px', 
                                                            fontWeight: '700', 
                                                            fontSize: '13px',
                                                            transition: 'all 0.2s',
                                                            opacity: (currentUser && item.id === currentUser.id) ? 0.6 : 1
                                                        }}
                                                        onMouseEnter={(e) => { 
                                                            if (!currentUser || item.id !== currentUser.id) {
                                                                e.currentTarget.style.background = item.is_active ? '#fef2f2' : '#f0fdf4'; 
                                                                e.currentTarget.style.borderColor = item.is_active ? '#ef4444' : '#10b981';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => { 
                                                            if (!currentUser || item.id !== currentUser.id) {
                                                                e.currentTarget.style.background = '#ffffff'; 
                                                                e.currentTarget.style.borderColor = item.is_active ? '#fca5a5' : '#86efac';
                                                            }
                                                        }}
                                                    >
                                                        {item.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
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

export default ManageUsers;
