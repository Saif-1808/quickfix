import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, IndianRupee, Calendar, ChevronLeft, ChevronRight, User, Briefcase, CheckCircle } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { providerService, reviewService, bookingService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const formatDate = (d) => d.toISOString().split('T')[0];
const formatDisplay = (d) => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const ProviderProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availLoading, setAvailLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ problemDescription: '', address: user?.address || '', additionalNotes: '', durationHours: 1 });
  const [step, setStep] = useState('profile'); // profile | book

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          providerService.getById(id),
          reviewService.getByProvider(id, { limit: 5 }),
        ]);
        setProvider(pRes.data.provider);
        setReviews(rRes.data.reviews);
      } catch { toast.error('Provider not found.'); navigate('/providers'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!provider || step !== 'book') return;
    const fetchAvail = async () => {
      setAvailLoading(true);
      setSelectedSlot(null);
      try {
        const res = await providerService.getAvailability(id, formatDate(selectedDate));
        setAvailability(res.data);
      } catch { setAvailability(null); }
      finally { setAvailLoading(false); }
    };
    fetchAvail();
  }, [selectedDate, id, step]);

  const changeDate = (days) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    // Don't allow past dates
    const today = new Date(); today.setHours(0,0,0,0);
    if (next >= today) setSelectedDate(next);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) { toast.error('Please select a time slot.'); return; }
    if (!bookingForm.problemDescription.trim()) { toast.error('Please describe the problem.'); return; }
    if (!bookingForm.address.trim()) { toast.error('Please enter service address.'); return; }
    setBooking(true);
    try {
      const res = await bookingService.create({
        providerId: id,
        serviceId: provider.serviceId._id,
        bookingDate: formatDate(selectedDate),
        startTime: selectedSlot.time,
        durationHours: bookingForm.durationHours,
        problemDescription: bookingForm.problemDescription,
        address: bookingForm.address,
        additionalNotes: bookingForm.additionalNotes,
      });
      toast.success('Booking created! Waiting for provider confirmation.');
      navigate(`/customer/bookings/${res.data.booking._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed.';
      toast.error(msg);
      if (err.response?.status === 409) {
        // Re-fetch availability to show updated state
        const r = await providerService.getAvailability(id, formatDate(selectedDate));
        setAvailability(r.data);
        setSelectedSlot(null);
      }
    } finally { setBooking(false); }
  };

  const StarRow = ({ rating, size = 16 }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => <Star key={i} size={size} fill={i <= Math.round(rating) ? '#fbbf24' : 'none'} color={i <= Math.round(rating) ? '#fbbf24' : '#64748b'} />)}
    </div>
  );

  if (loading) return (
    <>
      <Navbar />
      <div className="page-wrapper loading-center"><span className="spinner spinner-lg" /><p>Loading...</p></div>
    </>
  );

  if (!provider) return null;

  const initials = provider.businessName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(14,165,233,0.06))', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '2rem 0' }}>
          <div className="container">
            <div className="profile-header">
              <div className="profile-avatar-lg">{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <h2 style={{ marginBottom: 0 }}>{provider.businessName}</h2>
                  {provider.isApproved && <span className="badge badge-active" style={{ fontSize: '0.7rem' }}><CheckCircle size={11} /> Verified</span>}
                </div>
                <p style={{ color: 'var(--primary-light)', fontWeight: 600, marginBottom: '0.75rem' }}>{provider.serviceId?.icon} {provider.serviceId?.name}</p>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <StarRow rating={provider.rating} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({provider.totalReviews} reviews)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} /> {provider.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <Briefcase size={14} /> {provider.experience} Years Experience
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>
                  <IndianRupee size={20} style={{ display: 'inline', verticalAlign: 'middle' }} />{provider.price}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Starting price</div>
                {step === 'profile' && isAuthenticated && user?.role === 'customer' && (
                  <button className="btn btn-primary mt-2" onClick={() => setStep('book')}>
                    <Calendar size={15} /> Book Service
                  </button>
                )}
                {!isAuthenticated && (
                  <button className="btn btn-primary mt-2" onClick={() => navigate('/login')}>
                    Login to Book
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container section-sm">
          {step === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div>
                {/* About */}
                <div className="card mb-3">
                  <h4 style={{ marginBottom: '1rem' }}>About</h4>
                  <p>{provider.description || 'No description provided.'}</p>
                </div>
                {/* Reviews */}
                <div className="card">
                  <h4 style={{ marginBottom: '1.25rem' }}>Customer Reviews</h4>
                  {reviews.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem 0' }}>
                      <div className="empty-icon">💬</div>
                      <p>No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {reviews.map(r => (
                        <div key={r._id} className="review-card">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-avatar">{r.customerId?.name?.[0] || 'U'}</div>
                              <div>
                                <div className="reviewer-name">{r.customerId?.name || 'Customer'}</div>
                                <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                              </div>
                            </div>
                            <StarRow rating={r.rating} size={14} />
                          </div>
                          <p className="review-comment">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div className="card mb-3">
                  <h5 style={{ marginBottom: '1rem' }}>Working Schedule</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Days</span>
                      <span>{provider.workingDays?.join(', ')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Hours</span>
                      <span>{provider.workingStartTime} – {provider.workingEndTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Slot Duration</span>
                      <span>{provider.slotDuration} minutes</span>
                    </div>
                  </div>
                </div>
                {isAuthenticated && user?.role === 'customer' && (
                  <button className="btn btn-primary btn-full" onClick={() => setStep('book')}>
                    <Calendar size={15} /> Book This Provider
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'book' && (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <button className="btn btn-secondary btn-sm mb-3" onClick={() => { setStep('profile'); setSelectedSlot(null); }}>
                <ChevronLeft size={15} /> Back to Profile
              </button>

              <h3 style={{ marginBottom: '0.25rem' }}>Book {provider.businessName}</h3>
              <p style={{ marginBottom: '2rem' }}>Select a date, time slot, and duration</p>

              {/* Date picker */}
              <div className="card mb-3">
                <h5 style={{ marginBottom: '1rem' }}>Select Date</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="btn btn-secondary btn-icon" onClick={() => changeDate(-1)}><ChevronLeft size={18} /></button>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatDisplay(selectedDate)}</div>
                  </div>
                  <button className="btn btn-secondary btn-icon" onClick={() => changeDate(1)}><ChevronRight size={18} /></button>
                </div>
              </div>

              {/* Time slots */}
              <div className="card mb-3">
                <h5 style={{ marginBottom: '1rem' }}>Available Start Times</h5>
                {availLoading ? (
                  <div className="loading-center" style={{ padding: '2rem' }}><span className="spinner" /></div>
                ) : !availability?.isWorkingDay ? (
                  <div className="alert alert-info">{availability?.message || 'Provider is not available on this day.'}</div>
                ) : (
                  <div className="slots-grid">
                    {availability.slots.map(slot => (
                      <button
                        key={slot.time}
                        className={`time-slot ${slot.available ? (selectedSlot?.time === slot.time ? 'selected' : 'available') : 'booked'}`}
                        disabled={!slot.available}
                        onClick={() => slot.available && setSelectedSlot(slot)}
                        title={!slot.available ? 'This slot is already booked' : ''}
                      >
                        <div>{slot.displayTime}</div>
                        {!slot.available && <div style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>Booked</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking form */}
              {selectedSlot && (
                <div className="card fade-in">
                  <h5 style={{ marginBottom: '1rem' }}>Service Details</h5>

                  {/* Duration + Price summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Duration (hours)</label>
                      <select className="form-control" value={bookingForm.durationHours}
                        onChange={e => setBookingForm(f => ({ ...f, durationHours: Number(e.target.value) }))}>
                        {[1,2,3,4,5,6,7,8].map(h => (
                          <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        {selectedSlot.displayTime} → {(() => {
                          const [h, m] = selectedSlot.time.split(':').map(Number);
                          const end = h * 60 + m + bookingForm.durationHours * 60;
                          const eh = Math.floor(end / 60);
                          const em = end % 60;
                          const t = `${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`;
                          const period = eh >= 12 ? 'PM' : 'AM';
                          const h12 = eh === 0 ? 12 : eh > 12 ? eh - 12 : eh;
                          return `${String(h12).padStart(2,'0')}:${String(em).padStart(2,'0')} ${period}`;
                        })()}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                        ₹{provider.price * bookingForm.durationHours}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ₹{provider.price}/hr × {bookingForm.durationHours}h
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleBook}>
                    <div className="form-group">
                      <label className="form-label">Problem Description *</label>
                      <textarea className="form-control" rows={3} placeholder="Describe the issue or service needed..." value={bookingForm.problemDescription} onChange={e => setBookingForm(f => ({...f, problemDescription: e.target.value}))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Service Address *</label>
                      <input className="form-control" placeholder="Full address where service is needed" value={bookingForm.address} onChange={e => setBookingForm(f => ({...f, address: e.target.value}))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Additional Notes (optional)</label>
                      <textarea className="form-control" rows={2} placeholder="Any special instructions..." value={bookingForm.additionalNotes} onChange={e => setBookingForm(f => ({...f, additionalNotes: e.target.value}))} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={booking}>
                      {booking ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Confirming Booking…</> : `Confirm Booking — ₹${provider.price * bookingForm.durationHours}`}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProviderProfilePage;
