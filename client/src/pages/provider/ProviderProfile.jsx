import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { providerService, serviceService, userService } from '../../services';
import { MapPin, Clock, IndianRupee } from 'lucide-react';
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProviderProfile = () => {
  const { user, providerProfile, updateUser, updateProviderProfile } = useAuth();
  const [services, setServices] = useState([]);
  const [userForm, setUserForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [pForm, setPForm] = useState({
    businessName: providerProfile?.businessName || '',
    description: providerProfile?.description || '',
    experience: providerProfile?.experience || '',
    location: providerProfile?.location || '',
    price: providerProfile?.price || '',
    serviceId: providerProfile?.serviceId?._id || '',
    workingDays: providerProfile?.workingDays || ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    workingStartTime: providerProfile?.workingStartTime || '09:00',
    workingEndTime: providerProfile?.workingEndTime || '18:00',
    slotDuration: providerProfile?.slotDuration || 60,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    serviceService.getAll().then(r => setServices(r.data.services)).catch(() => {});
  }, []);

  const toggleDay = (day) => {
    setPForm(f => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter(d => d !== day)
        : [...f.workingDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const [uRes] = await Promise.all([
        userService.update(user._id, userForm),
      ]);
      updateUser(uRes.data.user);

      if (providerProfile) {
        const pRes = await providerService.update(providerProfile._id, pForm);
        updateProviderProfile(pRes.data.provider);
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout navItems={NAV} title="My Profile">
      <div style={{ maxWidth: 680 }}>
        <div className="page-header">
          <div className="page-header-left">
            <h2>My Profile</h2>
            <p>Manage your provider profile and availability</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Info */}
          <div className="card mb-3">
            <h4 style={{ marginBottom: '1.25rem' }}>Personal Information</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={userForm.name} onChange={e => setUserForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={userForm.phone} onChange={e => setUserForm(f => ({...f, phone: e.target.value}))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Address</label>
                <input className="form-control" value={userForm.address} onChange={e => setUserForm(f => ({...f, address: e.target.value}))} />
              </div>
            </div>
          </div>

          {providerProfile && (
            <>
              {/* Business Info */}
              <div className="card mb-3">
                <h4 style={{ marginBottom: '1.25rem' }}>Business Information</h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Business Name</label>
                    <input className="form-control" value={pForm.businessName} onChange={e => setPForm(f => ({...f, businessName: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Category</label>
                    <select className="form-control" value={pForm.serviceId} onChange={e => setPForm(f => ({...f, serviceId: e.target.value}))}>
                      {services.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience (years)</label>
                    <input type="number" className="form-control" value={pForm.experience} onChange={e => setPForm(f => ({...f, experience: e.target.value}))} min="0" max="50" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Starting Price (₹)</label>
                    <input type="number" className="form-control" value={pForm.price} onChange={e => setPForm(f => ({...f, price: e.target.value}))} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-control" value={pForm.location} onChange={e => setPForm(f => ({...f, location: e.target.value}))} placeholder="City, State" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={3} value={pForm.description} onChange={e => setPForm(f => ({...f, description: e.target.value}))} />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="card mb-3">
                <h4 style={{ marginBottom: '1.25rem' }}>Working Hours & Availability</h4>
                <div className="form-group">
                  <label className="form-label">Working Days</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {DAYS.map(d => (
                      <button key={d} type="button"
                        className={`btn btn-sm ${pForm.workingDays.includes(d) ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleDay(d)}>
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input type="time" className="form-control" value={pForm.workingStartTime} onChange={e => setPForm(f => ({...f, workingStartTime: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input type="time" className="form-control" value={pForm.workingEndTime} onChange={e => setPForm(f => ({...f, workingEndTime: e.target.value}))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Slot Duration</label>
                  <select className="form-control" value={pForm.slotDuration} onChange={e => setPForm(f => ({...f, slotDuration: Number(e.target.value)}))}>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProviderProfile;
