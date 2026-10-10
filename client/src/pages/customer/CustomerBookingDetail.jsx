import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { bookingService, reviewService } from '../../services';
import { Calendar, Clock, MapPin, User, Star, ArrowLeft, Phone, IndianRupee, Timer } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/customer/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { section: 'Bookings' },
  { to: '/customer/bookings', icon: '📋', label: 'My Bookings' },
  { section: 'Account' },
  { to: '/customer/profile', icon: '👤', label: 'Profile' },
];

const InfoRow = ({ label, value, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{icon}{label}</span>
    <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
  </div>
);

const CustomerBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          bookingService.getById(id),
          reviewService.getByBooking(id),
        ]);
        setBooking(bRes.data.booking);
        setReview(rRes.data.review);
      } catch { toast.error('Booking not found.'); navigate('/customer/bookings'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await bookingService.updateStatus(id, 'Cancelled');
      toast.success('Booking cancelled.');
      const res = await bookingService.getById(id);
      setBooking(res.data.booking);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel.');
    } finally { setCancelling(false); }
  };

  const STATUS_STEPS = ['Pending', 'Accepted', 'In Progress', 'Completed'];

  if (loading) return (
    <DashboardLayout navItems={NAV} title="Booking Details">
      <div className="loading-center"><span className="spinner spinner-lg" /></div>
    </DashboardLayout>
  );

  if (!booking) return null;

  const stepIdx = STATUS_STEPS.indexOf(booking.status);
  const isTerminal = ['Rejected', 'Cancelled'].includes(booking.status);

  // Provider contact — only show phone after booking is Accepted or beyond
  const showProviderContact = ['Accepted', 'In Progress', 'Completed'].includes(booking.status);
  const providerUser = booking.providerId?.userId;
  const providerPhone = providerUser?.phone;

  return (
    <DashboardLayout navItems={NAV} title="Booking Details">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/customer/bookings" className="btn btn-secondary btn-sm mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h2>Booking Details</h2>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Progress tracker */}
      {!isTerminal && (
        <div className="card mb-3">
          <h5 style={{ marginBottom: '1.25rem' }}>Booking Progress</h5>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {STATUS_STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: '1 0 auto', minWidth: 80 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: i <= stepIdx ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'rgba(255,255,255,0.08)', border: i <= stepIdx ? 'none' : '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 700, boxShadow: i <= stepIdx ? 'var(--shadow-primary)' : 'none', transition: 'all 0.3s' }}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: i <= stepIdx ? 'var(--primary-light)' : 'var(--text-muted)', fontWeight: i === stepIdx ? 700 : 400, textAlign: 'center' }}>{s}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ flex: '1 0 20px', height: 2, background: i < stepIdx ? 'var(--primary)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

        {/* Provider Info Card */}
        <div className="card" style={{ border: showProviderContact ? '1px solid rgba(16,185,129,0.25)' : undefined }}>
          <h5 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={16} /> Provider Information
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <InfoRow label="Business" value={booking.providerId?.businessName} />
            <InfoRow label="Service" value={`${booking.serviceId?.icon || ''} ${booking.serviceId?.name || ''}`} />
            {showProviderContact ? (
              <>
                <InfoRow
                  label="Provider Name"
                  value={providerUser?.name || '—'}
                  icon={<User size={12} />}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={12} /> Contact
                  </span>
                  {providerPhone ? (
                    <a href={`tel:${providerPhone}`} style={{ fontWeight: 700, color: 'var(--secondary)', textDecoration: 'none' }}>
                      📞 {providerPhone}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Not available</span>
                  )}
                </div>
                <InfoRow label="Location" value={booking.providerId?.location || '—'} />
              </>
            ) : (
              <div style={{ padding: '0.75rem 0', fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔒 Provider contact visible after acceptance
              </div>
            )}
          </div>
        </div>

        {/* Appointment + Pricing Card */}
        <div className="card">
          <h5 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} /> Appointment & Pricing
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <InfoRow label="Date" value={booking.bookingDate} icon={<Calendar size={12} />} />
            <InfoRow label="Start Time" value={booking.startTime} icon={<Clock size={12} />} />
            <InfoRow label="End Time" value={booking.endTime} icon={<Clock size={12} />} />
            {booking.durationHours && (
              <InfoRow label="Duration" value={`${booking.durationHours} hour${booking.durationHours > 1 ? 's' : ''}`} icon={<Timer size={12} />} />
            )}
            <InfoRow label="Hourly Rate" value={`₹${booking.providerId?.price || '—'}/hr`} icon={<IndianRupee size={12} />} />
            {booking.totalPrice > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', padding: '0.5rem 0', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Price</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>₹{booking.totalPrice}</span>
              </div>
            ) : null}
            <InfoRow label="Address" value={booking.address} icon={<MapPin size={12} />} />
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <h5 style={{ marginBottom: '0.75rem' }}>Problem Description</h5>
        <p style={{ fontSize: '0.9rem' }}>{booking.problemDescription}</p>
        {booking.additionalNotes && (
          <>
            <div className="divider" />
            <h5 style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Additional Notes</h5>
            <p style={{ fontSize: '0.875rem' }}>{booking.additionalNotes}</p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="booking-actions mt-3">
        {booking.status === 'Pending' && (
          <button className="btn btn-danger" disabled={cancelling} onClick={handleCancel}>
            {cancelling ? 'Cancelling…' : 'Cancel Booking'}
          </button>
        )}
        {booking.status === 'Completed' && !review && (
          <Link to={`/customer/review/${booking._id}`} className="btn btn-warning">
            <Star size={15} /> Rate This Service
          </Link>
        )}
        {booking.status === 'Completed' && review && (
          <div className="card" style={{ width: '100%' }}>
            <h5 style={{ marginBottom: '0.75rem' }}>Your Review</h5>
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={18} fill={i <= review.rating ? '#fbbf24' : 'none'} color={i <= review.rating ? '#fbbf24' : '#64748b'} />)}
            </div>
            <p style={{ fontSize: '0.875rem' }}>{review.comment}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerBookingDetail;
