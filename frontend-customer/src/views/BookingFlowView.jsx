import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Popcorn,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Building,
  Sparkles,
  Film,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import AuditoriumSeatMap from '../components/AuditoriumSeatMap';

/**
 * Generate a useful range of upcoming dates (next 8 days from current context date: 2026-10-27)
 */
function getUpcomingDates(daysCount = 8) {
  const dates = [];
  // Today in local context is 2026-10-27
  const start = new Date(2026, 9, 27); // Month 9 is October (0-indexed)

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const isoString = `${yyyy}-${mm}-${dd}`;

    const weekdayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNum = String(d.getDate()).padStart(2, '0');

    let label = '';
    if (i === 0) label = 'TODAY';
    else if (i === 1) label = 'TOMORROW';

    dates.push({
      dateStr: isoString,
      dayNum,
      weekdayShort,
      monthShort,
      label
    });
  }
  return dates;
}

/**
 * Format 24-hr time string ('HH:MM:SS') into friendly 12-hr display ('10:00 AM')
 */
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Format date string ('YYYY-MM-DD') into friendly display ('Tue, 27 Oct 2026')
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dateObj = new Date(y, m, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Return appropriate badge class for a screen type
 */
function getScreenBadgeClass(screenType = '') {
  const lower = screenType.toLowerCase();
  if (lower.includes('imax')) return 'badge-imax';
  if (lower.includes('dolby')) return 'badge-dolby';
  if (lower.includes('4dx')) return 'badge-4dx';
  if (lower.includes('vip') || lower.includes('recliner')) return 'badge-vip';
  return 'badge-std';
}

export default function BookingFlowView({
  movie,
  currentCustomer,
  initialShowtime = null,
  onBack,
  onBookingFinished,
  selectedCity = 'Bengaluru',
  setSelectedCity,
  theaters = []
}) {
  const upcomingDates = useMemo(() => getUpcomingDates(8), []);

  // Step state: 1: Date & Screening, 2: Seats, 3: Snacks, 4: Payment, 5: Confirmation
  const [step, setStep] = useState(initialShowtime ? 2 : 1);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    initialShowtime?.show_date || upcomingDates[0]?.dateStr || '2026-10-27'
  );
  const [selectedShowtime, setSelectedShowtime] = useState(initialShowtime || null);
  const [seatsData, setSeatsData] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [selectedSnacks, setSelectedSnacks] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('aarav.sharma@oksbi');
  const [cardData, setCardData] = useState({
    name: 'Aarav Sharma',
    number: '4532 •••• •••• 8892',
    expiry: '08/28',
    cvv: '342'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    loadMovieShowtimes();
    loadSnacks();
  }, [movie]);

  useEffect(() => {
    if (initialShowtime) {
      handleSelectShowtime(initialShowtime);
    }
  }, [initialShowtime]);

  const loadMovieShowtimes = async () => {
    setLoading(true);
    try {
      const res = await api.getMovieShowtimes(movie.movie_id);
      if (res.success) {
        setShowtimes(res.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load screening schedules.');
    } finally {
      setLoading(false);
    }
  };

  const loadSnacks = async () => {
    try {
      const res = await api.getSnacks();
      if (res.success) setSnacks(res.data);
    } catch {
      // Graceful fallback
    }
  };

  const handleSelectShowtime = async (st) => {
    setSelectedShowtime(st);
    if (st.show_date) setSelectedDate(st.show_date);
    setSelectedSeatIds([]);
    setErrorMsg('');
    try {
      const res = await api.getShowtimeSeats(st.show_id);
      if (res.success) {
        setSeatsData(res.data);
        setStep(2);
      }
    } catch (err) {
      setErrorMsg('Failed to fetch seat layout.');
    }
  };

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    if (selectedSeatIds.includes(seat.seat_id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.seat_id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat.seat_id]);
    }
  };

  const updateSnackQty = (snackId, delta) => {
    setSelectedSnacks(prev => {
      const cur = prev[snackId] || 0;
      const next = Math.max(0, cur + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[snackId];
      else copy[snackId] = next;
      return copy;
    });
  };

  // Calculations
  const calculateTicketTotal = () => {
    if (!seatsData || selectedSeatIds.length === 0) return 0;
    return selectedSeatIds.reduce((sum, sId) => {
      const s = seatsData.seats.find(seat => seat.seat_id === sId);
      return sum + (s ? s.price : 0);
    }, 0);
  };

  const calculateSnackTotal = () => {
    return Object.entries(selectedSnacks).reduce((sum, [sId, qty]) => {
      const sn = snacks.find(s => s.snack_id === parseInt(sId, 10));
      return sum + (sn ? parseFloat(sn.price) * qty : 0);
    }, 0);
  };

  const grandTotal = calculateTicketTotal() + calculateSnackTotal();

  // Filter showtimes for the selected City AND selected Date
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(st => {
      const matchCity = !st.city || st.city.toLowerCase() === selectedCity.toLowerCase();
      const matchDate = st.show_date === selectedDate;
      return matchCity && matchDate;
    });
  }, [showtimes, selectedCity, selectedDate]);

  // Group filtered showtimes by Theatre complex, and within theatre by Screen
  const showtimesByTheater = useMemo(() => {
    const map = {};
    filteredShowtimes.forEach(st => {
      const tName = st.theater_name || 'Flagship Auditorium';
      if (!map[tName]) {
        map[tName] = {
          theater_id: st.theater_id,
          theater_name: tName,
          city: st.city,
          address: st.address,
          screens: {}
        };
      }
      const screenKey = st.screen_name || `Screen ${st.screen_number}`;
      if (!map[tName].screens[screenKey]) {
        map[tName].screens[screenKey] = {
          screen_id: st.screen_id,
          screen_number: st.screen_number,
          screen_name: st.screen_name || `Audi ${st.screen_number}`,
          screen_type: st.screen_type || 'Standard',
          capacity: st.capacity || 142,
          slots: []
        };
      }
      map[tName].screens[screenKey].slots.push(st);
    });
    return map;
  }, [filteredShowtimes]);

  const getSelectedSeatObjects = () => {
    if (!seatsData) return [];
    return seatsData.seats.filter(s => selectedSeatIds.includes(s.seat_id));
  };

  // Payment Confirmation Submission
  const handleProcessPayment = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg('Please select at least one seat before paying.');
      setStep(2);
      return;
    }

    setSubmittingPayment(true);
    setErrorMsg('');

    const snacksPayload = Object.entries(selectedSnacks).map(([sId, qty]) => ({
      snack_id: parseInt(sId, 10),
      quantity: qty
    }));

    try {
      const payload = {
        customer_id: currentCustomer.customer_id,
        show_id: selectedShowtime.show_id,
        seat_ids: selectedSeatIds,
        payment_method: paymentMethod,
        snacks: snacksPayload
      };

      const res = await api.createBooking(payload);
      if (res.success) {
        setBookingResult({
          booking_id: res.data.booking_id,
          total_amount: res.data.total_amount,
          seats: getSelectedSeatObjects(),
          show_date: selectedShowtime.show_date,
          start_time: formatTime12(selectedShowtime.start_time),
          theater_name: selectedShowtime.theater_name,
          screen_number: selectedShowtime.screen_number,
          screen_name: selectedShowtime.screen_name,
          screen_type: selectedShowtime.screen_type,
          movie_title: movie.title,
          payment_method: paymentMethod
        });
        setStep(5); // Confirmation
      }
    } catch (err) {
      const isConflict = err.status === 409 || err.message?.includes('already booked') || err.message?.includes('conflict');
      if (isConflict) {
        setErrorMsg('⚠️ Seat Conflict: One or more selected seats were just reserved by another customer. Please select alternative seats.');
        if (selectedShowtime) {
          await handleSelectShowtime(selectedShowtime);
        }
        setSelectedSeatIds([]);
        setStep(2);
      } else {
        setErrorMsg(err.message || 'Payment processing failed. Please retry.');
      }
    } finally {
      setSubmittingPayment(false);
    }
  };

  const availableCities = ['Bengaluru', 'Jaipur', 'Mumbai', 'Delhi NCR'];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 140px' }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              onBack();
            }
          }}
        >
          <ArrowLeft size={16} /> {step === 1 ? 'Back to Movies' : 'Back'}
        </button>

        {/* Step Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
          <span
            style={{
              color: step === 1 ? '#fb7185' : '#94a3b8',
              fontWeight: step === 1 ? 800 : 600,
              cursor: step > 1 ? 'pointer' : 'default'
            }}
            onClick={() => step > 1 && setStep(1)}
          >
            1. Date & Showtime
          </span>
          <span style={{ color: '#64748b' }}>›</span>
          <span
            style={{
              color: step === 2 ? '#f59e0b' : '#94a3b8',
              fontWeight: step === 2 ? 800 : 600,
              cursor: selectedShowtime && step > 2 ? 'pointer' : 'default'
            }}
            onClick={() => selectedShowtime && step > 2 && setStep(2)}
          >
            2. Seats
          </span>
          <span style={{ color: '#64748b' }}>›</span>
          <span
            style={{
              color: step === 3 ? '#f59e0b' : '#94a3b8',
              fontWeight: step === 3 ? 800 : 600
            }}
          >
            3. Concessions
          </span>
          <span style={{ color: '#64748b' }}>›</span>
          <span
            style={{
              color: step === 4 ? '#f59e0b' : '#94a3b8',
              fontWeight: step === 4 ? 800 : 600
            }}
          >
            4. Payment
          </span>
          <span style={{ color: '#64748b' }}>›</span>
          <span
            style={{
              color: step === 5 ? '#10b981' : '#94a3b8',
              fontWeight: step === 5 ? 800 : 600
            }}
          >
            5. Confirmation
          </span>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#f87171',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', color: 'inherit', border: 'none', cursor: 'pointer', fontWeight: 800 }}>
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          STEP 1: MOVIE HEADER, DATE SELECTION & MULTIPLEX SCREENINGS
          ========================================================================= */}
      {step === 1 && (
        <div>
          {/* Movie Banner */}
          <div className="booking-screening-card">
            <div className="booking-poster-box">
              <img
                src={movie.poster_url || 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 9px', borderRadius: '6px', background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.35)', color: '#fb7185', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                <Film size={12} /> Now Screening
              </div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{movie.title}</h1>
              <div style={{ color: '#94a3b8', fontSize: '0.86rem', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span>{movie.genre}</span>
                <span>•</span>
                <span>{movie.language}</span>
                <span>•</span>
                <span>{movie.duration} mins</span>
                <span>•</span>
                <span style={{ color: '#f59e0b', fontWeight: 800 }}>⭐ {movie.rating}</span>
              </div>

              {/* City Switcher in Booking flow */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>CITY:</span>
                {availableCities.map(city => (
                  <button
                    key={city}
                    type="button"
                    className={`btn btn-sm ${selectedCity.toLowerCase() === city.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 12px', fontSize: '0.76rem', borderRadius: '16px' }}
                    onClick={() => {
                      if (setSelectedCity) setSelectedCity(city);
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DATE SELECTION RIBBON (Next 8 upcoming days) */}
          <div className="booking-date-selector-wrapper">
            <div className="date-selector-header">
              <div className="date-selector-title">
                <Calendar size={15} /> Choose Screening Date
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Showing screenings for: <strong style={{ color: '#ffffff' }}>{formatDisplayDate(selectedDate)}</strong>
              </div>
            </div>

            <div className="date-selector-ribbon" role="tablist" aria-label="Screening Dates">
              {upcomingDates.map(item => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`date-pill-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDate(item.dateStr);
                      setErrorMsg('');
                    }}
                  >
                    {item.label && <span className="date-pill-badge">{item.label}</span>}
                    <span className="date-pill-day">{item.dayNum}</span>
                    <span className="date-pill-sub">{item.weekdayShort}, {item.monthShort}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MULTIPLEX THEATRES & SCREENS SCHEDULE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Multiplex Auditoriums in {selectedCity}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Select an auditorium showtime to book seats
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                Loading available screenings...
              </div>
            ) : Object.keys(showtimesByTheater).length > 0 ? (
              <div className="multiplex-theatres-list">
                {Object.entries(showtimesByTheater).map(([theaterName, theaterData]) => (
                  <div key={theaterName} className="multiplex-theatre-card">
                    {/* Theatre Header */}
                    <div className="multiplex-theatre-header">
                      <div>
                        <div className="multiplex-theatre-name">
                          <Building size={18} color="#fb7185" />
                          <span>{theaterName}</span>
                        </div>
                        <div className="multiplex-theatre-addr">
                          <MapPin size={13} />
                          <span>{theaterData.address} ({theaterData.city})</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        ✓ Multiplex Active
                      </div>
                    </div>

                    {/* Multiplex Auditoriums / Screens */}
                    <div className="multiplex-screens-container">
                      {Object.entries(theaterData.screens).map(([screenKey, screenData]) => (
                        <div key={screenKey} className="multiplex-screen-row">
                          <div className="multiplex-screen-header">
                            <div className="screen-name-tag">{screenData.screen_name}</div>
                            <span className={`screen-badge ${getScreenBadgeClass(screenData.screen_type)}`}>
                              {screenData.screen_type}
                            </span>
                          </div>

                          <div className="showtimes-slots-grid">
                            {screenData.slots.map(slot => (
                              <button
                                key={slot.show_id}
                                type="button"
                                className="multiplex-showtime-btn"
                                onClick={() => handleSelectShowtime(slot)}
                                title={`Book ${slot.screen_name} at ${formatTime12(slot.start_time)}`}
                              >
                                <div className="showtime-btn-start">{formatTime12(slot.start_time)}</div>
                                <div className="showtime-btn-meta">
                                  <span className="showtime-btn-end">Ends {formatTime12(slot.end_time)}</span>
                                  <span className="showtime-btn-price">₹{slot.base_price}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div style={{
                padding: '42px 24px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(225, 29, 72, 0.12)', border: '1px solid rgba(225, 29, 72, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Calendar size={26} color="#fb7185" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                  No screenings scheduled on {formatDisplayDate(selectedDate)} in {selectedCity}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto 18px', lineHeight: 1.5 }}>
                  Screenings for <strong>{movie.title}</strong> are scheduled across multiple upcoming dates in our flagship auditoriums. Select another date above or explore other cities.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {upcomingDates.slice(0, 4).map(d => (
                    <button
                      key={d.dateStr}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedDate(d.dateStr)}
                    >
                      {d.label ? `${d.label} (${d.dayNum} ${d.monthShort})` : `${d.dayNum} ${d.monthShort}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: AUDITORIUM SEAT MAP
          ========================================================================= */}
      {step === 2 && selectedShowtime && seatsData && (
        <div>
          {/* Active Screening Context Banner */}
          <div className="screening-selected-bar">
            <div>
              <div className="screening-bar-title">
                <span>{movie.title}</span>
                <span className={`screen-badge ${getScreenBadgeClass(selectedShowtime.screen_type)}`}>
                  {selectedShowtime.screen_type || 'Standard'}
                </span>
              </div>
              <div className="screening-bar-meta">
                <span>
                  <Calendar size={14} color="#fb7185" />
                  <strong>{formatDisplayDate(selectedShowtime.show_date)}</strong>
                </span>
                <span>•</span>
                <span>
                  <Clock size={14} color="#f59e0b" />
                  {formatTime12(selectedShowtime.start_time)} – {formatTime12(selectedShowtime.end_time)}
                </span>
                <span>•</span>
                <span>
                  <Building size={14} color="#38bdf8" />
                  {selectedShowtime.theater_name} ({selectedShowtime.city})
                </span>
                <span>•</span>
                <span>
                  <Film size={14} color="#c084fc" />
                  {selectedShowtime.screen_name || `Screen ${selectedShowtime.screen_number}`}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setStep(1)}
            >
              <Calendar size={14} /> Change Date / Showtime
            </button>
          </div>

          {/* Genuine 142-seat Auditorium Seating Layout */}
          <div className="auditorium-container">
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                Select Your Auditorium Seats
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                Choose your preferred armchairs below. Warm gold marks selected seats.
              </p>
            </div>

            <AuditoriumSeatMap
              showtime={selectedShowtime}
              seats={seatsData.seats}
              selectedSeatIds={selectedSeatIds}
              onToggleSeat={toggleSeat}
              interactive={true}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: CONCESSIONS & SNACKS
          ========================================================================= */}
      {step === 3 && (
        <div className="booking-concessions-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Popcorn size={24} color="#f59e0b" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Add Concession Combos</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
            Elevate your cinematic experience with gourmet popcorn, nachos, and craft sodas delivered to your seat.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {snacks.map(sn => {
              const qty = selectedSnacks[sn.snack_id] || 0;
              return (
                <div key={sn.snack_id} className="concession-item-row">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>{sn.snack_name}</div>
                    <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>₹{sn.price}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                      onClick={() => updateSnackQty(sn.snack_id, -1)}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 800 }}>{qty}</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                      onClick={() => updateSnackQty(sn.snack_id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>
              ← Back to Seats
            </button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>
              Proceed to Payment (₹{grandTotal}) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: PAYMENT CHECKOUT
          ========================================================================= */}
      {step === 4 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Complete Your Booking</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Select your payment method below to finalize ticket reservation
            </p>
          </div>

          <div className="payment-grid">
            {/* Payment Method Selector */}
            <div className="payment-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#f59e0b" /> Choose Payment Method
              </h3>

              {/* UPI Option */}
              <div
                className={`method-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <div className="radio-indicator">
                  {paymentMethod === 'UPI' && <div className="radio-inner-dot" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Instant UPI (GPay, PhonePe, Paytm)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Zero gateway charges • Instant confirmation</div>
                </div>
                <QrCode size={20} color="#f59e0b" />
              </div>

              {/* Card Option */}
              <div
                className={`method-option ${paymentMethod === 'Credit Card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Credit Card')}
              >
                <div className="radio-indicator">
                  {paymentMethod === 'Credit Card' && <div className="radio-inner-dot" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Credit or Debit Card</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Visa, MasterCard, RuPay</div>
                </div>
                <CreditCard size={20} color="#38bdf8" />
              </div>

              {/* Net Banking Option */}
              <div
                className={`method-option ${paymentMethod === 'Net Banking' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Net Banking')}
              >
                <div className="radio-indicator">
                  {paymentMethod === 'Net Banking' && <div className="radio-inner-dot" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Net Banking</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>HDFC, SBI, ICICI, Axis & all Indian banks</div>
                </div>
                <Building size={20} color="#10b981" />
              </div>

              {/* Payment Details Form based on selected method */}
              <div className="payment-form-box">
                {paymentMethod === 'UPI' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
                      Enter VPA / UPI ID:
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                      Demo Mode: Instant auto-verification enabled.
                    </div>
                  </div>
                )}

                {paymentMethod === 'Credit Card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                        Cardholder Name:
                      </label>
                      <input
                        type="text"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                        Card Number:
                      </label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                          Expiry (MM/YY):
                        </label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                          CVV:
                        </label>
                        <input
                          type="password"
                          maxLength="4"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Net Banking' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
                      Select Your Bank:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary & Final Confirmation Button */}
            <div className="payment-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
                  Booking Ledger Summary
                </h3>

                <div className="summary-item">
                  <span>Movie Title:</span>
                  <strong>{movie.title}</strong>
                </div>

                <div className="summary-item">
                  <span>Screening Slot:</span>
                  <span>{formatDisplayDate(selectedShowtime.show_date)} @ {formatTime12(selectedShowtime.start_time)}</span>
                </div>

                <div className="summary-item">
                  <span>Venue Multiplex:</span>
                  <span>{selectedShowtime.theater_name} ({selectedShowtime.city})</span>
                </div>

                <div className="summary-item">
                  <span>Auditorium:</span>
                  <span>{selectedShowtime.screen_name || `Screen ${selectedShowtime.screen_number}`} ({selectedShowtime.screen_type})</span>
                </div>

                <div className="summary-item">
                  <span>Selected Seats:</span>
                  <strong style={{ color: '#f59e0b' }}>
                    {getSelectedSeatObjects().map(s => s.seat_number).join(', ')} ({selectedSeatIds.length})
                  </strong>
                </div>

                <div className="summary-item">
                  <span>Ticket Subtotal:</span>
                  <span>₹{calculateTicketTotal()}</span>
                </div>

                {calculateSnackTotal() > 0 && (
                  <div className="summary-item">
                    <span>F&B Concessions:</span>
                    <span>₹{calculateSnackTotal()}</span>
                  </div>
                )}

                <div className="summary-total">
                  <span>Grand Total:</span>
                  <span style={{ color: '#f59e0b' }}>₹{grandTotal}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800 }}
                  onClick={handleProcessPayment}
                  disabled={submittingPayment}
                >
                  {submittingPayment ? 'Processing Transaction...' : `Confirm & Pay ₹${grandTotal} →`}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => setStep(3)}
                >
                  ← Back to Concessions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: BOOKING CONFIRMATION & TICKET SLIP
          ========================================================================= */}
      {step === 5 && bookingResult && (
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10b981',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={36} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Booking Confirmed!</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '28px' }}>
            Your tickets have been registered in the database under Booking #{bookingResult.booking_id}.
          </p>

          <div className="ticket-slip" style={{ textAlign: 'left', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Booking Reference
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-serif)' }}>
                  #{bookingResult.booking_id}
                </div>
              </div>
              <QrCode size={36} color="#fb7185" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Customer:</span>
                <strong>{currentCustomer.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Movie:</span>
                <strong style={{ color: '#fff' }}>{bookingResult.movie_title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Screening Slot:</span>
                <span>{formatDisplayDate(bookingResult.show_date)} @ {bookingResult.start_time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Multiplex Venue:</span>
                <span>{bookingResult.theater_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Auditorium:</span>
                <span>{bookingResult.screen_name || `Screen ${bookingResult.screen_number}`} ({bookingResult.screen_type})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Reserved Seats:</span>
                <strong style={{ color: '#f59e0b' }}>
                  {bookingResult.seats.map(s => s.seat_number).join(', ')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Total Paid:</span>
                <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{bookingResult.total_amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Payment Mode:</span>
                <span>{bookingResult.payment_method}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => onBookingFinished('bookings')}
              >
                View My Bookings
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => onBookingFinished('home')}
              >
                Book More Tickets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STICKY BOTTOM BAR (For Step 2: Seat Selection)
          ========================================================================= */}
      {step === 2 && selectedShowtime && seatsData && (
        <div className="sticky-bar">
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {selectedSeatIds.length > 0 ? (
                <>
                  Selected ({selectedSeatIds.length} seat{selectedSeatIds.length > 1 ? 's' : ''}):{' '}
                  <strong style={{ color: '#f59e0b', fontWeight: 800 }}>
                    {getSelectedSeatObjects().map(s => s.seat_number).join(', ')}
                  </strong>{' '}
                  • {selectedShowtime.screen_name || `Screen ${selectedShowtime.screen_number}`}
                </>
              ) : (
                <span style={{ color: '#94a3b8' }}>
                  No seats selected • Click available seats on the map
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: selectedSeatIds.length > 0 ? '#f59e0b' : '#64748b' }}>
              ₹{calculateTicketTotal()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {selectedSeatIds.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Select at least 1 seat
              </span>
            )}
            <button
              className="btn btn-primary"
              disabled={selectedSeatIds.length === 0}
              onClick={() => setStep(3)}
              style={{
                padding: '12px 24px',
                fontSize: '0.92rem',
                fontWeight: 800,
                opacity: selectedSeatIds.length === 0 ? 0.45 : 1,
                cursor: selectedSeatIds.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Continue to Concessions & Payment →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
