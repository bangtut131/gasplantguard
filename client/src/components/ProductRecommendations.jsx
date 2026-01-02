import React from 'react';

const ProductRecommendations = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="animate-in mt-8">
            <h3 className="mb-4">Rekomendasi Produk</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {products.map(product => (
                    <div key={product.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                        {product.image_url && (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                            />
                        )}
                        <div style={{ padding: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h4>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{product.treatment}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {product.tags && product.tags.split(',').map((tag, i) => (
                                    <span key={i} style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.5rem', borderRadius: '8px' }}>
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
