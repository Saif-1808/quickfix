import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { serviceService } from '../../services';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    serviceService.getAll().then(r => setServices(r.data.services)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(14,165,233,0.08))', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '3rem 0 2rem' }}>
          <div className="container">
            <h1 style={{ marginBottom: '0.5rem' }}>Our Services</h1>
            <p>Browse all available service categories</p>
          </div>
        </div>
        <div className="container section-sm">
          <div style={{ maxWidth: 360, marginBottom: '2rem' }}>
            <div className="search-bar">
              <Search size={16} color="var(--text-muted)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." />
            </div>
          </div>
          {loading ? (
            <div className="loading-center"><span className="spinner spinner-lg" /></div>
          ) : (
            <div className="services-grid">
              {filtered.map(s => (
                <Link key={s._id} to={`/providers?serviceId=${s._id}`} className="service-card">
                  <span className="service-icon">{s.icon}</span>
                  <h4>{s.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{s.description?.slice(0, 50)}...</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ServicesPage;
