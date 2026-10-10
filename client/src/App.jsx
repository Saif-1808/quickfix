import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ServicesPage from './pages/public/ServicesPage';
import ProvidersPage from './pages/public/ProvidersPage';
import ProviderProfilePage from './pages/public/ProviderProfilePage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerBookingDetail from './pages/customer/CustomerBookingDetail';
import CustomerProfile from './pages/customer/CustomerProfile';
import ReviewPage from './pages/customer/ReviewPage';

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderRequests from './pages/provider/ProviderRequests';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderBookingDetail from './pages/provider/ProviderBookingDetail';
import ProviderProfile from './pages/provider/ProviderProfile';
import ProviderReviews from './pages/provider/ProviderReviews';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProviders from './pages/admin/AdminProviders';
import AdminServices from './pages/admin/AdminServices';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminServiceRequests from './pages/admin/AdminServiceRequests';

// Provider extra pages
import ProviderServiceRequests from './pages/provider/ProviderServiceRequests';

// ----- Protected Route Guards -----

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', flexDirection: 'column' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to correct dashboard
    const redirectMap = { admin: '/admin/dashboard', provider: '/provider/dashboard', customer: '/customer/dashboard' };
    return <Navigate to={redirectMap[user?.role] || '/'} replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    const redirectMap = { admin: '/admin/dashboard', provider: '/provider/dashboard', customer: '/customer/dashboard' };
    return <Navigate to={redirectMap[user?.role] || '/'} replace />;
  }
  return children;
};

// ----- About Page (simple) -----
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

const AboutPage = () => (
  <>
    <Navbar />
    <div className="page-wrapper" style={{ paddingTop: '5rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="text-center mb-4">
          <span className="section-tag">About Us</span>
          <h1 style={{ margin: '1rem 0 0.5rem' }}>About QuickFix</h1>
          <p>Your trusted local service marketplace</p>
        </div>
        <div className="card mb-3">
          <h3 style={{ marginBottom: '1rem' }}>🔧 What is QuickFix?</h3>
          <p>QuickFix is a local service marketplace connecting customers with verified professionals. From electricians and plumbers to carpenters and cleaners — find the right person for every job, book in minutes.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '🎯', title: 'Our Mission', desc: 'Make quality local services accessible to everyone.' },
            { icon: '🛡️', title: 'Verified Pros', desc: 'All providers are background checked and approved.' },
            { icon: '⏰', title: 'Time Slot Booking', desc: 'Real-time slot availability, no double bookings.' },
            { icon: '⭐', title: 'Honest Reviews', desc: 'Only verified customers who received the service can review.' },
          ].map(i => (
            <div key={i.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{i.icon}</div>
              <h5 style={{ marginBottom: '0.35rem' }}>{i.title}</h5>
              <p style={{ fontSize: '0.825rem' }}>{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </>
);

// ----- 404 Page -----
const NotFoundPage = () => (
  <>
    <Navbar />
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="text-center">
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ marginBottom: '1rem' }}>404 – Page Not Found</h2>
        <p style={{ marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-primary">Go Home</a>
      </div>
    </div>
    <Footer />
  </>
);

// ----- App Routes -----

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/services" element={<ServicesPage />} />
    <Route path="/providers" element={<ProvidersPage />} />
    <Route path="/providers/:id" element={<ProviderProfilePage />} />

    {/* Auth - guest only */}
    <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
    <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

    {/* Customer */}
    <Route path="/customer/dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
    <Route path="/customer/bookings" element={<ProtectedRoute requiredRole="customer"><CustomerBookings /></ProtectedRoute>} />
    <Route path="/customer/bookings/:id" element={<ProtectedRoute requiredRole="customer"><CustomerBookingDetail /></ProtectedRoute>} />
    <Route path="/customer/profile" element={<ProtectedRoute requiredRole="customer"><CustomerProfile /></ProtectedRoute>} />
    <Route path="/customer/review/:bookingId" element={<ProtectedRoute requiredRole="customer"><ReviewPage /></ProtectedRoute>} />

    {/* Provider */}
    <Route path="/provider/dashboard" element={<ProtectedRoute requiredRole="provider"><ProviderDashboard /></ProtectedRoute>} />
    <Route path="/provider/requests" element={<ProtectedRoute requiredRole="provider"><ProviderRequests /></ProtectedRoute>} />
    <Route path="/provider/bookings" element={<ProtectedRoute requiredRole="provider"><ProviderBookings /></ProtectedRoute>} />
    <Route path="/provider/bookings/:id" element={<ProtectedRoute requiredRole="provider"><ProviderBookingDetail /></ProtectedRoute>} />
    <Route path="/provider/profile" element={<ProtectedRoute requiredRole="provider"><ProviderProfile /></ProtectedRoute>} />
    <Route path="/provider/reviews" element={<ProtectedRoute requiredRole="provider"><ProviderReviews /></ProtectedRoute>} />

    {/* Admin */}
    <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/providers" element={<ProtectedRoute requiredRole="admin"><AdminProviders /></ProtectedRoute>} />
    <Route path="/admin/service-requests" element={<ProtectedRoute requiredRole="admin"><AdminServiceRequests /></ProtectedRoute>} />
    <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin"><AdminServices /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
    <Route path="/admin/bookings" element={<ProtectedRoute requiredRole="admin"><AdminBookings /></ProtectedRoute>} />
    <Route path="/admin/reviews" element={<ProtectedRoute requiredRole="admin"><AdminReviews /></ProtectedRoute>} />

    {/* Provider extra */}
    <Route path="/provider/service-requests" element={<ProtectedRoute requiredRole="provider"><ProviderServiceRequests /></ProtectedRoute>} />

    {/* Catch all */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#fff' } },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
