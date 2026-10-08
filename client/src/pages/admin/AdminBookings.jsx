import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService } from '../../services';
import { NAV } from './AdminDashboard';
import { Calendar, Clock, MapPin, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await bookingService.getAll(params);
      setBookings(res.data.bookings);
    } catch { toast.error('Failed to load bookings.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const STATUSES = ['', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Rejected', 'Cancelled'];

  return (
    <DashboardLayout navItems={NAV} title="Booking Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>All Bookings</h2>
          <p>Monitor all platform bookings</p>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{bookings.length} total</div>
      </div>

      <div className="filter-bar">
        <Filter size={16} color="var(--text-muted)" />
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
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Provider</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.customerId?.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.customerId?.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.providerId?.businessName || 'N/A'}</div>
                  </td>
                  <td>{b.serviceId?.icon} {b.serviceId?.name}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.825rem' }}>
                      <span><Calendar size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {b.bookingDate}</span>
                      <span><Clock size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {b.startTime}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={b.status} /></td>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBookings;
