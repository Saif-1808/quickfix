import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { userService } from '../../services';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/customer/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { section: 'Bookings' },
  { to: '/customer/bookings', icon: '📋', label: 'My Bookings' },
  { section: 'Account' },
  { to: '/customer/profile', icon: '👤', label: 'Profile' },
];

const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.update(user._id, form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout navItems={NAV} title="My Profile">
      <div style={{ maxWidth: 560 }}>
        <div className="page-header">
          <div className="page-header-left">
            <h2>My Profile</h2>
            <p>Manage your account information</p>
          </div>
        </div>

        <div className="card mb-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="profile-avatar-lg" style={{ width: 72, height: 72, fontSize: '1.5rem' }}>
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>{user?.name}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--primary-light)', textTransform: 'capitalize' }}>{user?.role}</p>
              <p style={{ fontSize: '0.825rem' }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-control" style={{ paddingLeft: '2.5rem' }} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Full Name" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-control" style={{ paddingLeft: '2.5rem', opacity: 0.6 }} value={user?.email} readOnly />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-control" style={{ paddingLeft: '2.5rem' }} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="Phone" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-control" style={{ paddingLeft: '2.5rem' }} value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Your address" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
