import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Settings, Package, Users } from 'lucide-react';

const AdminLayout = () => {
    return (
        <div className="container">
            <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex' }}>
                {/* Sidebar - Responsive */}
                <aside className="admin-sidebar" style={{
                    borderRight: '1px solid rgba(0,0,0,0.05)',
                    padding: '2rem 1rem',
                    background: 'rgba(255,255,255,0.5)'
                }}>
                    <h3 className="mb-4" style={{ paddingLeft: '1rem' }}>Admin Console</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <NavLink to="/admin/products" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', borderRadius: '12px' }}>
                            <Package size={18} /> Products
                        </NavLink>
                        <NavLink to="/admin/settings" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', borderRadius: '12px' }}>
                            <Settings size={18} /> Settings
                        </NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', borderRadius: '12px' }}>
                            <Users size={18} /> Users & Masa Aktif
                        </NavLink>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="admin-content" style={{ flex: 1 }}>
                    <Outlet />
                </main>
            </div>

            <style>{`
                .admin-sidebar { width: 250px; }
                .admin-content { padding: 4rem; }
                
                @media (max-width: 768px) {
                    .glass-panel { flex-direction: column; }
                    .admin-sidebar { 
                        width: 100%; 
                        border-right: none; 
                        border-bottom: 1px solid rgba(0,0,0,0.05);
                        padding: 1rem;
                    }
                    .admin-content { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
