import React, { useState } from 'react';
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import ProductRecommendations from '../components/ProductRecommendations';

// Helper component to render text with bold headers
const FormattedText = ({ text }) => {
    if (!text) return null;
    return (
        <div style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            {text.split('\n').map((line, i) => {
                const trimmed = line.trim();
                // Check if line looks like a header (bold syntax **...** or ends with :)
                const isHeader = /^\*\*.*\*\*$/.test(trimmed) || (trimmed.endsWith(':') && trimmed.length < 50) || /^\d+\.\s+\*\*.*\*\*.*$/.test(trimmed);

                // Clean markdown bold syntax for display
                const displayLine = line.replace(/\*\*/g, '');

                if (isHeader) {
                    return <strong key={i} style={{ display: 'block', marginTop: '1rem', marginBottom: '0.25rem', color: '#1f2937' }}>{displayLine}</strong>;
                }
                return <div key={i} style={{ minHeight: line.trim() ? 'auto' : '0.5rem' }}>{displayLine}</div>;
            })}
        </div>
    );
};

const HomePage = () => {
    const [mode, setMode] = useState('initial'); // initial, camera, analyzing, result
    const [image, setImage] = useState(null); // Blob or File
    const [imagePreview, setImagePreview] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState('');
    const [userNotes, setUserNotes] = useState('');

    const handleCapture = (blob) => {
        setImage(blob);
        setImagePreview(URL.createObjectURL(blob));
        setMode('preview');
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setMode('preview');
        }
    };

    const analyzeImage = async () => {
        if (!image) return;
        setMode('analyzing');
        setError('');

        const formData = new FormData();
        formData.append('image', image, 'plant-image.jpg');
        if (userNotes) formData.append('user_notes', userNotes);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analisis gagal');

            setAnalysis(data.analysis);
            setRecommendations(data.recommendations || []);
            setMode('result');
        } catch (err) {
            console.error(err);
            setError(err.message);
            setMode('initial');
        }
    };

    const reset = () => {
        setMode('initial');
        setImage(null);
        setImagePreview(null);
        setAnalysis(null);
        setRecommendations([]);
        setError('');
        setUserNotes('');
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>

            {/* INITIAL STATE */}
            {mode === 'initial' && (
                <div className="text-center animate-in" style={{ padding: '4rem 0' }}>
                    <h1 className="mb-4" style={{
                        fontSize: '3rem',
                        fontWeight: '900',
                        letterSpacing: '-0.05em',
                        lineHeight: '1.1'
                    }}>
                        Identifikasi <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #00A67E 0%, #34D399 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 4px 12px rgba(0, 166, 126, 0.3))'
                        }}>Penyakit Tanaman</span>
                    </h1>
                    <p className="text-muted mb-12" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                        Ambil foto tanamanmu, biarkan AI kami mendiagnosa penyakitnya dalam hitungan detik. 🌿🔍
                    </p>

                    <div className="flex-center" style={{ gap: '1.5rem', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setMode('camera')}
                                className="btn btn-primary"
                                style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                            >
                                <Camera size={24} /> Buka Kamera
                            </button>
                            <label className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', cursor: 'pointer' }}>
                                <Upload size={24} /> Unggah Gambar
                                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div className="glass-panel" style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            marginTop: '1rem',
                            maxWidth: '500px',
                            background: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.8)'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.5' }}>
                                Anda mau cek produk dan hal-hal lain tentang <span style={{ fontWeight: '700', color: 'var(--primary)' }}>PT. Gama Agro Sejati</span>?
                                <br />
                                Silahkan chat dibagian <span style={{ fontWeight: '600' }}>kanan bawah</span> ↘️
                            </p>
                        </div>

                        {error && (
                            <div className="glass-panel" style={{ color: 'var(--accent)', padding: '1rem' }}>
                                <AlertTriangle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CAMERA MODE */}
            {mode === 'camera' && (
                <CameraCapture onCapture={handleCapture} onClose={() => setMode('initial')} />
            )}

            {/* PREVIEW MODE */}
            {mode === 'preview' && (
                <div className="glass-panel animate-in" style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                }}>
                    <h3 className="mb-4" style={{
                        background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '1.5rem'
                    }}>Pratinjau Gambar</h3>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                borderRadius: '24px',
                                marginBottom: '1.5rem',
                                boxShadow: '0 15px 35px rgba(0, 166, 126, 0.2)'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '24px',
                            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2)',
                            pointerEvents: 'none'
                        }}></div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <label className="block text-sm font-bold mb-2" style={{ color: '#374151' }}>
                            Catatan (Opsional) ✨
                        </label>
                        <textarea
                            className="form-control"
                            placeholder="Contoh: Daun ini mulai menguning sejak 2 hari lalu, sering terkena hujan..."
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                resize: 'vertical'
                            }}
                        />
                        <small style={{ display: 'block', marginTop: '0.25rem', color: '#6b7280' }}>
                            Ceritakan kondisi tanaman untuk membantu AI menganalisa lebih akurat.
                        </small>
                    </div>
                    <div className="flex-center" style={{ gap: '1rem' }}>
                        <button onClick={analyzeImage} className="btn btn-primary">
                            Mulai Analisis
                        </button>
                        <button onClick={reset} className="btn btn-secondary">
                            Batal
                        </button>
                    </div>
                </div>
            )}

            {/* ANALYZING MODE */}
            {mode === 'analyzing' && (
                <div className="text-center" style={{ padding: '4rem 0' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
                    <h3 className="mt-4">Sedang Menganalisis...</h3>
                    <p className="text-muted">AI kami sedang memeriksa gejala penyakit pada tanaman Anda.</p>
                </div>
            )}

            {/* RESULT MODE */}
            {mode === 'result' && analysis && (
                <div className="animate-in">
                    <div className="mac-glass-panel" style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            {analysis.identified ? (
                                <div style={{ display: 'inline-flex', padding: '1rem', background: '#dcfce7', borderRadius: '50%', marginBottom: '1rem' }}>
                                    <AlertTriangle size={48} color="#166534" />
                                </div>
                            ) : (
                                <div style={{ display: 'inline-flex', padding: '1rem', background: '#f3f4f6', borderRadius: '50%', marginBottom: '1rem' }}>
                                    <CheckCircle size={48} color="#4b5563" />
                                </div>
                            )}

                            <h2 style={{ fontSize: '2rem', color: analysis.disease_name?.toLowerCase().includes('sehat') ? '#166534' : '#dc2626' }}>
                                {analysis.disease_name || "Penyakit Tidak Teridentifikasi"}
                            </h2>
                            <div style={{ badge: 'true', display: 'inline-block', padding: '0.5rem 1rem', background: '#f3f4f6', borderRadius: '99px', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Tingkat Keyakinan: {(analysis.confidence * 100).toFixed(0)}%
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div>
                                <h4 className="text-muted">Deskripsi & Gejala</h4>
                                <FormattedText text={analysis.description} />
                            </div>
                            <div>
                                <h4 className="text-muted">Rekomendasi Penanganan</h4>
                                <FormattedText text={analysis.treatment_recommendation} />
                            </div>
                        </div>

                        <button onClick={reset} className="btn btn-secondary mt-8 w-full">
                            Analisis Lainnya
                        </button>
                    </div>

                    <ProductRecommendations products={recommendations} />
                </div>
            )}
        </div>
    );
};

export default HomePage;
