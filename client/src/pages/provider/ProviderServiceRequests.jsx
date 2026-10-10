import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { serviceRequestService, serviceService } from '../../services';
import { Plus, RefreshCw, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
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

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', icon: <Clock size={12} />, label: 'Pending' },
    Approved: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', icon: <CheckCircle size={12} />, label: 'Approved' },
    Rejected: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', icon: <XCircle size={12} />, label: 'Rejected' },
  }[status] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', label: status };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: config.bg, color: config.color, borderRadius: 100, padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700 }}>
      {config.icon}{config.label}
    </span>
  );
};

const EMPTY_FORM = { serviceId: '', serviceName: '', description: '', hourlyRate: '' };

const ProviderServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [resubmitId, setResubmitId] = useState(null);
  const [resubmitForm, setResubmitForm] = useState(EMPTY_FORM);

  const fetchRequests = async () => {
    try {
      const res = await serviceRequestService.getMy();
      setRequests(res.data.requests);
    } catch { toast.error('Failed to load service requests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRequests();
    serviceService.getAll().then(r => setServices(r.data.services)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceId) { toast.error('Please select a service category.'); return; }
    if (!form.hourlyRate || form.hourlyRate <= 0) { toast.error('Please enter a valid hourly rate.'); return; }
    setSaving(true);
    try {
      await serviceRequestService.create({ ...form, hourlyRate: Number(form.hourlyRate) });
      toast.success('Service request submitted! Awaiting admin approval.');
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally { setSaving(false); }
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!resubmitForm.hourlyRate || resubmitForm.hourlyRate <= 0) { toast.error('Please enter a valid hourly rate.'); return; }
    setSaving(true);
    try {
      await serviceRequestService.resubmit(resubmitId, { ...resubmitForm, hourlyRate: Number(resubmitForm.hourlyRate) });
      toast.success('Request resubmitted successfully!');
      setResubmitId(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resubmit.');
    } finally { setSaving(false); }
  };

  const openResubmit = (req) => {
    setResubmitId(req._id);
    setResubmitForm({
      serviceId: req.serviceId?._id || '',
      serviceName: req.serviceName || '',
      description: req.description || '',
      hourlyRate: req.hourlyRate || '',
    });
  };

  const ServiceForm = ({ formData, setFormData, onSubmit, submitLabel, onCancel }) => (
    <form onSubmit={onSubmit}>
      <div className="grid-2" style={{ gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Service Category *</label>
          <select className="form-control" value={formData.serviceId} onChange={e => setFormData(f => ({ ...f, serviceId: e.target.value }))} required>
            <option value="">Select a category...</option>
            {services.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Hourly Rate (₹) *</label>
          <input type="number" className="form-control" placeholder="e.g. 300" min="1" value={formData.hourlyRate}
            onChange={e => setFormData(f => ({ ...f, hourlyRate: e.target.value }))} required />
        </div>
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label className="form-label">Service Name / Specialty</label>
          <input className="form-control" placeholder="e.g. Home Electrical Wiring & Repair" value={formData.serviceName}
            onChange={e => setFormData(f => ({ ...f, serviceName: e.target.value }))} />
        </div>
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={3} placeholder="Describe your services, experience, and expertise..." value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Send size={14} /> {saving ? 'Submitting…' : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <DashboardLayout navItems={NAV} title="My Service Requests">
      <div className="page-header">
        <div className="page-header-left">
          <h2>My Service Requests</h2>
          <p>Submit service offerings for admin approval</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="card mb-4" style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.05)' }}>
          <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Submit New Service Request
          </h4>
          <ServiceForm formData={form} setFormData={setForm} onSubmit={handleSubmit} submitLabel="Submit Request" onCancel={() => { setShowForm(false); setForm(EMPTY_FORM); }} />
        </div>
      )}

      {/* Resubmit Form Modal */}
      {resubmitId && (
        <div className="modal-overlay" onClick={() => setResubmitId(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4><RefreshCw size={16} style={{ display: 'inline', marginRight: 8 }} />Resubmit Request</h4>
              <button className="modal-close" onClick={() => setResubmitId(null)}>✕</button>
            </div>
            <p style={{ marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Correct the information below and resubmit for admin review.
            </p>
            <ServiceForm formData={resubmitForm} setFormData={setResubmitForm} onSubmit={handleResubmit} submitLabel="Resubmit" onCancel={() => setResubmitId(null)} />
          </div>
        </div>
      )}

      {/* Request List */}
      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>No Service Requests Yet</h3>
          <p>Submit a service request to start getting bookings. Admin will review and approve your service.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Submit First Request</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req._id} className="card" style={{
              border: `1px solid ${req.status === 'Approved' ? 'rgba(16,185,129,0.25)' : req.status === 'Rejected' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
              background: req.status === 'Approved' ? 'rgba(16,185,129,0.03)' : req.status === 'Rejected' ? 'rgba(239,68,68,0.03)' : 'rgba(245,158,11,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{req.serviceId?.icon}</span>
                    <h5 style={{ margin: 0 }}>{req.serviceName || req.serviceId?.name}</h5>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {req.serviceId?.name} · ₹{req.hourlyRate}/hr · Submitted {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              {req.description && (
                <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>{req.description}</p>
              )}

              {req.status === 'Rejected' && req.rejectionReason && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '0.25rem' }}>❌ Rejection Reason:</div>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>{req.rejectionReason}</p>
                </div>
              )}

              {req.status === 'Approved' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#34d399' }}>
                  <CheckCircle size={13} /> Approved by admin · Reviewed {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-IN') : ''}
                </div>
              )}

              {req.status === 'Rejected' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => openResubmit(req)}>
                    <RefreshCw size={13} /> Correct & Resubmit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProviderServiceRequests;
