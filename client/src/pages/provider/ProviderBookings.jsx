import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService } from '../../services';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, PlayCircle, FlagOff, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/provider/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { section: 'Bookings' },
  { to: '/provider/requests', icon: '📩', label: 'New Requests' },
  { to: '/provider/bookings', icon: '📋', label: 'All Bookings' },
  { section: 'Services' },
  { to: '/provider/service-requests', icon: '🔧', label: 'My Service Requests' },
  { section: 'Account' },
  { to: '/provider/profile', icon: '👤', label: 'My Profile' },
  { to: '/provider/reviews', icon: '⭐', label: 'Reviews' },
];

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await bookingService.getMy(params);
      setBookings(res.data.bookings);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);

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

  const getActions = (b) => {
    const btns = [];
    if (b.status === 'Pending') {
      btns.push(<button key="acc" className="btn btn-success btn-sm" disabled={!!updating} onClick={() => updateStatus(b._id, 'Accepted')}><CheckCircle size={13} /> Accept</button>);
      btns.push(<button key="rej" className="btn btn-danger btn-sm" disabled={!!updating} onClick={() => updateStatus(b._id, 'Rejected')}><XCircle size={13} /> Reject</button>);
    }
    if (b.status === 'Accepted') btns.push(<button key="start" className="btn btn-primary btn-sm" disabled={!!updating} onClick={() => updateStatus(b._id, 'In Progress')}><PlayCircle size={13} /> Start Service</button>);
    if (b.status === 'In Progress') btns.push(<button key="done" className="btn btn-success btn-sm" disabled={!!updating} onClick={() => updateStatus(b._id, 'Completed')}><FlagOff size={13} /> Mark Completed</button>);
    return btns;
  };

  return (
    <DashboardLayout navItems={NAV} title="All Bookings">
      <div className="page-header">
        <div className="page-header-left">
          <h2>All Bookings</h2>
          <p>Manage all your service appointments</p>
        </div>
      </div>

      <div className="filter-bar">
        <Filter size={16} color="var(--text-muted)" />
        {['', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Rejected', 'Cancelled'].map(s => (
          <button key={s || 'all'} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(s)}>{s || 'All'}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Bookings Found</h3>
          <p>{statusFilter ? `No ${statusFilter} bookings.` : 'No bookings yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map(b => (
            <div key={b._id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <h5 style={{ marginBottom: '0.2rem' }}>{b.customerId?.name || 'Customer'}</h5>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.customerId?.phone} · {b.customerId?.email}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="booking-meta">
                <div className="booking-meta-item"><Calendar size={13} /> {b.bookingDate}</div>
                <div className="booking-meta-item"><Clock size={13} /> {b.startTime} – {b.endTime}</div>
                <div className="booking-meta-item"><MapPin size={13} /> {b.address}</div>
              </div>
              {b.problemDescription && <p style={{ fontSize: '0.825rem', marginTop: '0.5rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{b.problemDescription}"</p>}
              <div className="booking-actions">
                {getActions(b)}
                <Link to={`/provider/bookings/${b._id}`} className="btn btn-secondary btn-sm">Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProviderBookings;
