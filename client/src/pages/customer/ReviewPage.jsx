import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { bookingService, reviewService } from '../../services';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/customer/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { section: 'Bookings' },
  { to: '/customer/bookings', icon: '📋', label: 'My Bookings' },
  { section: 'Account' },
  { to: '/customer/profile', icon: '👤', label: 'Profile' },
];

const ReviewPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          bookingService.getById(bookingId),
          reviewService.getByBooking(bookingId),
        ]);
        setBooking(bRes.data.booking);
        if (rRes.data.review) {
          setExistingReview(rRes.data.review);
          setRating(rRes.data.review.rating);
          setComment(rRes.data.review.comment);
        }
        if (bRes.data.booking.status !== 'Completed') {
          toast.error('Only completed bookings can be reviewed.');
          navigate('/customer/bookings');
        }
      } catch { toast.error('Booking not found.'); navigate('/customer/bookings'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating.'); return; }
    if (!comment.trim() || comment.trim().length < 5) { toast.error('Please write a review (min 5 characters).'); return; }
    setSubmitting(true);
    try {
      await reviewService.create({ bookingId, rating, comment });
      toast.success('Review submitted! Thank you for your feedback.');
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <DashboardLayout navItems={NAV} title="Write Review">
      <div className="loading-center"><span className="spinner spinner-lg" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={NAV} title="Write Review">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Rate Your Service</h2>
        <p style={{ marginBottom: '2rem' }}>Share your experience with {booking?.providerId?.businessName}</p>

        {/* Booking summary */}
        <div className="card mb-3">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '1.1rem', flexShrink: 0 }}>
              {booking?.providerId?.businessName?.[0]}
            </div>
            <div>
              <h5 style={{ marginBottom: '0.2rem' }}>{booking?.providerId?.businessName}</h5>
              <p style={{ fontSize: '0.825rem', color: 'var(--primary-light)' }}>{booking?.serviceId?.icon} {booking?.serviceId?.name}</p>
              <p style={{ fontSize: '0.825rem' }}>{booking?.bookingDate} at {booking?.startTime}</p>
            </div>
          </div>
        </div>

        {existingReview ? (
          <div className="card">
            <div className="alert alert-info mb-3">You have already reviewed this booking.</div>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={28} fill={i <= existingReview.rating ? '#fbbf24' : 'none'} color={i <= existingReview.rating ? '#fbbf24' : '#64748b'} />)}
            </div>
            <p>{existingReview.comment}</p>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit}>
              {/* Star rating */}
              <div className="form-group">
                <label className="form-label">How was your experience?</label>
                <div className="star-rating" style={{ marginTop: '0.75rem' }}>
                  {[1,2,3,4,5].map(i => (
                    <button
                      key={i}
                      type="button"
                      className={`star-btn ${i <= (hover || rating) ? 'active' : ''}`}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(i)}
                    >
                      <Star size={40} fill={i <= (hover || rating) ? '#fbbf24' : 'none'} color={i <= (hover || rating) ? '#fbbf24' : '#374151'} />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--primary-light)' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Write Your Review</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Share your experience with this provider..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  minLength={5}
                  maxLength={1000}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{comment.length}/1000</p>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting || rating === 0}>
                {submitting ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting…</> : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewPage;
