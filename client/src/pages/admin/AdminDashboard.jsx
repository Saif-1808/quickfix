import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services';
import { Users, Briefcase, Layers, BookOpen, Clock, CheckCircle, Star } from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { section: 'Management' },
  { to: '/admin/providers', icon: '🔧', label: 'Providers' },
  { to: '/admin/services', icon: '⚙️', label: 'Services' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/bookings', icon: '📋', label: 'Bookings' },
  { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
];

export { NAV };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ label, value, icon: Icon, color, to }) => (
    <Link to={to || '#'} className="stat-card" style={{ textDecoration: 'none', cursor: to ? 'pointer' : 'default' }}>
      <div className="stat-icon" style={{ background: `${color}20` }}>
        <Icon size={22} color={color} />
      </div>
      <div className="stat-info">
        <div className="value" style={{ color }}>{loading ? '—' : value}</div>
        <div className="label">{label}</div>
      </div>
    </Link>
  );

  const s = stats || {};

  return (
    <DashboardLayout navItems={NAV} title="Admin Dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Admin Dashboard</h2>
          <p>Platform overview and management</p>
        </div>
      </div>

      {/* Main stats */}
      <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform Stats</h4>
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <StatCard label="Total Customers" value={s.totalCustomers} icon={Users} color="var(--secondary)" to="/admin/users" />
        <StatCard label="Total Providers" value={s.totalProviders} icon={Briefcase} color="var(--primary-light)" to="/admin/providers" />
        <StatCard label="Total Services" value={s.totalServices} icon={Layers} color="var(--accent)" to="/admin/services" />
        <StatCard label="Total Bookings" value={s.total} icon={BookOpen} color="#f472b6" to="/admin/bookings" />
      </div>

      <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Booking Status</h4>
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <StatCard label="Pending" value={s.Pending} icon={Clock} color="#fbbf24" to="/admin/bookings" />
        <StatCard label="Accepted" value={s.Accepted} icon={CheckCircle} color="#34d399" to="/admin/bookings" />
        <StatCard label="In Progress" value={s['In Progress']} icon={BookOpen} color="#60a5fa" to="/admin/bookings" />
        <StatCard label="Completed" value={s.Completed} icon={CheckCircle} color="#a78bfa" to="/admin/bookings" />
        <StatCard label="Cancelled" value={s.Cancelled} icon={BookOpen} color="#9ca3af" to="/admin/bookings" />
        <StatCard label="Avg Rating" value={s.avgProviderRating ? `${s.avgProviderRating}★` : 'N/A'} icon={Star} color="#fbbf24" to="/admin/reviews" />
      </div>

      {/* Quick links */}
      <h4 style={{ marginBottom: '1rem' }}>Quick Actions</h4>
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))' }}>
        {[
          { to: '/admin/providers', icon: '🔧', label: 'Manage Providers', desc: 'Approve, activate providers' },
          { to: '/admin/services', icon: '⚙️', label: 'Manage Services', desc: 'Add/edit service categories' },
          { to: '/admin/users', icon: '👥', label: 'Manage Users', desc: 'View and control accounts' },
          { to: '/admin/bookings', icon: '📋', label: 'View Bookings', desc: 'Monitor all bookings' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="card" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
            <h5 style={{ marginBottom: '0.35rem' }}>{item.label}</h5>
            <p style={{ fontSize: '0.8rem' }}>{item.desc}</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
