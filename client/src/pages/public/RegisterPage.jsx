import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';

const iconStyle = {
  position: 'absolute', left: '0.9rem', top: '50%',
  transform: 'translateY(-50%)', color: 'var(--text-muted)',
  pointerEvents: 'none',
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    password: '', confirmPassword: '',
    role: 'customer', address: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email is required.';
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit Indian phone number required.';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      toast.success('Account created! Welcome to QuickFix!');
      if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6rem 1rem 3rem',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15), transparent)',
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          {/* Logo */}
          <div className="text-center mb-4">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={22} color="#fff" />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>QuickFix</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Create Your Account</h2>
            <p style={{ fontSize: '0.9rem' }}>Join thousands of satisfied customers</p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={iconStyle} />
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    className={`form-control${errors.name ? ' is-invalid' : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              {/* Email + Phone row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Email *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={iconStyle} />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      className={`form-control${errors.email ? ' is-invalid' : ''}`}
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">Phone *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={iconStyle} />
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      className={`form-control${errors.phone ? ' is-invalid' : ''}`}
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
              </div>

              {/* Password row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={iconStyle} />
                    <input
                      id="reg-password"
                      name="password"
                      type={showPwd ? 'text' : 'password'}
                      className={`form-control${errors.password ? ' is-invalid' : ''}`}
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={iconStyle} />
                    <input
                      id="reg-confirm"
                      name="confirmPassword"
                      type={showPwd ? 'text' : 'password'}
                      className={`form-control${errors.confirmPassword ? ' is-invalid' : ''}`}
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-address">Address (optional)</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={iconStyle} />
                  <input
                    id="reg-address"
                    name="address"
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Your city / locality"
                    value={form.address}
                    onChange={handleChange}
                    autoComplete="street-address"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">I am a...</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[
                    { val: 'customer', label: '👤 Customer' },
                    { val: 'provider', label: '🔧 Service Provider' },
                  ].map(r => (
                    <label key={r.val} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', padding: '0.75rem', borderRadius: 8,
                      border: `2px solid ${form.role === r.val ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                      background: form.role === r.val ? 'rgba(99,102,241,0.15)' : 'transparent',
                      cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                      color: form.role === r.val ? 'var(--primary-light)' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}>
                      <input
                        type="radio" name="role" value={r.val}
                        checked={form.role === r.val}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg mt-2" disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating Account…</>
                  : 'Create Account'}
              </button>
            </form>

            <p className="text-center mt-3" style={{ fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
