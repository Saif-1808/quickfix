import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService, reviewService } from '../../services';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';

const NAV = [
  { to: '/customer/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { section: 'Bookings' },
  { to: '/customer/bookings', icon: '📋', label: 'My Bookings' },
  { section: 'Account' },
  { to: '/customer/profile', icon: '👤', label: 'Profile' },
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewedBookings, setReviewedBookings] = useState(new Set());

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingService.getMy({ limit: 10 });
        const bks = res.data.bookings;
        setBookings(bks);
        // Check which completed bookings have reviews
        const completed = bks.filter(b => b.status === 'Completed');
        const reviewed = new Set();
        await Promise.all(completed.map(async b => {
          try {
            const r = await reviewService.getByBooking(b._id);
            if (r.data.review) reviewed.add(b._id);
          } catch {}
        }));
        setReviewedBookings(reviewed);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const counts = { total: bookings.length, Pending: 0, Accepted: 0, 'In Progress': 0, Completed: 0 };
  bookings.forEach(b => { if (counts[b.status] !== undefined) counts[b.status]++; });

  const StatCard = ({ label, value, icon, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}20` }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div className="stat-info">
        <div className="value" style={{ color }}>{value}</div>
        <div className="label">{label}</div>
      </div>
    </div>
  );

  return (
    <DashboardLayout navItems={NAV} title="Customer Dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's your service overview</p>
        </div>
        <Link to="/providers" className="btn btn-primary">+ Book Service</Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Bookings" value={counts.total} icon="📋" color="var(--primary-light)" />
        <StatCard label="Pending" value={counts.Pending} icon="⏳" color="#fbbf24" />
        <StatCard label="Accepted" value={counts.Accepted} icon="✅" color="#34d399" />
        <StatCard label="In Progress" value={counts['In Progress']} icon="🔄" color="#60a5fa" />
        <StatCard label="Completed" value={counts.Completed} icon="🏆" color="#a78bfa" />
      </div>

      <h4 style={{ marginBottom: '1rem' }}>Recent Bookings</h4>
      {loading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Bookings Yet</h3>
          <p>Book your first service and it will appear here.</p>
          <Link to="/providers" className="btn btn-primary">Find Providers</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.slice(0, 5).map(b => (
            <div key={b._id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <h5 style={{ marginBottom: '0.25rem' }}>{b.providerId?.businessName || 'Provider'}</h5>
                  <div style={{ fontSize: '0.825rem', color: 'var(--primary-light)' }}>{b.serviceId?.icon} {b.serviceId?.name}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="booking-meta">
                <div className="booking-meta-item"><Calendar size={13} /> {b.bookingDate}</div>
                <div className="booking-meta-item"><Clock size={13} /> {b.startTime} – {b.endTime}</div>
                <div className="booking-meta-item"><MapPin size={13} /> {b.address}</div>
              </div>
              <div className="booking-actions">
                <Link to={`/customer/bookings/${b._id}`} className="btn btn-secondary btn-sm">View Details</Link>
                {b.status === 'Completed' && !reviewedBookings.has(b._id) && (
                  <Link to={`/customer/review/${b._id}`} className="btn btn-warning btn-sm">
                    <Star size={13} /> Rate Service
                  </Link>
                )}
                {b.status === 'Completed' && reviewedBookings.has(b._id) && (
                  <span className="badge badge-completed">✓ Reviewed</span>
                )}
              </div>
            </div>
          ))}
          {bookings.length > 5 && (
            <div className="text-center mt-2">
              <Link to="/customer/bookings" className="btn btn-secondary">View All Bookings</Link>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerDashboard;
