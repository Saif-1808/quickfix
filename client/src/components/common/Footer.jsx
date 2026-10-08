import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo d-flex align-center gap-sm">
            <div className="logo-icon" style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" />
            </div>
            QuickFix
          </div>
          <p className="footer-desc mt-2">
            Your trusted marketplace for local service professionals. Quality service, right when you need it.
          </p>
          <div className="d-flex flex-wrap gap-sm mt-2">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={13} /> support@quickfix.com
            </span>
          </div>
        </div>
        <div className="footer-col">
          <h5>Quick Links</h5>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/providers">Providers</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>For Customers</h5>
          <ul>
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/providers">Find Providers</Link></li>
            <li><Link to="/customer/bookings">My Bookings</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Services</h5>
          <ul>
            {['Electrician', 'Plumber', 'Carpenter', 'Cleaning', 'AC Repair', 'Painter'].map(s => (
              <li key={s}><Link to={`/providers?service=${s}`}>{s}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} QuickFix. All rights reserved.</p>
        <p>Built with ❤️ using MERN Stack</p>
      </div>
    </div>
  </footer>
);

export default Footer;
