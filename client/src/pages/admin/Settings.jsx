import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        provider: 'gemini', // 'gemini' or 'custom'
        api_key: '',
        base_url: '',
        model_name: 'gemini-1.5-flash',
        custom_prompt: '',
        company_address: '',
        company_contact: '',
        company_hours: ''
    });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then(res => {
                if (!res.ok) {
                    return res.json().then(errData => { throw new Error(errData.error || 'Gagal memuat pengaturan'); });
                }
                return res.json();
            })
            .then(data => {
                if (data) setSettings(prev => ({ ...prev, ...data }));
            })
            .catch(err => {
                console.error(err);
                setMsg(`Error: ${err.message}`);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('Menyimpan...');
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const data = await res.json();

            if (res.ok) {
                setMsg('Pengaturan berhasil disimpan!');
            } else {
                setMsg(`Gagal menyimpan: ${data.error || 'Server error'}`);
            }
        } catch (err) {
            setMsg(`Terjadi kesalahan: ${err.message}`);
        }
    };

    if (loading) return <div>Memuat pengaturan...</div>;

    return (
        <div>
            <h2 className="mb-4">Konfigurasi AI</h2>
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
                <div className="mb-4">
                    <label className="block mb-2 font-bold">Penyedia AI</label>
                    <select
                        name="provider"
                        value={settings.provider}
                        onChange={handleChange}
                        className="w-full"
                    >
                        <option value="gemini">Google Gemini</option>
                        <option value="custom">Custom AI Endpoint</option>
                    </select>
                </div>

                {settings.provider === 'gemini' && (
                    <div className="mb-4 animate-in">
                        <label className="block mb-2 font-bold">Google Gemini API Key</label>
                        <input
                            type="password"
                            name="api_key"
                            value={settings.api_key || ''}
                            onChange={handleChange}
                            placeholder="Contoh: AIzaSy..."
                        />
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Dapatkan API Key dari Google AI Studio.
                        </p>
                    </div>
                )}

                {settings.provider === 'custom' && (
                    <div className="animate-in">
                        <div className="mb-4">
                            <label className="block mb-2 font-bold">URL Endpoint Lengkap</label>
                            <input
                                type="text"
                                name="base_url"
                                value={settings.base_url || ''}
                                onChange={handleChange}
                                placeholder="Contoh: https://api.openai.com/v1/chat/completions"
                            />
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                Harus menyertakan path lengkap (misal: <code>/v1/chat/completions</code> untuk server kompatibel OpenAI).
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 font-bold">API Key (Opsional)</label>
                            <input
                                type="password"
                                name="api_key"
                                value={settings.api_key || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-2 font-bold">Nama Model</label>
                    <input
                        type="text"
                        name="model_name"
                        value={settings.model_name || 'gemini-1.5-flash'}
                        onChange={handleChange}
                    />
                </div>

                <div className="p-4 mb-4" style={{ background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h3 className="mb-4 text-lg font-bold">Profil Perusahaan (Untuk Chat Agent)</h3>

                    <div className="mb-4">
                        <label className="block mb-2 font-bold">Alamat Perusahaan</label>
                        <input
                            type="text"
                            name="company_address"
                            value={settings.company_address || ''}
                            onChange={handleChange}
                            placeholder="Jl. Raya Pertanian No. 10..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-bold">Kontak / Customer Service</label>
                        <input
                            type="text"
                            name="company_contact"
                            value={settings.company_contact || ''}
                            onChange={handleChange}
                            placeholder="WA: 08123xxx | Email: info@..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-bold">Jam Operasional</label>
                        <input
                            type="text"
                            name="company_hours"
                            value={settings.company_hours || ''}
                            onChange={handleChange}
                            placeholder="Senin-Jumat: 08.00 - 17.00..."
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-bold">Instruksi Sistem / Guard Rails (Opsional)</label>
                    <textarea
                        name="custom_prompt"
                        value={settings.custom_prompt || ''}
                        onChange={handleChange}
                        rows={8}
                        placeholder="Biarkan kosong untuk menggunakan instruksi bawaan sistem."
                        style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}
                    />
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Anda dapat mengubah perilaku AI, menambahkan batasan (guard rails), atau mengubah format output di sini.
                        <br />
                        <strong>PENTING:</strong> Pastikan tetap meminta output JSON dengan kunci: <code>identified, disease_name, description, confidence, treatment_recommendation, tags</code> agar aplikasi berjalan lancar.
                    </p>
                </div>

                <button type="submit" className="btn btn-primary mt-4">
                    <Save size={18} /> Simpan Pengaturan
                </button>
                {msg && <p className="mt-4" style={{ color: msg.toLowerCase().includes('gagal') ? 'var(--accent)' : 'var(--primary)' }}>{msg}</p>}
            </form>
        </div>
    );
};

export default AdminSettings;
