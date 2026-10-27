import React, { useState, useEffect } from 'react';
import CinemaNavbar from './components/CinemaNavbar';
import HomeView from './views/HomeView';
import TheatresView from './views/TheatresView';
import BookingFlowView from './views/BookingFlowView';
import MyBookingsView from './views/MyBookingsView';
import { api } from './services/api';

function formatPremiereDate(dateStr) {
  if (!dateStr || dateStr === 'Expected Soon') return 'Premiere Date TBA';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['bookings', 'theatres', 'upcoming'].includes(hash)) return hash;
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (['bookings', 'theatres', 'upcoming'].includes(v)) return v;
    }
    return 'home';
  });
  const [movies, setMovies] = useState([]);
  const [heroSlots, setHeroSlots] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [preselectedShowtime, setPreselectedShowtime] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [moviesRes, upcomingRes, customersRes, theatersRes, heroSlotsRes] = await Promise.all([
        api.getMovies(),
        api.getUpcomingReleases(),
        api.getCustomers(),
        api.getTheaters(),
        api.getHeroSlots().catch(() => ({ success: false, data: [] }))
      ]);

      if (moviesRes.success) {
        setMovies(moviesRes.data);
      }

      if (heroSlotsRes && heroSlotsRes.success && Array.isArray(heroSlotsRes.data)) {
        setHeroSlots(heroSlotsRes.data);
      }

      // Single source of truth: database upcoming movies
      let combinedUpcoming = [];
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (upcomingRes && upcomingRes.success && Array.isArray(upcomingRes.data)) {
        // Enforce date validation: release date must not be in the past
        combinedUpcoming = upcomingRes.data.filter(
          u => !u.release_date || u.release_date >= todayStr
        );
      }

      if (moviesRes && moviesRes.success && Array.isArray(moviesRes.data)) {
        const dbComingSoon = moviesRes.data.filter(
          m =>
            (!m.scheduled_showtimes_count || m.scheduled_showtimes_count === 0) &&
            ((m.release_status === 'Coming Soon' && (!m.release_date || m.release_date >= todayStr)) ||
             (m.release_date && m.release_date >= todayStr))
        );
        const existingIds = new Set(combinedUpcoming.map(u => u.id));
        const existingTitles = new Set(combinedUpcoming.map(u => (u.title || '').trim().toLowerCase()));

        dbComingSoon.forEach(dbM => {
          if (!existingIds.has(dbM.movie_id) && !existingTitles.has(dbM.title.trim().toLowerCase())) {
            combinedUpcoming.unshift({
              id: dbM.movie_id,
              title: dbM.title,
              genre: dbM.genre,
              language: dbM.language,
              duration: dbM.duration,
              release_date: dbM.release_date || null,
              poster_url: dbM.poster_url,
              backdrop_url: dbM.backdrop_url,
              status: 'Coming Soon'
            });
            existingIds.add(dbM.movie_id);
            existingTitles.add(dbM.title.trim().toLowerCase());
          }
        });
      }

      setUpcomingMovies(combinedUpcoming);
      if (theatersRes.success) setTheaters(theatersRes.data);
      if (customersRes.success) {
        setCustomers(customersRes.data);
        if (customersRes.data.length > 0) {
          setCurrentCustomer(customersRes.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load catalog data:', err);
      setError('Unable to load theatrical catalogue. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = (movie, initialShowtime = null) => {
    setSelectedMovie(movie);
    setPreselectedShowtime(initialShowtime);
    setCurrentView('booking-flow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchCustomer = (customerId) => {
    const found = customers.find(c => c.customer_id === customerId);
    if (found) setCurrentCustomer(found);
  };

  const handleBookingFinished = (targetView) => {
    setSelectedMovie(null);
    setPreselectedShowtime(null);
    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cineverse-app-root">
      <CinemaNavbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view !== 'booking-flow') setSelectedMovie(null);
          setCurrentView(view);
        }}
        currentCustomer={currentCustomer}
        customers={customers}
        onSwitchCustomer={handleSwitchCustomer}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        movies={movies}
        theaters={theaters}
        onSelectMovie={handleSelectMovie}
      />

      <main>
        {currentView === 'home' && (
          <HomeView
            movies={movies}
            upcomingMovies={upcomingMovies}
            heroSlots={heroSlots}
            onSelectMovie={handleSelectMovie}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            theaters={theaters}
          />
        )}

        {currentView === 'theatres' && (
          <TheatresView
            theaters={theaters}
            movies={movies}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            onSelectMovie={handleSelectMovie}
          />
        )}

        {currentView === 'upcoming' && (
          <div style={{ maxWidth: '1240px', margin: '40px auto', padding: '0 24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.18em', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 800 }}>
                ANTICIPATED PREMIERES
              </span>
              <h1 style={{ fontSize: '2.4rem', fontFamily: 'Cinzel, Georgia, serif', fontWeight: 800, marginTop: '4px', marginBottom: '8px', color: '#f8fafc' }}>
                Upcoming Theatrical Releases
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Explore highly anticipated titles arriving across CINEVERSE auditoriums. Advance screenings will become bookable once scheduled.
              </p>
            </div>

            {loading && (
              <div className="empty-catalog-state" style={{ padding: '60px 20px' }}>
                <h3>Loading Upcoming Premieres...</h3>
                <p>Retrieving the latest release schedules from CINEVERSE programming...</p>
              </div>
            )}

            {!loading && error && (
              <div className="empty-catalog-state" style={{ border: '1px solid rgba(225, 29, 72, 0.4)', padding: '40px 20px' }}>
                <h3 style={{ color: '#fb7185' }}>Unable to Load Premieres</h3>
                <p>{error}</p>
                <button
                  type="button"
                  className="catalog-book-btn"
                  style={{ maxWidth: '180px', margin: '16px auto 0' }}
                  onClick={loadInitialData}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && upcomingMovies.length === 0 && (
              <div className="empty-catalog-state">
                <h3>No Upcoming Releases Scheduled</h3>
                <p>Check back shortly as our film programmers announce new theatrical releases.</p>
              </div>
            )}

            {!loading && !error && upcomingMovies.length > 0 && (
              <div className="catalog-grid">
                {upcomingMovies.map(up => (
                  <div key={up.id || up.title} className="catalog-movie-card" style={{ cursor: 'default' }}>
                    <div className="catalog-poster-wrap">
                      <img
                        src={up.poster_url || 'https://image.tmdb.org/t/p/w500/bA4bZg5sP002E7e2oR64v5e6Z7a.jpg'}
                        alt={up.title}
                        className="catalog-poster-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://image.tmdb.org/t/p/w500/bA4bZg5sP002E7e2oR64v5e6Z7a.jpg';
                        }}
                      />
                      <div className="catalog-status-badge status-coming-soon">
                        <span>Coming Soon</span>
                      </div>
                    </div>
                    <div className="catalog-card-details">
                      <h3 className="catalog-card-title">{up.title}</h3>
                      <div className="catalog-card-meta">
                        <span>{up.genre || 'Action / Drama'}</span>
                        <span className="meta-sep">•</span>
                        <span>{up.language || 'English'}</span>
                      </div>
                      <div style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Releasing: {formatPremiereDate(up.release_date)}
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <button
                          type="button"
                          className="catalog-book-btn btn-disabled"
                          disabled
                          title="Screenings will become bookable once scheduled closer to premiere date"
                        >
                          Premiere Releasing Soon
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'booking-flow' && selectedMovie && (
          <BookingFlowView
            movie={selectedMovie}
            currentCustomer={currentCustomer}
            initialShowtime={preselectedShowtime}
            onBack={() => {
              setSelectedMovie(null);
              setPreselectedShowtime(null);
              setCurrentView('home');
            }}
            onBookingFinished={handleBookingFinished}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            theaters={theaters}
          />
        )}

        {currentView === 'bookings' && (
          <MyBookingsView
            currentCustomer={currentCustomer}
            movies={movies}
            onBookNew={() => setCurrentView('home')}
          />
        )}
      </main>
    </div>
  );
}
