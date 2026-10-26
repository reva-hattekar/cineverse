import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminDashboard({ adminUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data states
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);

  // Seat Availability View State
  const [selectedShowId, setSelectedShowId] = useState('');
  const [showSeatsData, setShowSeatsData] = useState(null);

  // Modals
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({ title: '', genre: 'Sci-Fi', duration: 120, language: 'English', rating: 8.5 });

  const [showtimeModalOpen, setShowtimeModalOpen] = useState(false);
  const [showtimeForm, setShowtimeForm] = useState({
    show_date: '2026-10-18',
    start_time: '18:00:00',
    end_time: '21:00:00',
    base_price: 300,
    movie_id: '',
    screen_id: ''
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Fetch
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'overview') {
        const res = await api.getAdminDashboard();
        if (res.success) setDashboardMetrics(res.data);
      } else if (tab === 'movies') {
        const res = await api.getAdminMovies();
        if (res.success) setMovies(res.data);
      } else if (tab === 'theaters') {
        const res = await api.getTheaters();
        if (res.success) setTheaters(res.data);
      } else if (tab === 'showtimes') {
        const [showRes, movRes, thRes] = await Promise.all([
          api.getAdminShowtimes(),
          api.getMovies(),
          api.getTheaters()
        ]);
        if (showRes.success) setShowtimes(showRes.data);
        if (movRes.success) setMovies(movRes.data);
        if (thRes.success) setTheaters(thRes.data);
      } else if (tab === 'seats') {
        const res = await api.getAdminShowtimes();
        if (res.success) {
          setShowtimes(res.data);
          if (res.data.length > 0 && !selectedShowId) {
            setSelectedShowId(res.data[0].show_id);
            fetchSeatsForShow(res.data[0].show_id);
          }
        }
      } else if (tab === 'bookings' || tab === 'payments') {
        const res = await api.getBookings();
        if (res.success) setBookings(res.data);
      } else if (tab === 'customers') {
        const res = await api.getCustomers();
        if (res.success) setCustomers(res.data);
      } else if (tab === 'staff') {
        const res = await api.getAdminStaff();
        if (res.success) setStaff(res.data);
      } else if (tab === 'snacks') {
        const res = await api.getSnacks();
        if (res.success) setSnacks(res.data);
      } else if (tab === 'reports') {
        const [revRes, popRes] = await Promise.all([
          api.getRevenueReport(),
          api.getPopularMoviesReport()
        ]);
        if (revRes.success) setRevenueReport(revRes.data);
        if (popRes.success) setPopularMovies(popRes.data);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatsForShow = async (showId) => {
    if (!showId) return;
    try {
      const res = await api.getShowtimeSeats(showId);
      if (res.success) {
        setShowSeatsData(res.data);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Movie Handlers
  const handleOpenMovieCreate = () => {
    setEditingMovie(null);
    setMovieForm({ title: '', genre: 'Sci-Fi', duration: 120, language: 'English', rating: 8.5 });
    setMovieModalOpen(true);
  };

  const handleOpenMovieEdit = (m) => {
    setEditingMovie(m);
    setMovieForm({
      title: m.title,
      genre: m.genre,
      duration: m.duration,
      language: m.language,
      rating: m.rating
    });
    setMovieModalOpen(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      if (editingMovie) {
        await api.updateMovie(editingMovie.movie_id, movieForm);
        showNotification(`Movie "${movieForm.title}" updated.`);
      } else {
        await api.createMovie(movieForm);
        showNotification(`Movie "${movieForm.title}" created.`);
      }
      setMovieModalOpen(false);
      loadTabData('movies');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteMovie = async (m) => {
    if (!window.confirm(`Are you sure you want to delete movie "${m.title}"?`)) return;
    try {
      await api.deleteMovie(m.movie_id);
      showNotification(`Movie "${m.title}" deleted.`);
      loadTabData('movies');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Showtime Handlers
  const handleSaveShowtime = async (e) => {
    e.preventDefault();
    try {
      await api.createShowtime(showtimeForm);
      showNotification('Showtime scheduled successfully.');
      setShowtimeModalOpen(false);
      loadTabData('showtimes');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Booking Cancel Handler (releases seats!)
  const handleCancelBooking = async (b) => {
    if (!window.confirm(`Cancel Booking #${b.booking_id} for ${b.customer_name}? Seats will be released immediately.`)) return;
    try {
      const res = await api.cancelBooking(b.booking_id);
      showNotification(res.message);
      loadTabData('bookings');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div>
          <div style={{ padding: '0 12px 16px', borderBottom: '1px solid #2e3a52', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700 }}>
              Navigation Menu
            </div>
          </div>
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Dashboard Overview
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'movies' ? 'active' : ''}`}
                onClick={() => setActiveTab('movies')}
              >
                🎬 Movie Management
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'theaters' ? 'active' : ''}`}
                onClick={() => setActiveTab('theaters')}
              >
                🏢 Theaters & Screens
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'showtimes' ? 'active' : ''}`}
                onClick={() => setActiveTab('showtimes')}
              >
                ⏰ Showtime Schedules
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'seats' ? 'active' : ''}`}
                onClick={() => setActiveTab('seats')}
              >
                💺 Seat Availability
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                🎟️ Bookings & Tickets
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                💳 Payment Records
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'snacks' ? 'active' : ''}`}
                onClick={() => setActiveTab('snacks')}
              >
                🍿 Concessions & Snacks
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                👥 Customers & Loyalty
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveTab('staff')}
              >
                👔 Admin Staff Roster
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                📈 Reports & Analytics
              </button>
            </li>
          </ul>
        </div>

        <div style={{ padding: '12px', fontSize: '0.75rem', color: '#6b7280', borderTop: '1px solid #2e3a52' }}>
          Database: <strong>MovieTheaterDB</strong><br />
          Engine: <strong>InnoDB 8.x</strong>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {notification && (
          <div className={`notification-banner ${notification.type}`}>
            <span>{notification.msg}</span>
            <button onClick={() => setNotification(null)} style={{ background: 'none', color: 'inherit' }}>✕</button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Cinema Operations Dashboard</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>
                Key performance indicators and system metrics for MovieTheaterDB
              </p>
            </div>

            {loading && !dashboardMetrics ? (
              <p>Loading dashboard metrics...</p>
            ) : (
              <>
                <div className="grid-cards">
                  <div className="stat-card">
                    <span className="stat-title">Gross Revenue</span>
                    <span className="stat-value" style={{ color: '#10b981' }}>
                      ₹{dashboardMetrics?.total_revenue || '0.00'}
                    </span>
                    <span className="stat-sub">From confirmed bookings</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-title">Total Bookings</span>
                    <span className="stat-value">{dashboardMetrics?.total_bookings || 0}</span>
                    <span className="stat-sub">Reserved transactions</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-title">Active Movies</span>
                    <span className="stat-value">{dashboardMetrics?.total_movies || 0}</span>
                    <span className="stat-sub">Across diverse genres</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-title">Scheduled Shows</span>
                    <span className="stat-value">{dashboardMetrics?.total_showtimes || 0}</span>
                    <span className="stat-sub">Across 4 screens</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-title">Customers</span>
                    <span className="stat-value">{dashboardMetrics?.total_customers || 0}</span>
                    <span className="stat-sub">Registered accounts</span>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                    Recent Booking Transactions
                  </h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Customer</th>
                          <th>Movie</th>
                          <th>Amount</th>
                          <th>Payment Method</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardMetrics?.recent_bookings?.map(b => (
                          <tr key={b.booking_id}>
                            <td><strong>#{b.booking_id}</strong></td>
                            <td>{b.customer_name}</td>
                            <td>{b.movie_title}</td>
                            <td>₹{parseFloat(b.total_amount).toFixed(2)}</td>
                            <td>{b.payment_method || 'UPI'}</td>
                            <td>
                              <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                                {b.booking_status}
                              </span>
                            </td>
                            <td>{new Date(b.booking_date).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: MOVIES */}
        {activeTab === 'movies' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Movie Catalog Management</h1>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>View, add, edit, and safely delete screening titles</p>
              </div>
              <button className="btn btn-primary" onClick={handleOpenMovieCreate}>
                + Add New Movie
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Language</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(m => (
                    <tr key={m.movie_id}>
                      <td>#{m.movie_id}</td>
                      <td><strong>{m.title}</strong></td>
                      <td><span className="badge badge-info">{m.genre}</span></td>
                      <td>{m.duration} mins</td>
                      <td>{m.language}</td>
                      <td>⭐ {m.rating}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenMovieEdit(m)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMovie(m)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: THEATERS & SCREENS */}
        {activeTab === 'theaters' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Theaters & Screening Auditoriums</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Relational hierarchy: THEATER (1:M) SCREEN (1:M) SEAT</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {theaters.map(t => (
                <div key={t.theater_id} className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t.theater_name}</h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>📍 {t.city} • {t.address}</p>
                    </div>
                    <span className="badge badge-info">ID #{t.theater_id}</span>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, marginBottom: '8px' }}>
                      Associated Screens:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {t.screens?.map(s => (
                        <div key={s.screen_id} style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <strong>Screen {s.screen_number}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ID #{s.screen_id}</div>
                          </div>
                          <span className="badge badge-warning">Capacity: {s.capacity} seats</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SHOWTIMES */}
        {activeTab === 'showtimes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Showtime Management</h1>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Schedule screenings across screens with pricing rules</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (movies.length > 0) setShowtimeForm(prev => ({ ...prev, movie_id: movies[0].movie_id }));
                  if (theaters.length > 0 && theaters[0].screens?.length > 0) {
                    setShowtimeForm(prev => ({ ...prev, screen_id: theaters[0].screens[0].screen_id }));
                  }
                  setShowtimeModalOpen(true);
                }}
              >
                + Schedule Showtime
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Show ID</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Movie Title</th>
                    <th>Theater & Screen</th>
                    <th>Base Ticket Price</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.map(s => (
                    <tr key={s.show_id}>
                      <td>#{s.show_id}</td>
                      <td><strong>{s.show_date}</strong></td>
                      <td>{s.start_time} - {s.end_time}</td>
                      <td>{s.movie_title}</td>
                      <td>{s.theater_name} (Screen {s.screen_number})</td>
                      <td><strong style={{ color: '#10b981' }}>₹{parseFloat(s.base_price).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SEAT AVAILABILITY */}
        {activeTab === 'seats' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Auditorium Seat Availability Grid</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                Live visual seat map calculated dynamically from active bookings (releases cancelled bookings automatically)
              </p>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700 }}>Select Showtime to Inspect:</label>
              <select
                value={selectedShowId}
                onChange={(e) => {
                  setSelectedShowId(e.target.value);
                  fetchSeatsForShow(e.target.value);
                }}
                style={{ minWidth: '320px' }}
              >
                {showtimes.map(s => (
                  <option key={s.show_id} value={s.show_id}>
                    #{s.show_id}: {s.movie_title} ({s.show_date} @ {s.start_time} - Screen {s.screen_number})
                  </option>
                ))}
              </select>
            </div>

            {showSeatsData && (
              <div className="stat-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2e3a52', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{showSeatsData.showtime.movie_title}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                      {showSeatsData.showtime.theater_name} • Screen {showSeatsData.showtime.screen_number} • Base Price: ₹{showSeatsData.showtime.base_price}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10b981', fontWeight: 700 }}>
                      Available: {showSeatsData.available_seats} / {showSeatsData.total_seats}
                    </div>
                    <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                      Booked: {showSeatsData.booked_seats}
                    </div>
                  </div>
                </div>

                <div className="screen-display">
                  <span className="screen-text">Cinema Screen</span>
                </div>

                <div className="seats-grid">
                  {showSeatsData.seats?.map(s => (
                    <div
                      key={s.seat_id}
                      className={`seat-box ${s.is_booked ? 'booked' : 'available'} ${s.seat_type === 'VIP' ? 'vip-type' : ''}`}
                      title={`${s.seat_number} (${s.seat_type}) - ₹${s.price} [${s.is_booked ? 'BOOKED' : 'AVAILABLE'}]`}
                    >
                      <span>{s.seat_number}</span>
                      <span style={{ fontSize: '0.6rem', color: s.is_booked ? '#6b7280' : '#f59e0b' }}>
                        ₹{s.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#1e293b', border: '1px solid #334155' }}></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#232a3b', opacity: 0.6 }}></div>
                    <span>Booked</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ border: '2px solid rgba(139, 92, 246, 0.8)', background: '#1e293b' }}></div>
                    <span>VIP Recliner</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Booking Management</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                Customer bookings with seat allocations and cancellation release capability
              </p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Showtime</th>
                    <th>Reserved Seats</th>
                    <th>Total Paid</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.booking_id}>
                      <td><strong>#{b.booking_id}</strong></td>
                      <td>
                        <div>{b.customer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{b.customer_email}</div>
                      </td>
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
                            onClick={() => handleCancelBooking(b)}
                          >
                            Cancel & Release
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Released</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: PAYMENTS */}
        {activeTab === 'payments' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Financial Payment Audit Trail</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                One-payment-per-booking relational model. Preserves records during cancellation for refund auditing.
              </p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Booking Ref</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Transaction Status</th>
                    <th>Booking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.booking_id}>
                      <td>#{b.payment_id || b.booking_id}</td>
                      <td><strong>Booking #{b.booking_id}</strong></td>
                      <td>{b.customer_name}</td>
                      <td><strong style={{ color: '#10b981' }}>₹{parseFloat(b.total_amount).toFixed(2)}</strong></td>
                      <td><span className="badge badge-warning">{b.payment_method || 'UPI'}</span></td>
                      <td>
                        <span className={`badge ${b.payment_status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>
                          {b.payment_status || (b.booking_status === 'CANCELLED' ? 'REFUNDED' : 'COMPLETED')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: CONCESSIONS & SNACKS */}
        {activeTab === 'snacks' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Concessions & Snack Inventory</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                SNACK (1:M) SNACK_ORDER_ITEM (M:1) SNACK_ORDER normalized structure
              </p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Snack ID</th>
                    <th>Item Name</th>
                    <th>Unit Price</th>
                    <th>Stock Inventory</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {snacks.map(s => (
                    <tr key={s.snack_id}>
                      <td>#{s.snack_id}</td>
                      <td><strong>{s.snack_name}</strong></td>
                      <td>₹{parseFloat(s.price).toFixed(2)}</td>
                      <td>{s.stock_quantity} units</td>
                      <td>
                        <span className={`badge ${s.stock_quantity > 50 ? 'badge-success' : 'badge-warning'}`}>
                          {s.stock_quantity > 50 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: CUSTOMERS & LOYALTY */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Customer Accounts & Loyalty Membership</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                Demonstrating CUSTOMER (1:0..1) ACCOUNT and CUSTOMER (1:0..1) LOYALTY_ACCOUNT
              </p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Portal Account</th>
                    <th>Loyalty Tier</th>
                    <th>Reward Points</th>
                    <th>Total Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.customer_id}>
                      <td>#{c.customer_id}</td>
                      <td><strong>{c.customer_name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>
                        <span className={`badge ${c.account_id ? 'badge-success' : 'badge-danger'}`}>
                          {c.account_id ? 'Active User' : 'Guest (No Auth)'}
                        </span>
                      </td>
                      <td>
                        {c.membership_level ? (
                          <span className={`badge ${c.membership_level === 'Platinum' || c.membership_level === 'Gold' ? 'badge-vip' : 'badge-info'}`}>
                            {c.membership_level}
                          </span>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>None</span>
                        )}
                      </td>
                      <td>{c.total_points !== null ? `${c.total_points} pts` : '-'}</td>
                      <td><strong>{c.total_bookings_count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 10: STAFF */}
        {activeTab === 'staff' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Staff & Access Control</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                Role-Based Access Control (Admin, Manager, Supervisor, Cashier)
              </p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Assigned Theater</th>
                    <th>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.staff_id}>
                      <td>#{s.staff_id}</td>
                      <td><strong>{s.staff_name}</strong></td>
                      <td>{s.email}</td>
                      <td>{s.phone}</td>
                      <td>
                        <span className={`badge ${s.role === 'Admin' ? 'badge-danger' : s.role === 'Manager' ? 'badge-warning' : 'badge-info'}`}>
                          {s.role}
                        </span>
                      </td>
                      <td>{s.theater_name} ({s.city})</td>
                      <td>
                        <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 11: REPORTS */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reports & Aggregation Analytics</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                Aggregate SQL queries demonstrating Experiment 6 & Experiment 8 analytics
              </p>
            </div>

            {revenueReport && (
              <div className="grid-cards">
                <div className="stat-card">
                  <span className="stat-title">Confirmed Ticket Revenue</span>
                  <span className="stat-value" style={{ color: '#10b981' }}>
                    ₹{parseFloat(revenueReport.summary.confirmed_ticket_revenue).toFixed(2)}
                  </span>
                  <span className="stat-sub">{revenueReport.summary.confirmed_bookings_count} bookings</span>
                </div>

                <div className="stat-card">
                  <span className="stat-title">Concessions Revenue</span>
                  <span className="stat-value" style={{ color: '#f59e0b' }}>
                    ₹{parseFloat(revenueReport.summary.total_concession_revenue).toFixed(2)}
                  </span>
                  <span className="stat-sub">Popcorn & Snacks</span>
                </div>

                <div className="stat-card">
                  <span className="stat-title">Total Gross Revenue</span>
                  <span className="stat-value">
                    ₹{revenueReport.summary.grand_total_revenue}
                  </span>
                  <span className="stat-sub">Tickets + Concessions</span>
                </div>

                <div className="stat-card">
                  <span className="stat-title">Refunded / Cancelled</span>
                  <span className="stat-value" style={{ color: '#ef4444' }}>
                    ₹{parseFloat(revenueReport.summary.cancelled_or_refunded_amount).toFixed(2)}
                  </span>
                  <span className="stat-sub">{revenueReport.summary.cancelled_bookings_count} cancelled bookings</span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                Movie Popularity & Ticket Sales Breakdown
              </h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Movie Title</th>
                      <th>Genre</th>
                      <th>Rating</th>
                      <th>Total Screenings</th>
                      <th>Tickets / Seats Sold</th>
                      <th>Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularMovies.map(m => (
                      <tr key={m.movie_id}>
                        <td><strong>{m.title}</strong></td>
                        <td><span className="badge badge-info">{m.genre}</span></td>
                        <td>⭐ {m.rating}</td>
                        <td>{m.total_screenings}</td>
                        <td><strong style={{ color: '#f59e0b' }}>{m.total_seats_sold} seats</strong></td>
                        <td><strong style={{ color: '#10b981' }}>₹{parseFloat(m.gross_revenue).toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT MOVIE */}
        {movieModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
                {editingMovie ? 'Edit Movie Details' : 'Add New Movie Title'}
              </h2>
              <form onSubmit={handleSaveMovie}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Genre</label>
                    <input
                      type="text"
                      required
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <input
                      type="text"
                      required
                      value={movieForm.language}
                      onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (mins)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Rating (0.0 to 10.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setMovieModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SCHEDULE SHOWTIME */}
        {showtimeModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
                Schedule New Showtime
              </h2>
              <form onSubmit={handleSaveShowtime}>
                <div className="form-group">
                  <label>Movie</label>
                  <select
                    value={showtimeForm.movie_id}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, movie_id: e.target.value })}
                    required
                  >
                    {movies.map(m => (
                      <option key={m.movie_id} value={m.movie_id}>
                        {m.title} ({m.language})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Auditorium Screen</label>
                  <select
                    value={showtimeForm.screen_id}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, screen_id: e.target.value })}
                    required
                  >
                    {theaters.flatMap(t => t.screens || []).map(sc => (
                      <option key={sc.screen_id} value={sc.screen_id}>
                        Screen {sc.screen_number} (Theater ID #{sc.theater_id} - Capacity: {sc.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Show Date</label>
                    <input
                      type="date"
                      required
                      value={showtimeForm.show_date}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, show_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Base Ticket Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      value={showtimeForm.base_price}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, base_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      required
                      value={showtimeForm.start_time}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, start_time: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      required
                      value={showtimeForm.end_time}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowtimeModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Schedule Show
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

