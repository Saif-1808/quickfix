import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService, reviewService } from '../../services';
import { Calendar, Clock, MapPin, Star, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/customer/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { section: 'Bookings' },
  { to: '/customer/bookings', icon: '📋', label: 'My Bookings' },
  { section: 'Account' },
  { to: '/customer/profile', icon: '👤', label: 'Profile' },
];

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewedBookings, setReviewedBookings] = useState(new Set());
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await bookingService.getMy(params);
      const bks = res.data.bookings;
      setBookings(bks);
      const completed = bks.filter(b => b.status === 'Completed');
      const reviewed = new Set();
      await Promise.all(completed.map(async b => {
        try {
          const r = await reviewService.getByBooking(b._id);
          if (r.data.review) reviewed.add(b._id);
        } catch {}
      }));
      setReviewedBookings(reviewed);
    } catch { toast.error('Failed to load bookings.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await bookingService.updateStatus(bookingId, 'Cancelled');
      toast.success('Booking cancelled. The time slot has been released.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally { setCancelling(null); }
  };

  const STATUSES = ['', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Rejected', 'Cancelled'];

  return (
    <DashboardLayout navItems={NAV} title="My Bookings">
      <div className="page-header">
        <div className="page-header-left">
          <h2>My Bookings</h2>
          <p>Track all your service bookings</p>
        </div>
        <Link to="/providers" className="btn btn-primary">+ New Booking</Link>
      </div>

      <div className="filter-bar">
        <Filter size={16} color="var(--text-muted)" />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Filter:</span>
        {STATUSES.map(s => (
          <button key={s || 'all'} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Bookings Found</h3>
          <p>{statusFilter ? `No ${statusFilter} bookings.` : 'You haven\'t made any bookings yet.'}</p>
          <Link to="/providers" className="btn btn-primary">Find Providers</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map(b => (
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
              {b.problemDescription && (
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  "{b.problemDescription}"
                </p>
              )}
              <div className="booking-actions">
                <Link to={`/customer/bookings/${b._id}`} className="btn btn-secondary btn-sm">View Details</Link>
                {b.status === 'Pending' && (
                  <button className="btn btn-danger btn-sm" disabled={cancelling === b._id}
                    onClick={() => handleCancel(b._id)}>
                    {cancelling === b._id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
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
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerBookings;
