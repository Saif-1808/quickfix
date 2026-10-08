import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService } from '../../services';
import { Calendar, Clock, MapPin, Star, User, CheckCircle, XCircle, PlayCircle, FlagOff } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/provider/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { section: 'Bookings' },
  { to: '/provider/requests', icon: '📩', label: 'New Requests' },
  { to: '/provider/bookings', icon: '📋', label: 'All Bookings' },
  { section: 'Account' },
  { to: '/provider/profile', icon: '👤', label: 'My Profile' },
  { to: '/provider/reviews', icon: '⭐', label: 'Reviews' },
];

const ProviderDashboard = () => {
  const { user, providerProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getMy({ limit: 20 });
      setBookings(res.data.bookings);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (bookingId, status) => {
    setUpdating(bookingId + status);
    try {
      await bookingService.updateStatus(bookingId, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setUpdating(null); }
  };

  const counts = { Pending: 0, Accepted: 0, 'In Progress': 0, Completed: 0 };
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

  const pendingBookings = bookings.filter(b => b.status === 'Pending');

  return (
    <DashboardLayout navItems={NAV} title="Provider Dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
          <p>{providerProfile?.businessName || 'Provider Dashboard'}</p>
        </div>
        {providerProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(99,102,241,0.25)' }}>
            <Star size={14} fill="#fbbf24" color="#fbbf24" />
            <span style={{ fontWeight: 700 }}>{providerProfile.rating > 0 ? providerProfile.rating.toFixed(1) : 'New'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>({providerProfile.totalReviews} reviews)</span>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <StatCard label="New Requests" value={counts.Pending} icon="📩" color="#fbbf24" />
        <StatCard label="Accepted" value={counts.Accepted} icon="✅" color="#34d399" />
        <StatCard label="In Progress" value={counts['In Progress']} icon="🔄" color="#60a5fa" />
        <StatCard label="Completed" value={counts.Completed} icon="🏆" color="#a78bfa" />
      </div>

      {/* Pending requests */}
      {pendingBookings.length > 0 && (
        <>
          <h4 style={{ marginBottom: '1rem' }}>⚡ Pending Requests ({pendingBookings.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {pendingBookings.map(b => (
              <div key={b._id} className="booking-card" style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)' }}>
                <div className="booking-card-header">
                  <div>
                    <h5 style={{ marginBottom: '0.25rem' }}>{b.customerId?.name || 'Customer'}</h5>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{b.customerId?.phone}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="booking-meta">
                  <div className="booking-meta-item"><Calendar size={13} /> {b.bookingDate}</div>
                  <div className="booking-meta-item"><Clock size={13} /> {b.startTime} – {b.endTime}</div>
                  <div className="booking-meta-item"><MapPin size={13} /> {b.address}</div>
                </div>
                {b.problemDescription && <p style={{ fontSize: '0.825rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>"{b.problemDescription}"</p>}
                <div className="booking-actions">
                  <button className="btn btn-success btn-sm" disabled={!!updating}
                    onClick={() => updateStatus(b._id, 'Accepted')}>
                    <CheckCircle size={13} /> Accept
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={!!updating}
                    onClick={() => updateStatus(b._id, 'Rejected')}>
                    <XCircle size={13} /> Reject
                  </button>
                  <Link to={`/provider/bookings/${b._id}`} className="btn btn-secondary btn-sm">Details</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Active bookings */}
      {(() => {
        const active = bookings.filter(b => ['Accepted', 'In Progress'].includes(b.status));
        if (!active.length) return null;
        return (
          <>
            <h4 style={{ marginBottom: '1rem' }}>Active Bookings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {active.map(b => (
                <div key={b._id} className="booking-card">
                  <div className="booking-card-header">
                    <div>
                      <h5 style={{ marginBottom: '0.25rem' }}>{b.customerId?.name}</h5>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{b.bookingDate} at {b.startTime}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="booking-actions">
                    {b.status === 'Accepted' && (
                      <button className="btn btn-primary btn-sm" disabled={!!updating}
                        onClick={() => updateStatus(b._id, 'In Progress')}>
                        <PlayCircle size={13} /> Start Service
                      </button>
                    )}
                    {b.status === 'In Progress' && (
                      <button className="btn btn-success btn-sm" disabled={!!updating}
                        onClick={() => updateStatus(b._id, 'Completed')}>
                        <FlagOff size={13} /> Mark Completed
                      </button>
                    )}
                    <Link to={`/provider/bookings/${b._id}`} className="btn btn-secondary btn-sm">Details</Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      })()}

      {!loading && bookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Bookings Yet</h3>
          <p>Booking requests will appear here once customers book your services.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProviderDashboard;
