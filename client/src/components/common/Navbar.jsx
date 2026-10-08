import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Zap } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/providers', label: 'Providers' },
    { to: '/about', label: 'About' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <div className="logo-icon"><Zap size={20} color="#fff" /></div>
            QuickFix
          </Link>

          <div className="navbar-nav">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} className="btn btn-secondary btn-sm">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-danger btn-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={22} color="var(--text-primary)" /> : <Menu size={22} color="var(--text-primary)" />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <div className="divider" />
        {isAuthenticated ? (
          <>
            <Link to={getDashboardPath()} className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
