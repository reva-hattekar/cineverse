import React, { useState, useEffect } from 'react';
import CinemaNavbar from './components/CinemaNavbar';
import HomeView from './views/HomeView';
import BookingFlowView from './views/BookingFlowView';
import MyBookingsView from './views/MyBookingsView';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'upcoming', 'booking-flow', 'bookings'
  const [movies, setMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Jaipur');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [moviesRes, upcomingRes, customersRes] = await Promise.all([
        api.getMovies(),
        api.getUpcomingReleases(),
        api.getCustomers()
      ]);

      if (moviesRes.success) setMovies(moviesRes.data);
      if (upcomingRes.success) setUpcomingMovies(upcomingRes.data);
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

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setCurrentView('booking-flow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchCustomer = (customerId) => {
    const found = customers.find(c => c.customer_id === customerId);
    if (found) setCurrentCustomer(found);
  };

  const handleBookingFinished = (targetView) => {
    setSelectedMovie(null);
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
      />

      <main>
        {currentView === 'home' && (
          <HomeView
            movies={movies}
            upcomingMovies={upcomingMovies}
            onSelectMovie={handleSelectMovie}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentView === 'upcoming' && (
          <div style={{ maxWidth: '1240px', margin: '40px auto', padding: '0 24px' }}>
            <h1 style={{ fontSize: '2.4rem', fontFamily: 'Cinzel, Georgia, serif', fontWeight: 800, marginBottom: '8px', color: '#f8fafc' }}>
              Upcoming Theatrical Releases
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '32px' }}>
              Check out highly anticipated films hitting Indian cinemas in coming months.
            </p>

            <div className="catalog-grid">
              {upcomingMovies.map(up => (
                <div key={up.id} className="catalog-movie-card">
                  <div className="catalog-poster-wrap">
                    <img
                      src={up.poster_url || 'https://image.tmdb.org/t/p/w500/bA4bZg5sP002E7e2oR64v5e6Z7a.jpg'}
                      alt={up.title}
                      className="catalog-poster-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="catalog-card-details">
                    <h3 className="catalog-card-title">{up.title}</h3>
                    <div className="catalog-card-meta">
                      <span>{up.genre}</span>
                      <span className="meta-sep">•</span>
                      <span>{up.language}</span>
                    </div>
                    <div style={{ color: '#fb7185', fontSize: '0.84rem', fontWeight: 700, marginTop: '8px' }}>
                      Releasing: {up.release_date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'booking-flow' && selectedMovie && (
          <BookingFlowView
            movie={selectedMovie}
            currentCustomer={currentCustomer}
            onBack={() => {
              setSelectedMovie(null);
              setCurrentView('home');
            }}
            onBookingFinished={handleBookingFinished}
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
