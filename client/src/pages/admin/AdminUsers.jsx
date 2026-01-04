import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, Clock, Save, RefreshCw } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    // New User Form State
    const [newUser, setNewUser] = useState({ username: '', password: '', days_active: 30 });

    const fetchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                setMsg('Gagal mengambil data user');
            }
        } catch (err) {
            console.error(err);
            setMsg('Error koneksi ke server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        console.log("Submitting new user:", newUser); // Debug log
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newUser,
                    days_active: parseInt(newUser.days_active) // Ensure Number
                })
            });
            // ... (rest of handler)

            if (res.ok) {
                setMsg('User berhasil dibuat');
                setNewUser({ username: '', password: '', days_active: 30 });
                fetchUsers();
            } else {
                const d = await res.json();
                setMsg(`Gagal: ${d.error}`);
            }
        } catch (err) {
            setMsg('Error koneksi');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus user ini?')) return;
        const token = localStorage.getItem('token');
        await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchUsers();
    };

    const handleExtend = async (id, days) => {
        const token = localStorage.getItem('token');
        await fetch(`/api/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ days_active: days })
        });
        fetchUsers();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>Manajemen User & Masa Aktif</h2>
                <button onClick={fetchUsers} className="btn btn-secondary" style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}>
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Create User Form - Enhanced with Grid and Glassmorphism */}
            <div className="glass-panel mb-8 p-10 animate-in" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255,255,255,0.6)'
            }}>
                <h3 className="mb-6 font-bold flex items-center gap-3" style={{ fontSize: '1.25rem', color: 'var(--primary-dark)' }}>
                    <div style={{ background: '#dcfce7', padding: '0.5rem', borderRadius: '12px' }}>
                        <UserPlus size={24} color="var(--primary)" />
                    </div>
                    Tambah User Baru
                </h3>

                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1" style={{ color: '#4b5563' }}>Username</label>
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                            required
                            placeholder="Contoh: petani_modern"
                            style={{
                                padding: '0.75rem 1rem',
                                background: '#f9fafb',
                                border: '2px solid #e5e7eb',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1" style={{ color: '#4b5563' }}>Password</label>
                        <input
                            type="text"
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            required
                            placeholder="Rahasia123!"
                            style={{
                                padding: '0.75rem 1rem',
                                background: '#f9fafb',
                                border: '2px solid #e5e7eb',
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1" style={{ color: '#4b5563' }}>Masa Aktif</label>
                        <select
                            value={newUser.days_active}
                            onChange={e => setNewUser({ ...newUser, days_active: e.target.value })}
                            style={{
                                padding: '0.75rem 1rem',
                                background: '#f9fafb',
                                border: '2px solid #e5e7eb',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="7">✨ 1 Minggu (Trial)</option>
                            <option value="30">📅 1 Bulan</option>
                            <option value="90">🌞 3 Bulan</option>
                            <option value="365">👑 1 Tahun (Premium)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '1rem', boxShadow: '0 4px 14px rgba(0, 166, 126, 0.4)' }}>
                        <span style={{ marginRight: '0.5rem' }}>+</span> Buat User
                    </button>
                </form>
                {msg && (
                    <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${msg.includes('Gagal') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                        style={{ display: 'inline-block', border: msg.includes('Gagal') ? '1px solid #fecaca' : '1px solid #bbf7d0' }}>
                        {msg}
                    </div>
                )}
            </div>

            {/* User List - Modern Table */}
            <div className="glass-panel overflow-hidden table-responsive" style={{ borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: 'linear-gradient(to right, #f0fdf4, #fff)', textAlign: 'left' }}>
                            <th className="p-5 font-bold text-sm uppercase tracking-wider" style={{ color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Username</th>
                            <th className="p-5 font-bold text-sm uppercase tracking-wider" style={{ color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Role</th>
                            <th className="p-5 font-bold text-sm uppercase tracking-wider" style={{ color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Status Akun</th>
                            <th className="p-5 font-bold text-sm uppercase tracking-wider" style={{ color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => {
                            const isExpired = u.expires_at && new Date(u.expires_at) < new Date();
                            const rowBg = i % 2 === 0 ? 'white' : '#fcfcfc';

                            return (
                                <tr key={u.id} style={{ background: rowBg, transition: 'background 0.2s' }} className="hover:bg-gray-50">
                                    <td className="p-5 font-bold text-lg" style={{ color: '#1f2937' }}>{u.username}</td>
                                    <td className="p-5">
                                        <span className="badge" style={{
                                            background: u.role === 'admin' ? '#e0e7ff' : '#f3f4f6',
                                            color: u.role === 'admin' ? '#4338ca' : '#374151',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '99px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {u.role === 'admin' ? (
                                            <span style={{ color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                ♾️ Unlimited
                                            </span>
                                        ) : (
                                            <div>
                                                <div style={{
                                                    color: isExpired ? '#dc2626' : '#166534',
                                                    fontWeight: '700',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    <span style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: isExpired ? '#dc2626' : '#166534'
                                                    }}></span>
                                                    {isExpired ? 'EXPIRED' : 'AKTIF'}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Clock size={14} />
                                                    {u.expires_at ? new Date(u.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Selamanya'}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        {u.role !== 'admin' && (
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button
                                                    onClick={() => handleExtend(u.id, 30)}
                                                    className="btn btn-secondary"
                                                    title="Tambah 30 Hari"
                                                    style={{ padding: '0.5rem', borderRadius: '10px' }}
                                                >
                                                    <RefreshCw size={16} color="var(--primary)" /> <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>+30 Hari</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="btn"
                                                    style={{ background: '#fee2e2', color: '#ef4444', padding: '0.5rem', borderRadius: '10px' }}
                                                    title="Hapus User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
