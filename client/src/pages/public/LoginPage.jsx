import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', minHeight: '100vh', background: 'radial-gradient(ellipse 80% 80% at 50% 0%, rgba(99,102,241,0.18), transparent)' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Logo */}
          <div className="text-center mb-4">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <img src="/logo.png" alt="QuickFix" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.9rem' }}>Sign in to your account</p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            {error && <div className="alert alert-error mb-3">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing In…</> : 'Sign In'}
              </button>
            </form>
            <div className="divider" />
            <p className="text-center" style={{ fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
