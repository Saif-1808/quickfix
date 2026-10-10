import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { serviceRequestService } from '../../services';
import { NAV } from './AdminDashboard';
import { CheckCircle, XCircle, Clock, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Pending' },
    Approved: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Approved' },
    Rejected: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Rejected' },
  }[status] || {};
  return (
    <span style={{ background: config.bg, color: config.color, borderRadius: 100, padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700 }}>
      {config.label}
    </span>
  );
};

const AdminServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [reviewModal, setReviewModal] = useState(null); // { req, action: 'Approved'|'Rejected' }
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const res = await serviceRequestService.getAll(params);
      setRequests(res.data.requests);
    } catch { toast.error('Failed to load service requests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const openReview = (req, action) => {
    setReviewModal({ req, action });
    setRejectionReason('');
  };

  const handleReview = async () => {
    if (reviewModal.action === 'Rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.'); return;
    }
    setSaving(true);
    try {
      await serviceRequestService.review(reviewModal.req._id, {
        status: reviewModal.action,
        rejectionReason: rejectionReason.trim(),
      });
      toast.success(`Request ${reviewModal.action.toLowerCase()} successfully.`);
      setReviewModal(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review request.');
    } finally { setSaving(false); }
  };

  const counts = { all: 0, Pending: 0, Approved: 0, Rejected: 0 };
  // We count from current list only for display hint; real counts fetched per tab
  requests.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; counts.all++; });

  return (
    <DashboardLayout navItems={NAV} title="Service Requests">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Service Requests</h2>
          <p>Review and approve provider service submissions</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'Pending', label: '⏳ Pending', color: '#fbbf24' },
          { key: 'Approved', label: '✅ Approved', color: '#34d399' },
          { key: 'Rejected', label: '❌ Rejected', color: '#f87171' },
          { key: '', label: '📋 All', color: 'var(--primary-light)' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-secondary'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{reviewModal.action === 'Approved' ? '✅ Approve' : '❌ Reject'} Service Request</h4>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{reviewModal.req.serviceName || reviewModal.req.serviceId?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                By {reviewModal.req.userId?.name} ({reviewModal.req.userId?.email})<br />
                Category: {reviewModal.req.serviceId?.icon} {reviewModal.req.serviceId?.name} · Rate: ₹{reviewModal.req.hourlyRate}/hr
              </div>
              {reviewModal.req.description && (
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{reviewModal.req.description}</p>
              )}
            </div>

            {reviewModal.action === 'Rejected' && (
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea className="form-control" rows={3} placeholder="Explain why this request is being rejected..."
                  value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} autoFocus />
              </div>
            )}

            {reviewModal.action === 'Approved' && (
              <div className="alert" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#34d399' }}>
                  ✅ Approving will set the provider's hourly rate to ₹{reviewModal.req.hourlyRate}/hr and mark them as eligible for customer bookings.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
              <button
                className={`btn ${reviewModal.action === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleReview} disabled={saving}>
                {saving ? 'Processing…' : reviewModal.action === 'Approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request list */}
      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No {filter} Requests</h3>
          <p>No service requests match the current filter.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Service</th>
                <th>Rate</th>
                <th>Description</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.userId?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.providerId?.businessName}</div>
                  </td>
                  <td>
                    <div>{req.serviceId?.icon} {req.serviceId?.name}</div>
                    {req.serviceName && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.serviceName}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      ₹{req.hourlyRate}/hr
                    </span>
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <div style={{ fontSize: '0.825rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.description || '—'}
                    </div>
                    {req.status === 'Rejected' && req.rejectionReason && (
                      <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>
                        Reason: {req.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.825rem' }}>{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><StatusBadge status={req.status} /></td>
                  <td>
                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-success btn-sm" onClick={() => openReview(req, 'Approved')}>
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => openReview(req, 'Rejected')}>
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}
                    {req.status !== 'Pending' && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-IN') : 'Reviewed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminServiceRequests;
