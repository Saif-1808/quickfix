import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { Menu, X } from 'lucide-react';

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
    <>
      <Navbar />
      <div className="dashboard-layout">
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
          {/* Mobile top bar */}
          <div style={{ display: 'none' }} id="mobile-topbar">
            <button className="btn btn-secondary btn-icon mb-3" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
          <style>{`@media(max-width:1024px){#mobile-topbar{display:flex!important;}}`}</style>
          <button className="btn btn-secondary btn-icon mb-3" onClick={() => setSidebarOpen(true)} style={{ display: 'none' }} id="sidebar-toggle">
            <Menu size={20} />
          </button>
          <style>{`@media(max-width:1024px){#sidebar-toggle{display:flex!important;}}`}</style>
          {children}
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
