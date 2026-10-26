import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function CustomerPortal() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seatsData, setSeatsData] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [selectedSnacks, setSelectedSnacks] = useState({});
  const [customerBookings, setCustomerBookings] = useState([]);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample active customer (Aarav Sharma - Customer ID #1)
  const [currentCustomer] = useState({
    customer_id: 1,
    customer_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com'
  });

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    loadMovies();
    loadSnacks();
  }, []);

  const loadMovies = async () => {
    try {
      const res = await api.getMovies();
      if (res.success) setMovies(res.data);
    } catch (err) {
      setErrorMsg('Failed to load movie catalog.');
    }
  };

  const loadSnacks = async () => {
    try {
      const res = await api.getSnacks();
      if (res.success) setSnacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie);
    setSelectedShowtime(null);
    setSeatsData(null);
    setSelectedSeatIds([]);
    setBookingSuccess(null);
    setErrorMsg('');

    try {
      const res = await api.getMovieShowtimes(movie.movie_id);
      if (res.success) setShowtimes(res.data);
    } catch (err) {
      setErrorMsg('Failed to load showtimes for this movie.');
    }
  };

  const handleSelectShowtime = async (st) => {
    setSelectedShowtime(st);
    setSelectedSeatIds([]);
    setBookingSuccess(null);
    setErrorMsg('');

    try {
      const res = await api.getShowtimeSeats(st.show_id);
      if (res.success) setSeatsData(res.data);
    } catch (err) {
      setErrorMsg('Failed to load seat layout.');
    }
  };

  const toggleSeatSelection = (seat) => {
    if (seat.is_booked) return;

    if (selectedSeatIds.includes(seat.seat_id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.seat_id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat.seat_id]);
    }
  };

  const updateSnackQty = (snackId, delta) => {
    setSelectedSnacks(prev => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[snackId];
        return copy;
      }
      return { ...prev, [snackId]: next };
    });
  };

  // Price calculations
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

  // Booking Submission
  const handleConfirmBooking = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg('Please select at least one available seat.');
      return;
    }

    setLoading(true);
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
        payment_method: 'UPI',
        snacks: snacksPayload
      };

      const res = await api.createBooking(payload);
      if (res.success) {
        setBookingSuccess(res.data);
        // Refresh seats
        handleSelectShowtime(selectedShowtime);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  // Load customer bookings
  const handleOpenMyBookings = async () => {
    try {
      const res = await api.getCustomerBookings(currentCustomer.customer_id);
      if (res.success) setCustomerBookings(res.data);
      setShowBookingsModal(true);
    } catch (err) {
      setErrorMsg('Failed to load booking history.');
    }
  };

  const handleCancelPersonalBooking = async (bId) => {
    if (!window.confirm(`Cancel Booking #${bId}? Your seats will be released.`)) return;
    try {
      const res = await api.cancelBooking(bId);
      alert(res.message);
      handleOpenMyBookings();
      if (selectedShowtime) handleSelectShowtime(selectedShowtime);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredMovies = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = !selectedGenre || m.genre === selectedGenre;
    return matchSearch && matchGenre;
  });

  const genres = Array.from(new Set(movies.map(m => m.genre)));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner & Customer Context */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-card)',
        padding: '16px 22px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '28px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Welcome, {currentCustomer.customer_name}</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Book movie tickets and concession combos with instant seat allocation
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleOpenMyBookings}>
          🎟️ My Booking History
        </button>
      </div>

      {errorMsg && (
        <div className="notification-banner error">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {bookingSuccess && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>Booking Confirmed!</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', margin: '8px 0 20px' }}>
              Your reservation has been committed into <strong>MovieTheaterDB</strong>.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '20px',
              fontSize: '0.88rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div><strong>Booking Reference:</strong> #{bookingSuccess.booking_id}</div>
              <div><strong>Seats Reserved:</strong> {bookingSuccess.seats_booked} seats</div>
              <div><strong>Total Paid:</strong> ₹{parseFloat(bookingSuccess.total_amount).toFixed(2)}</div>
              <div><strong>Payment Simulation:</strong> {bookingSuccess.payment_status} ({bookingSuccess.payment_method})</div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                setBookingSuccess(null);
                setSelectedSeatIds([]);
                setSelectedSnacks({});
              }}
            >
              Done & Browse More
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: MOVIE BROWSING */}
      {!selectedMovie ? (
        <div>
          <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search movies by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: '280px', flex: 1 }}
            />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{ minWidth: '160px' }}
            >
              <option value="">All Genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="movie-grid">
            {filteredMovies.map(m => (
              <div key={m.movie_id} className="movie-card">
                <div className="movie-poster-placeholder">
                  <span style={{ fontSize: '2.5rem' }}>🎬</span>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: '6px' }}>{m.title}</div>
                  <span className="badge badge-warning" style={{ marginTop: '6px' }}>⭐ {m.rating}</span>
                </div>
                <div className="movie-card-body">
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <span className="badge badge-info">{m.genre}</span>
                      <span className="badge badge-secondary">{m.language}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Duration: {m.duration} mins</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '14px' }}
                    onClick={() => handleSelectMovie(m)}
                  >
                    Select & Book Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* STEP 2 & 3: SHOWTIME & SEAT SELECTION */
        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedMovie(null)}
            style={{ marginBottom: '16px' }}
          >
            ← Back to Movie Catalog
          </button>

          <div style={{
            background: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{selectedMovie.title}</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
              {selectedMovie.genre} • {selectedMovie.language} • {selectedMovie.duration} mins • Rating: ⭐ {selectedMovie.rating}
            </p>

            {/* Showtime Selection */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
                Select Screening Showtime:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {showtimes.map(st => (
                  <button
                    key={st.show_id}
                    className={`btn ${selectedShowtime?.show_id === st.show_id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleSelectShowtime(st)}
                  >
                    📅 {st.show_date} @ {st.start_time}<br />
                    <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                      Screen {st.screen_number} • ₹{st.base_price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seat Picker & Concessions */}
          {selectedShowtime && seatsData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
              {/* Seat Layout */}
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Auditorium Seat Picker</h3>
                  <span style={{ fontSize: '0.8rem', color: '#10b981' }}>
                    Available: {seatsData.available_seats} / {seatsData.total_seats}
                  </span>
                </div>

                <div className="screen-display">
                  <span className="screen-text">Cinema Screen</span>
                </div>

                <div className="seats-grid">
                  {seatsData.seats.map(s => {
                    const isSelected = selectedSeatIds.includes(s.seat_id);
                    return (
                      <div
                        key={s.seat_id}
                        className={`seat-box ${s.is_booked ? 'booked' : isSelected ? 'selected' : 'available'} ${s.seat_type === 'VIP' ? 'vip-type' : ''}`}
                        onClick={() => toggleSeatSelection(s)}
                        title={`${s.seat_number} (${s.seat_type}) - ₹${s.price}`}
                      >
                        <span>{s.seat_number}</span>
                        <span style={{ fontSize: '0.6rem' }}>₹{s.price}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#1e293b', border: '1px solid #334155' }}></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#e50914' }}></div>
                    <span>Selected</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#232a3b', opacity: 0.6 }}></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>

              {/* Concessions & Order Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Snacks */}
                <div className="stat-card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px' }}>
                    🍿 Add Concessions & Snacks
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {snacks.map(sn => {
                      const qty = selectedSnacks[sn.snack_id] || 0;
                      return (
                        <div key={sn.snack_id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '0.85rem'
                        }}>
                          <div>
                            <div>{sn.snack_name}</div>
                            <div style={{ color: '#10b981', fontSize: '0.75rem' }}>₹{sn.price}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ width: '26px', height: '26px', padding: 0 }}
                              onClick={() => updateSnackQty(sn.snack_id, -1)}
                            >-</button>
                            <span style={{ minWidth: '16px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ width: '26px', height: '26px', padding: 0 }}
                              onClick={() => updateSnackQty(sn.snack_id, 1)}
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="stat-card" style={{ borderColor: 'rgba(229, 9, 20, 0.4)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px' }}>
                    🧾 Booking Summary
                  </h3>
                  <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Selected Seats ({selectedSeatIds.length}):</span>
                      <strong>₹{calculateTicketTotal()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Concessions Combo:</span>
                      <strong>₹{calculateSnackTotal()}</strong>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #2e3a52',
                      paddingTop: '8px',
                      fontSize: '1.1rem',
                      color: '#10b981'
                    }}>
                      <span>Grand Total:</span>
                      <strong>₹{grandTotal}</strong>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '14px',
                    padding: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#fbbf24'
                  }}>
                    💳 Mock Payment Simulation (UPI / Instant Confirmation)
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '14px' }}
                    disabled={loading || selectedSeatIds.length === 0}
                    onClick={handleConfirmBooking}
                  >
                    {loading ? 'Committing Transaction...' : `Confirm & Pay ₹${grandTotal}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY BOOKINGS HISTORY MODAL */}
      {showBookingsModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>My Booking History</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBookingsModal(false)}>✕</button>
            </div>

            {customerBookings.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No bookings found for this customer.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Movie</th>
                      <th>Showtime</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerBookings.map(b => (
                      <tr key={b.booking_id}>
                        <td><strong>#{b.booking_id}</strong></td>
                        <td>{b.movie_title}</td>
                        <td>{b.show_date} @ {b.start_time}</td>
                        <td><span className="badge badge-info">{b.seats || 'Assigned'}</span></td>
                        <td>₹{parseFloat(b.total_amount).toFixed(2)}</td>
                        <td>
                          <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                            {b.booking_status}
                          </span>
                        </td>
                        <td>
                          {b.booking_status === 'CONFIRMED' ? (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelPersonalBooking(b.booking_id)}
                            >
                              Cancel
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

