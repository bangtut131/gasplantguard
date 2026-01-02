import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Image as ImageIcon, Upload } from 'lucide-react';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        treatment: '',
        tags: '',
        image: null
    });
    const [loading, setLoading] = useState(true);

    const fetchProducts = () => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!formData.image) return alert('Silakan pilih file JSON.');

        const data = new FormData();
        data.append('file', formData.image); // Reusing 'image' state for file input temporarily

        try {
            setLoading(true);
            const res = await fetch('/api/products/import', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (res.ok) {
                alert(`Berhasil mengimpor ${result.count} produk.`);
                setShowForm(false);
                setFormData({ name: '', description: '', treatment: '', tags: '', image: null, isImport: false });
                fetchProducts();
            } else {
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
            alert('Gagal mengimpor.');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        window.location.href = '/api/products/template';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('treatment', formData.treatment);
        data.append('tags', formData.tags);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                body: data
            });
            if (res.ok) {
                setShowForm(false);
                setFormData({ name: '', description: '', treatment: '', tags: '', image: null, isImport: false });
                fetchProducts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Manajemen Produk</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => { setShowForm(true); setFormData(prev => ({ ...prev, isImport: true })); }}>
                        <Upload size={20} style={{ marginRight: '0.5rem' }} /> Import Excel
                    </button>
                    <button className="btn btn-primary" onClick={() => { setFormData(prev => ({ ...prev, isImport: false })); setShowForm(!showForm || formData.isImport); }}>
                        {showForm && !formData.isImport ? <X size={20} /> : <Plus size={20} />}
                        {showForm && !formData.isImport ? 'Batal' : 'Tambah Produk'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="glass-panel animate-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    {formData.isImport ? (
                        <>
                            <h3 className="mb-4">Import Data Produk</h3>
                            <p className="mb-4 text-muted">Unggah file Excel (.xlsx) berisi daftar produk. Unduh template jika belum punya formatnya.</p>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                <button onClick={downloadTemplate} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                                    Download Template Excel
                                </button>
                            </div>
                            <form onSubmit={handleImport}>
                                <div className="mb-4">
                                    <label className="block mb-2 font-bold">File Excel</label>
                                    <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Mulai Import</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ marginLeft: '1rem' }}>Batal</button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h3 className="mb-4">Produk Baru</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block mb-2 font-bold">Nama Produk</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="mb-4">
                                        <label className="block mb-2 font-bold">Deskripsi</label>
                                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-2 font-bold">Kegunaan / Penggunaan</label>
                                        <textarea name="treatment" value={formData.treatment} onChange={handleInputChange} rows={3} />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-bold">Tags (untuk pencocokan AI)</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: jamur, bercak daun, insektisida"
                                    />
                                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>Pisahkan tag dengan koma.</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-bold">Gambar Produk</label>
                                    <input type="file" onChange={handleFileChange} />
                                </div>

                                <button type="submit" className="btn btn-primary">Simpan Produk</button>
                            </form>
                        </>
                    )}
                </div>
            )}

            <div className="glass-panel" style={{ padding: '1rem' }}>
                {loading ? <p>Memuat...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Gambar</th>
                                <th style={{ padding: '1rem' }}>Nama</th>
                                <th style={{ padding: '1rem' }}>Tags</th>
                                <th style={{ padding: '1rem' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                                        ) : <ImageIcon size={24} className="text-muted" />}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{p.treatment}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {p.tags && p.tags.split(',').map((tag, i) => (
                                                <span key={i} style={{ background: 'rgba(0, 166, 126, 0.1)', color: 'var(--primary-dark)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleDelete(p.id)} className="btn btn-secondary" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-muted">Belum ada produk.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProductList;
