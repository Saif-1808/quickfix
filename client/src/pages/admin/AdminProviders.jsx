import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { providerService, serviceService, userService } from '../../services';
import { NAV } from './AdminDashboard';
import { Plus, Edit2, Check, X, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showSchedule, setShowSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [form, setForm] = useState({ userId: '', serviceId: '', businessName: '', description: '', experience: 1, location: '', price: 500, isApproved: true });
  const [saving, setSaving] = useState(false);

  const fetchProviders = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        providerService.getAll({ isActive: true }),
        serviceService.getAll(),
      ]);
      setProviders(pRes.data.providers);
      setServices(sRes.data.services);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll({ role: 'provider', isActive: true });
      setUsers(res.data.users);
    } catch {}
  };

  useEffect(() => { fetchProviders(); fetchUsers(); }, []);

  const handleToggle = async (provider, field) => {
    try {
      await providerService.updateStatus(provider._id, { [field]: !provider[field] });
      toast.success(`Provider ${field} updated.`);
      fetchProviders();
    } catch { toast.error('Failed.'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await providerService.create(form);
      toast.success('Provider created!');
      setShowAdd(false);
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create provider.');
    } finally { setSaving(false); }
  };

  const viewSchedule = async (provider) => {
    setShowSchedule(provider);
    setScheduleLoading(true);
    try {
      const res = await providerService.getSchedule(provider._id, scheduleDate);
      setSchedule(res.data);
    } catch { setSchedule(null); }
    finally { setScheduleLoading(false); }
  };

  const loadSchedule = async () => {
    if (!showSchedule) return;
    setScheduleLoading(true);
    try {
      const res = await providerService.getSchedule(showSchedule._id, scheduleDate);
      setSchedule(res.data);
    } catch { setSchedule(null); }
    finally { setScheduleLoading(false); }
  };

  return (
    <DashboardLayout navItems={NAV} title="Provider Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Providers</h2>
          <p>Manage all service providers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Provider</button>
      </div>

      {/* Add Provider Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Add New Provider</h4>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Select Provider User *</label>
                  <select className="form-control" value={form.userId} onChange={e => setForm(f => ({...f, userId: e.target.value}))} required>
                    <option value="">Select a user with provider role...</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Service Category *</label>
                  <select className="form-control" value={form.serviceId} onChange={e => setForm(f => ({...f, serviceId: e.target.value}))} required>
                    <option value="">Select service...</option>
                    {services.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input className="form-control" value={form.businessName} onChange={e => setForm(f => ({...f, businessName: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input type="number" className="form-control" value={form.experience} onChange={e => setForm(f => ({...f, experience: Number(e.target.value)}))} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-control" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Starting Price (₹)</label>
                  <input type="number" className="form-control" value={form.price} onChange={e => setForm(f => ({...f, price: Number(e.target.value)}))} min="0" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isApproved} onChange={e => setForm(f => ({...f, isApproved: e.target.checked}))} />
                    <span className="form-label" style={{ margin: 0 }}>Approve immediately</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Provider'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="modal-overlay" onClick={() => setShowSchedule(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>📅 Schedule: {showSchedule.businessName}</h4>
              <button className="modal-close" onClick={() => setShowSchedule(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={loadSchedule}>Load</button>
            </div>
            {scheduleLoading ? (
              <div className="loading-center" style={{ padding: '2rem' }}><span className="spinner" /></div>
            ) : schedule?.schedule ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {schedule.schedule.map(slot => (
                  <div key={slot.time} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: 8, background: slot.status === 'Available' ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.08)', border: `1px solid ${slot.status === 'Available' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}` }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{slot.displayTime}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.825rem', color: slot.status === 'Available' ? '#34d399' : 'var(--primary-light)', fontWeight: 600 }}>{slot.status}</span>
                      {slot.customer && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{slot.customer.name}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">No schedule data available for this date.</div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Service</th>
                <th>Location</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.businessName}</div>
                    <div style={{ fontSize: '0.8rem' }}>{p.userId?.name}</div>
                  </td>
                  <td>{p.serviceId?.icon} {p.serviceId?.name}</td>
                  <td>{p.location}</td>
                  <td>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>★ {p.rating > 0 ? p.rating.toFixed(1) : 'New'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> ({p.totalReviews})</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${p.isApproved ? 'badge-active' : 'badge-inactive'}`}>{p.isApproved ? 'Approved' : 'Pending'}</span>
                      <span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className={`btn btn-sm ${p.isApproved ? 'btn-secondary' : 'btn-success'}`} onClick={() => handleToggle(p, 'isApproved')} title={p.isApproved ? 'Revoke Approval' : 'Approve'}>
                        {p.isApproved ? <X size={13} /> : <Check size={13} />} {p.isApproved ? 'Unapprove' : 'Approve'}
                      </button>
                      <button className={`btn btn-sm ${p.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => handleToggle(p, 'isActive')}>
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-secondary btn-sm btn-icon" title="View Schedule" onClick={() => viewSchedule(p)}>
                        <Calendar size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {providers.length === 0 && <div className="empty-state"><div className="empty-icon">🔧</div><h3>No providers</h3></div>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminProviders;
