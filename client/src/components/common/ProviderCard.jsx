import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, IndianRupee } from 'lucide-react';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P';

const RatingStars = ({ rating, total }) => (
  <div className="d-flex align-center gap-sm">
    <div className="rating-stars">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} fill={i <= Math.round(rating) ? '#fbbf24' : 'none'} color={i <= Math.round(rating) ? '#fbbf24' : '#64748b'} />
      ))}
    </div>
    <span className="rating-value" style={{ fontSize: '0.85rem' }}>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
    {total > 0 && <span className="rating-count">({total})</span>}
  </div>
);

const ProviderCard = ({ provider }) => {
  const { _id, businessName, description, experience, location, price, rating, totalReviews, serviceId, userId } = provider;

  return (
    <div className="provider-card fade-in">
      <div className="provider-card-header">
        <div className="provider-avatar">{getInitials(businessName)}</div>
        <div className="provider-card-info">
          <h4>{businessName}</h4>
          <div className="provider-service">{serviceId?.icon} {serviceId?.name}</div>
        </div>
      </div>

      <div className="provider-card-body">
        <div className="provider-meta">
          <div className="provider-meta-item">
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <RatingStars rating={rating} total={totalReviews} />
          </div>
          <div className="provider-meta-item">
            <Clock size={14} color="var(--primary-light)" />
            <span>{experience} Year{experience !== 1 ? 's' : ''} Experience</span>
          </div>
          <div className="provider-meta-item">
            <MapPin size={14} color="var(--secondary)" />
            <span>{location}</span>
          </div>
        </div>

        {description && (
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
            {description.length > 90 ? description.slice(0, 90) + '...' : description}
          </p>
        )}

        <div className="d-flex align-center justify-between">
          <div className="provider-price">
            <IndianRupee size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            {price} <span>/ visit</span>
          </div>
          <Link to={`/providers/${_id}`} className="btn btn-primary btn-sm">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
