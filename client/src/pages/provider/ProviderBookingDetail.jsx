import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService } from '../../services';
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle, XCircle, PlayCircle, FlagOff, ArrowLeft } from 'lucide-react';
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

const ProviderBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getById(id);
      setBooking(res.data.booking);
    } catch { toast.error('Booking not found.'); navigate('/provider/bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooking(); }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await bookingService.updateStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setUpdating(false); }
  };

  if (loading) return (
    <DashboardLayout navItems={NAV} title="Booking Details">
      <div className="loading-center"><span className="spinner spinner-lg" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={NAV} title="Booking Details">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/provider/bookings" className="btn btn-secondary btn-sm mb-2"><ArrowLeft size={14} /> Back</Link>
          <h2>Booking Details</h2>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <h5 style={{ marginBottom: '1rem' }}>Customer Info</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{booking.customerId?.name}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Phone size={13} /> {booking.customerId?.phone}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Mail size={13} /> {booking.customerId?.email}</div>
          </div>
        </div>

        <div className="card">
          <h5 style={{ marginBottom: '1rem' }}>Appointment</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Calendar size={13} color="var(--primary-light)" /> {booking.bookingDate}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Clock size={13} color="var(--secondary)" /> {booking.startTime} – {booking.endTime}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><MapPin size={13} color="var(--accent)" /> {booking.address}</div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <h5 style={{ marginBottom: '0.75rem' }}>Problem Description</h5>
        <p>{booking.problemDescription}</p>
        {booking.additionalNotes && (<><div className="divider" /><h5 style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Notes</h5><p style={{ fontSize: '0.875rem' }}>{booking.additionalNotes}</p></>)}
      </div>

      <div className="booking-actions mt-3">
        {booking.status === 'Pending' && (
          <>
            <button className="btn btn-success" disabled={updating} onClick={() => updateStatus('Accepted')}><CheckCircle size={15} /> Accept Booking</button>
            <button className="btn btn-danger" disabled={updating} onClick={() => updateStatus('Rejected')}><XCircle size={15} /> Reject Booking</button>
          </>
        )}
        {booking.status === 'Accepted' && (
          <button className="btn btn-primary" disabled={updating} onClick={() => updateStatus('In Progress')}><PlayCircle size={15} /> Start Service</button>
        )}
        {booking.status === 'In Progress' && (
          <button className="btn btn-success" disabled={updating} onClick={() => updateStatus('Completed')}><FlagOff size={15} /> Mark as Completed</button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderBookingDetail;
