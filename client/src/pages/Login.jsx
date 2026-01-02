import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            padding: '1rem'
        }}>
            <div className="glass-panel animate-in" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <img src="/logo.png" alt="GAS PlantGuard Logo" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>GAS PlantGuard</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>v.1.0.0.1</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 font-bold text-sm" style={{ color: '#4b5563' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder="Masukkan username"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-bold text-sm" style={{ color: '#4b5563' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder="Masukkan password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ padding: '0.875rem', fontSize: '1rem', justifyContent: 'center' }}
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
                        Belum punya akun? <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Hubungi Admin</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
