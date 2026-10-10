import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { reviewService } from '../../services';
import { Star } from 'lucide-react';

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

const ProviderReviews = () => {
  const { providerProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerProfile) return;
    reviewService.getByProvider(providerProfile._id, { limit: 50 })
      .then(r => setReviews(r.data.reviews))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [providerProfile]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <DashboardLayout navItems={NAV} title="Reviews">
      <div className="page-header">
        <div className="page-header-left">
          <h2>My Reviews</h2>
          <p>Customer feedback and ratings</p>
        </div>
        {reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245,158,11,0.1)', padding: '0.75rem 1.25rem', borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)' }}>
            <Star size={24} fill="#fbbf24" color="#fbbf24" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{avgRating}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No Reviews Yet</h3>
          <p>Complete bookings to start receiving customer reviews.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(r => (
            <div key={r._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">{r.customerId?.name?.[0] || 'C'}</div>
                  <div>
                    <div className="reviewer-name">{r.customerId?.name || 'Customer'}</div>
                    <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= r.rating ? '#fbbf24' : 'none'} color={i <= r.rating ? '#fbbf24' : '#64748b'} />)}
                  <span style={{ marginLeft: '0.35rem', fontWeight: 700, fontSize: '0.9rem' }}>{r.rating}</span>
                </div>
              </div>
              <p className="review-comment">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProviderReviews;
