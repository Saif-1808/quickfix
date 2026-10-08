import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Search, Star, ChevronRight, Shield, Clock, ThumbsUp, ArrowRight } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProviderCard from '../../components/common/ProviderCard';
import { serviceService, providerService } from '../../services';

const SERVICES = [
  { icon: '⚡', name: 'Electrician' }, { icon: '🔧', name: 'Plumber' },
  { icon: '🪚', name: 'Carpenter' }, { icon: '🧹', name: 'Cleaning' },
  { icon: '❄️', name: 'AC Repair' }, { icon: '🔌', name: 'Appliance Repair' },
  { icon: '💻', name: 'Computer/Laptop Repair' }, { icon: '🎨', name: 'Painter' },
  { icon: '🔐', name: 'Locksmith' },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'Choose a Service', desc: 'Browse our wide range of professional home services.' },
  { step: 2, title: 'Select a Provider', desc: 'View profiles, ratings, and choose the best professional.' },
  { step: 3, title: 'Pick a Time Slot', desc: 'Select a convenient date and available time slot.' },
  { step: 4, title: 'Get It Done', desc: 'Provider arrives, completes the job. Rate them after!' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [svcRes, pRes] = await Promise.all([
          serviceService.getAll(),
          providerService.getAll({ limit: 6 }),
        ]);
        setServices(svcRes.data.services);
        setFeaturedProviders(pRes.data.providers);
      } catch { /* silently fail on homepage */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/providers?search=${search}`);
  };

  const displayServices = services.length > 0 ? services : SERVICES;

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="container hero-content">
            <div className="hero-grid">
              <div>
                <div className="hero-badge">
                  <Zap size={14} /> Trusted by 10,000+ customers
                </div>
                <h1>
                  Reliable Local Services,<br />
                  <span className="hero-gradient-text">Right When You Need Them.</span>
                </h1>
                <p>Find trusted local professionals for your everyday service needs. From electricians to plumbers — book in minutes, get served the same day.</p>
                
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', maxWidth: '460px' }}>
                  <div className="search-bar" style={{ flex: 1, maxWidth: '100%' }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search services or providers..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Search</button>
                </form>

                <div className="hero-actions">
                  <Link to="/services" className="btn btn-primary btn-lg">
                    Find a Service <ArrowRight size={16} />
                  </Link>
                  <Link to="/providers" className="btn btn-secondary btn-lg">Browse Providers</Link>
                </div>

                <div className="hero-stats">
                  <div className="hero-stat"><div className="num">500+</div><div className="label">Service Pros</div></div>
                  <div className="hero-stat"><div className="num">10K+</div><div className="label">Happy Customers</div></div>
                  <div className="hero-stat"><div className="num">4.8★</div><div className="label">Avg Rating</div></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(14,165,233,0.1))', borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(99,102,241,0.3)', maxWidth: 360, width: '100%' }}>
                  <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>⚡🔧🪚🧹</div>
                  <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>9 Service Categories</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    {SERVICES.map(s => (
                      <div key={s.name} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.75rem 0.5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.name.split('/')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Our Services</span>
              <h2>What Do You Need Help With?</h2>
              <p>Choose from our wide range of professional home and office services</p>
            </div>
            <div className="services-grid">
              {displayServices.map(s => (
                <Link key={s.name || s._id} to={`/providers?serviceId=${s._id || ''}&serviceName=${s.name}`} className="service-card">
                  <span className="service-icon">{s.icon}</span>
                  <h4>{s.name}</h4>
                </Link>
              ))}
            </div>
            <div className="text-center mt-3">
              <Link to="/services" className="btn btn-secondary">View All Services <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Simple Process</span>
              <h2>How QuickFix Works</h2>
              <p>Book a service in 4 easy steps</p>
            </div>
            <div className="steps-grid">
              {HOW_IT_WORKS.map(step => (
                <div key={step.step} className="step-card">
                  <div className="step-number">{step.step}</div>
                  <h4>{step.title}</h4>
                  <p style={{ fontSize: '0.875rem' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PROVIDERS */}
        {featuredProviders.length > 0 && (
          <section className="section" style={{ background: 'var(--bg-secondary)' }}>
            <div className="container">
              <div className="section-header">
                <span className="section-tag">Top Rated</span>
                <h2>Featured Service Providers</h2>
                <p>Trusted professionals with verified skills and great reviews</p>
              </div>
              <div className="providers-grid">
                {featuredProviders.map(p => <ProviderCard key={p._id} provider={p} />)}
              </div>
              <div className="text-center mt-3">
                <Link to="/providers" className="btn btn-primary">Explore All Providers <ArrowRight size={14} /></Link>
              </div>
            </div>
          </section>
        )}

        {/* BENEFITS */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Why QuickFix</span>
              <h2>Why Customers Love Us</h2>
            </div>
            <div className="grid-3">
              {[
                { icon: <Shield size={28} color="var(--primary-light)" />, title: 'Verified Professionals', desc: 'All service providers are background-checked, verified, and approved before joining.' },
                { icon: <Clock size={28} color="var(--secondary)" />, title: 'On-Time Service', desc: 'Real-time scheduling with time slot booking ensures providers arrive when expected.' },
                { icon: <ThumbsUp size={28} color="var(--accent)" />, title: 'Satisfaction Guaranteed', desc: 'Rate every service. Our quality monitoring ensures consistently great experiences.' },
              ].map((benefit, i) => (
                <div key={i} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {benefit.icon}
                    </div>
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{benefit.title}</h4>
                  <p style={{ fontSize: '0.875rem' }}>{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.1))', borderTop: '1px solid rgba(99,102,241,0.2)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="container text-center">
            <h2 style={{ marginBottom: '1rem' }}>Ready to Get Started?</h2>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Join thousands of satisfied customers. Book your first service today!</p>
            <div className="d-flex justify-center gap-md flex-wrap">
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/providers" className="btn btn-secondary btn-lg">Browse Providers</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
