import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';

const DashboardLayout = ({ children, navItems, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard Top Bar — replaces public Navbar for authenticated dashboard pages */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--navbar-h)',
        background: 'rgba(15,17,23,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', zIndex: 1000,
        display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '1rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img src="/logo.png" alt="QuickFix" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
        </Link>

        <div style={{ flex: 1 }} />

        {/* Role badge */}
        <span style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', display: 'flex', alignItems: 'center' }}>
          {user?.role}
        </span>

        {/* User name */}
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'none' }} id="dash-username">{user?.name}</span>
        <style>{`@media(min-width:640px){#dash-username{display:block!important;}}`}</style>

        {/* Logout */}
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', padding: '0.4rem 0.75rem', borderRadius: 8, transition: 'color 0.2s, background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
          <LogOut size={16} />
          <span style={{ display: 'none' }} id="dash-logout-text">Logout</span>
          <style>{`@media(min-width:640px){#dash-logout-text{display:inline!important;}}`}</style>
        </button>

        {/* Sidebar toggle (mobile) */}
        <button className="btn btn-secondary btn-icon" onClick={() => setSidebarOpen(o => !o)} style={{ display: 'none' }} id="dash-sidebar-toggle" aria-label="Open menu">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <style>{`@media(max-width:1024px){#dash-sidebar-toggle{display:flex!important;}}`}</style>
      </header>

      <div className="dashboard-layout" style={{ paddingTop: 'var(--navbar-h)' }}>
        {/* Sidebar Overlay on mobile */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-user">
              <div className="sidebar-avatar">{initials}</div>
              <div className="sidebar-user-info">
                <h5>{user?.name}</h5>
                <p style={{ textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item, i) => (
              item.section ? (
                <div key={i} className="sidebar-section-label">{item.section}</div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </NavLink>
              )
            ))}
            <div className="divider" style={{ margin: '0.5rem 1.5rem' }} />
            <button onClick={handleLogout} className="sidebar-nav-item" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', borderLeft: '3px solid transparent' }}>
              🚪 Logout
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
