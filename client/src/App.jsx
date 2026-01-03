import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, Settings, Package, Leaf, Users } from 'lucide-react';
import HomePage from './pages/Home';
import AdminLayout from './pages/admin/AdminLayout';
import ProductList from './pages/admin/ProductList';
import AdminSettings from './pages/admin/Settings';
import AdminUsers from './pages/admin/AdminUsers';
import Login from './pages/Login';
import ChatWidget from './components/ChatWidget';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen pb-12">
          {/* Navigation Header - Conditionally rendered or handled within components */}
          <Header />

          {/* Main Content */}
          <div style={{ paddingTop: '2rem' }}>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Public Route (But we want to protect Home? Or allow guests? User request implies login for main menu) */}
              <Route path="/" element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <PrivateRoute adminOnly={true}>
                  <AdminLayout />
                </PrivateRoute>
              }>
                <Route path="products" element={<ProductList />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </div>

          {/* Chat Assistant */}
          <ChatWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Extract Header to use auth context for showing/hiding or logout
const Header = () => {
  const { user, logout } = useAuth();
  if (!user) return null; // Don't show header on login page (or handled by route)

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
      {/* Mobile-First Responsive Header Styles */}
      <style>{`
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .header-nav {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem 1rem;
          }
          .header-logo {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
          .header-nav {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.75rem;
          }
          .header-nav .btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            flex: 1; /* Make buttons proportional */
            justify-content: center;
            white-space: nowrap;
          }
          .header-greeting {
            width: 100%;
            text-align: center;
            margin-bottom: 0.5rem;
            margin-right: 0 !important;
          }
        }
      `}</style>

      <div className="container header-container">
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(to right, var(--primary), var(--primary-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
              GAS PlantGuard
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.05em' }}>
              v.1.0.0.1
            </span>
          </div>
        </Link>
        <nav className="header-nav">
          <span className="text-muted header-greeting" style={{ marginRight: '1rem' }}>Halo, <b>{user.username}</b></span>
          <a href="/" className="btn btn-secondary">
            <Home size={18} /> <span className="hidden-mobile">Home</span>
          </a>
          {user.role === 'admin' && (
            <Link to="/admin/products" className="btn btn-secondary">
              <Package size={18} /> <span className="hidden-mobile">Admin</span>
            </Link>
          )}
          <button onClick={logout} className="btn btn-accent" style={{ background: '#fee2e2', color: '#dc2626' }}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default App;
