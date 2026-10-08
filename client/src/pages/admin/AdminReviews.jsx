import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { reviewService } from '../../services';
import { NAV } from './AdminDashboard';
import { Star } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService.getAll({ limit: 100 })
      .then(r => setReviews(r.data.reviews))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2)
    : 'N/A';

  return (
    <DashboardLayout navItems={NAV} title="Review Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Reviews</h2>
          <p>Monitor all customer reviews and ratings</p>
        </div>
        {reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245,158,11,0.1)', padding: '0.6rem 1rem', borderRadius: 10, border: '1px solid rgba(245,158,11,0.3)' }}>
            <Star size={18} fill="#fbbf24" color="#fbbf24" />
            <span style={{ fontWeight: 700 }}>{avgRating}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>avg ({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : reviews.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">⭐</div><h3>No Reviews Yet</h3></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Provider</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.customerId?.name || 'Customer'}</td>
                  <td>{r.providerId?.businessName || 'Provider'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={13} fill={i <= r.rating ? '#fbbf24' : 'none'} color={i <= r.rating ? '#fbbf24' : '#64748b'} />)}
                      <span style={{ fontWeight: 700, marginLeft: '0.25rem' }}>{r.rating}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 300, fontSize: '0.85rem' }}>
                    {r.comment?.length > 80 ? r.comment.slice(0, 80) + '…' : r.comment}
                  </td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminReviews;
