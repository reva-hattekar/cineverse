import React, { useState, useEffect } from 'react';
import CinemaNavbar from './components/CinemaNavbar';
import HomeView from './views/HomeView';
import TheatresView from './views/TheatresView';
import BookingFlowView from './views/BookingFlowView';
import MyBookingsView from './views/MyBookingsView';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'theatres', 'upcoming', 'booking-flow', 'bookings'
  const [movies, setMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [preselectedShowtime, setPreselectedShowtime] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [moviesRes, upcomingRes, customersRes, theatersRes] = await Promise.all([
        api.getMovies(),
        api.getUpcomingReleases(),
        api.getCustomers(),
        api.getTheaters()
      ]);

      if (moviesRes.success) {
        setMovies(moviesRes.data);
      }

      // Merge database upcoming movies with upcoming releases (guaranteeing zero duplicates)
      let combinedUpcoming = [];
      if (upcomingRes && upcomingRes.success && Array.isArray(upcomingRes.data)) {
        combinedUpcoming = [...upcomingRes.data];
      }

      if (moviesRes && moviesRes.success && Array.isArray(moviesRes.data)) {
        const dbComingSoon = moviesRes.data.filter(
          m =>
            m.release_status === 'Coming Soon' ||
            (m.release_date && new Date(m.release_date) > new Date() && (!m.scheduled_showtimes_count || m.scheduled_showtimes_count === 0))
        );
        const existingTitles = new Set(combinedUpcoming.map(u => (u.title || '').trim().toLowerCase()));
        dbComingSoon.forEach(dbM => {
          if (!existingTitles.has(dbM.title.trim().toLowerCase())) {
            combinedUpcoming.unshift({
              id: dbM.movie_id,
              title: dbM.title,
              genre: dbM.genre,
              language: dbM.language,
              duration: dbM.duration,
              release_date: dbM.release_date || 'Expected Soon',
              poster_url: dbM.poster_url,
              backdrop_url: dbM.backdrop_url,
              status: 'Coming Soon'
            });
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
                      Releasing: {up.release_date || 'Expected Soon'}
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

            {upcomingMovies.length === 0 && (
              <div className="empty-catalog-state">
                <h3>No Upcoming Releases Scheduled</h3>
                <p>Check back shortly as our film programmers announce new theatrical releases.</p>
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
            onBookNew={() => setCurrentView('home')}
          />
        )}
      </main>
    </div>
  );
}
