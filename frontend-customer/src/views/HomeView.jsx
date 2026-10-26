import React, { useState } from 'react';
import { Star, Clock, Ticket, Search, Calendar, Sparkles, Film } from 'lucide-react';

export default function HomeView({ movies, upcomingMovies, onSelectMovie }) {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // Hero movie (e.g. Interstellar or Dune or top rated)
  const heroMovie = movies.find(m => m.title === 'Interstellar') || movies[0] || {};

  const genres = ['All', ...Array.from(new Set(movies.map(m => m.genre)))];

  const filteredMovies = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = !selectedGenre || selectedGenre === 'All' || m.genre === selectedGenre;
    return matchSearch && matchGenre;
  });

  return (
    <div>
      {/* Cinematic Hero Banner */}
      {heroMovie.title && (
        <div
          className="hero-banner"
          style={{
            backgroundImage: heroMovie.backdrop_url
              ? `url('${heroMovie.backdrop_url}')`
              : `url('https://image.tmdb.org/t/p/original/rAiYTsqJJR0KP8UN8vJjZHa820g.jpg')`
          }}
        >
          <div className="hero-overlay" />
          <div className="hero-content">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span className="hero-badge">NOW SCREENING IN IMAX 70MM</span>
              <span className="hero-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                ⭐ {heroMovie.rating} IMDb
              </span>
            </div>
            <h1 className="hero-title">{heroMovie.title}</h1>
            <div className="hero-meta">
              <span>{heroMovie.genre}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={15} /> {heroMovie.duration} mins
              </span>
              <span>•</span>
              <span>{heroMovie.language}</span>
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onSelectMovie(heroMovie)}
            >
              <Ticket size={20} /> Book Tickets Now
            </button>
          </div>
        </div>
      )}

      {/* Main Catalog Section */}
      <section className="section-container">
        {/* Search & Genre Filter Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Genre Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {genres.map(g => (
              <button
                key={g}
                className={`btn btn-secondary btn-sm ${(!selectedGenre && g === 'All') || selectedGenre === g ? 'active' : ''}`}
                style={{
                  background: ((!selectedGenre && g === 'All') || selectedGenre === g) ? '#e11d48' : '#121829',
                  color: '#fff',
                  border: ((!selectedGenre && g === 'All') || selectedGenre === g) ? '1px solid #fda4af' : '1px solid #1c2438'
                }}
                onClick={() => setSelectedGenre(g === 'All' ? '' : g)}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
        </div>

        {/* Section Title */}
        <div className="section-header">
          <h2 className="section-title">
            <Film size={22} color="#e11d48" /> Now Showing in Cinemas
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {filteredMovies.length} movies available
          </span>
        </div>

        {/* Movie Cards Grid */}
        {filteredMovies.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#121829',
            borderRadius: '12px',
            border: '1px solid #1c2438'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>No movies found matching "{search}".</p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '12px' }}
              onClick={() => { setSearch(''); setSelectedGenre(''); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="movies-grid">
            {filteredMovies.map(movie => (
              <div key={movie.movie_id} className="movie-card">
                <div className="poster-box">
                  <img
                    src={movie.poster_url || 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'}
                    alt={movie.title}
                    className="poster-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';
                    }}
                  />
                  <div className="poster-rating">
                    <Star size={13} fill="#f59e0b" /> {movie.rating}
                  </div>
                </div>

                <div className="movie-details">
                  <div>
                    <h3 className="movie-name">{movie.title}</h3>
                    <div className="movie-genre">{movie.genre} • {movie.language}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <Clock size={14} /> {movie.duration} mins
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={() => onSelectMovie(movie)}
                  >
                    <Ticket size={16} /> Book Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Releases Section */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <Sparkles size={22} color="#f59e0b" /> Upcoming Theatrical Releases
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Advance Notice</span>
        </div>

        <div className="movies-grid">
          {upcomingMovies.map(up => (
            <div key={up.id} className="movie-card" style={{ opacity: 0.9 }}>
              <div className="poster-box">
                <img
                  src={up.poster_url || 'https://image.tmdb.org/t/p/w500/bA4bZg5sP002E7e2oR64v5e6Z7a.jpg'}
                  alt={up.title}
                  className="poster-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(225, 29, 72, 0.9)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#fff'
                }}>
                  COMING SOON
                </div>
              </div>

              <div className="movie-details">
                <div>
                  <h3 className="movie-name">{up.title}</h3>
                  <div className="movie-genre">{up.genre} • {up.language}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f59e0b' }}>
                    <Calendar size={14} /> Releasing: {up.release_date}
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '16px', opacity: 0.8 }}
                  disabled
                >
                  Advance Booking Soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

