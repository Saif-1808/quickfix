import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProviderCard from '../../components/common/ProviderCard';
import { providerService, serviceService } from '../../services';

const ProvidersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedService, setSelectedService] = useState(searchParams.get('serviceId') || '');
  const [location, setLocation] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedService) params.serviceId = selectedService;
      if (location) params.location = location;
      if (search) params.search = search;
      const res = await providerService.getAll(params);
      setProviders(res.data.providers);
    } catch { setProviders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { serviceService.getAll().then(r => setServices(r.data.services)).catch(() => {}); }, []);
  useEffect(() => { fetchProviders(); }, [selectedService, location]);

  const handleSearch = e => {
    e.preventDefault();
    fetchProviders();
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(14,165,233,0.08))', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '3rem 0 2rem' }}>
          <div className="container">
            <h1 style={{ marginBottom: '0.5rem' }}>Find Service Providers</h1>
            <p>Browse verified professionals near you</p>
          </div>
        </div>

        <div className="container section-sm">
          {/* Search + Filters */}
          <div className="card mb-4" style={{ padding: '1.25rem' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label className="form-label">Search</label>
                <div className="search-bar" style={{ maxWidth: '100%' }}>
                  <Search size={16} color="var(--text-muted)" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Provider name, business..." style={{ padding: '0.6rem 0' }} />
                </div>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label className="form-label">Service Category</label>
                <select className="form-control" value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                  <option value="">All Services</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label className="form-label">Location</label>
                <input className="form-control" value={location} onChange={e => setLocation(e.target.value)} placeholder="City or area..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', height: 44 }}>
                <Search size={16} /> Search
              </button>
            </form>
          </div>

          {/* Results */}
          {loading ? (
            <div className="loading-center"><span className="spinner spinner-lg" /><p>Loading providers...</p></div>
          ) : providers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No Providers Found</h3>
              <p>
                {selectedService
                  ? 'No approved providers are currently available for this service category.'
                  : 'Try adjusting your search filters or browse all providers.'}
              </p>
              <button className="btn btn-primary" onClick={() => { setSearch(''); setSelectedService(''); setLocation(''); }}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '0.3rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                  {providers.length} eligible provider{providers.length !== 1 ? 's' : ''} found
                </div>
                {(search || selectedService || location) && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedService && services.find(s => s._id === selectedService)?.name ? `in ${services.find(s => s._id === selectedService)?.name}` : ''}
                    {location ? ` near "${location}"` : ''}
                    {search ? ` matching "${search}"` : ''}
                  </span>
                )}
              </div>
              <div className="providers-grid">
                {providers.map(p => <ProviderCard key={p._id} provider={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProvidersPage;
