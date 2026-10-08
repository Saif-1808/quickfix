import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { serviceService } from '../../services';
import { NAV } from './AdminDashboard';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '🔧', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const res = await serviceService.getAll();
      setServices(res.data.services);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => { setForm({ name: '', description: '', icon: '🔧', isActive: true }); setEditing(null); setShowForm(false); };

  const startEdit = (s) => {
    setEditing(s._id);
    setForm({ name: s.name, description: s.description, icon: s.icon, isActive: s.isActive });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) { toast.error('Name and description are required.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await serviceService.update(editing, form);
        toast.success('Service updated!');
      } else {
        await serviceService.create(form);
        toast.success('Service created!');
      }
      resetForm();
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try {
      await serviceService.delete(id);
      toast.success('Service deactivated.');
      fetch();
    } catch { toast.error('Failed.'); }
  };

  const toggleActive = async (s) => {
    try {
      await serviceService.update(s._id, { isActive: !s.isActive });
      toast.success(`Service ${s.isActive ? 'deactivated' : 'activated'}`);
      fetch();
    } catch { toast.error('Failed.'); }
  };

  const ICONS = ['⚡', '🔧', '🪚', '🧹', '❄️', '🔌', '💻', '🎨', '🔐', '🏠', '🚗', '🌿', '🔑', '🛁'];

  return (
    <DashboardLayout navItems={NAV} title="Service Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Services</h2>
          <p>Manage service categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{editing ? 'Edit Service' : 'Add New Service'}</h4>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Electrician" />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief description of the service..." />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {ICONS.map(ic => (
                    <button key={ic} type="button"
                      style={{ fontSize: '1.5rem', padding: '0.35rem', borderRadius: 8, background: form.icon === ic ? 'rgba(99,102,241,0.2)' : 'transparent', border: form.icon === ic ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer' }}
                      onClick={() => setForm(f => ({...f, icon: ic}))}>
                      {ic}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span>Selected: {form.icon}</span>
                  <input value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} style={{ width: 60, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.35rem', color: 'inherit', fontSize: '1rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
          {services.map(s => (
            <div key={s._id} className="card" style={{ opacity: s.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <h5 style={{ marginBottom: '0.2rem' }}>{s.name}</h5>
                  <p style={{ fontSize: '0.8rem' }}>{s.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${s.isActive ? 'badge-active' : 'badge-inactive'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-secondary btn-icon btn-sm" title="Edit" onClick={() => startEdit(s)}><Edit2 size={13} /></button>
                  <button className={`btn btn-sm ${s.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleActive(s)}>
                    {s.isActive ? <X size={13} /> : <Check size={13} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminServices;
