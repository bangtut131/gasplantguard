import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const [facingMode, setFacingMode] = useState('environment');

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [facingMode]);

    const startCamera = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Tidak dapat mengakses kamera. Mohon izinkan akses kamera pada peramban Anda.');
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const takePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');

            // Mirror image if using front camera for more natural feel
            if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(videoRef.current, 0, 0);

            canvas.toBlob(blob => {
                onCapture(blob);
                stopCamera();
            }, 'image/jpeg');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1rem', position: 'relative', overflow: 'hidden' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }} className="btn btn-secondary p-2 rounded-full">
                <X size={20} />
            </button>

            {error ? (
                <div className="text-center p-8 text-danger">{error}</div>
            ) : (
                <>
                    <div style={{ position: 'relative' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                borderRadius: '12px',
                                maxHeight: '400px',
                                objectFit: 'cover',
                                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                            }}
                        />
                        {/* Switch Camera Button */}
                        <button
                            onClick={toggleCamera}
                            className="btn btn-secondary"
                            style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                borderRadius: '50%',
                                width: '48px',
                                height: '48px',
                                padding: 0,
                                background: 'rgba(255,255,255,0.8)'
                            }}
                        >
                            <RefreshCw size={24} />
                        </button>
                    </div>

                    <div className="flex-center mt-4">
                        <button onClick={takePhoto} className="btn btn-primary" style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0, boxShadow: '0 0 0 4px rgba(0, 166, 126, 0.2)' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid white', background: 'transparent' }} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraCapture;
