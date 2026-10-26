import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Film, Sparkles, Clock, Ticket, ArrowRight, Check } from 'lucide-react';
import { api } from '../services/api';

/**
 * TheatresView
 * Dedicated, full-scale theatre discovery view for CINEVERSE.
 * - Displays database-backed theatre venues with verified addresses & auditoriums
 * - Shows live movie screenings playing at each venue
 * - Direct action: clicking any screening immediately enters the booking flow for that showtime
 * - Full city filtering with responsive, polished empty states
 */
export default function TheatresView({
  theaters = [],
  movies = [],
  selectedCity = 'Bengaluru',
  setSelectedCity,
  onSelectMovie
}) {
  const [movieShowtimesMap, setMovieShowtimesMap] = useState({});
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  const availableCities = ['Bengaluru', 'Jaipur', 'Mumbai', 'Delhi NCR'];

  // Load showtimes for all active movies to associate screenings with each theatre
  useEffect(() => {
    let isMounted = true;

    async function fetchAllMovieShowtimes() {
      if (movies.length === 0) return;
      setLoadingShowtimes(true);
      try {
        const promises = movies.map(m =>
          api.getMovieShowtimes(m.movie_id).then(res => ({
            movieId: m.movie_id,
            movie: m,
            showtimes: res.success ? res.data : []
          })).catch(() => ({ movieId: m.movie_id, movie: m, showtimes: [] }))
        );

        const results = await Promise.all(promises);
        if (!isMounted) return;

        const map = {};
        results.forEach(item => {
          item.showtimes.forEach(st => {
            const tId = st.theater_id;
            if (!map[tId]) map[tId] = [];
            map[tId].push({
              ...st,
              movie: item.movie
            });
          });
        });

        setMovieShowtimesMap(map);
      } catch (err) {
        console.error('Failed to load theatre showtimes:', err);
      } finally {
        if (isMounted) setLoadingShowtimes(false);
      }
    }

    fetchAllMovieShowtimes();

    return () => {
      isMounted = false;
    };
  }, [movies]);

  // Filter theaters by currently selected city
  const cityTheaters = theaters.filter(
    t => t.city && t.city.toLowerCase() === selectedCity.toLowerCase()
  );

  return (
    <div className="theatres-page-viewport">
      <div className="theatres-content-container">
        {/* Header Section */}
        <div className="theatres-header-section">
          <div className="theatres-eyebrow">
            <Sparkles size={14} className="eyebrow-star" />
            <span>ARCHITECTURAL CINEMAS & AUDITORIUMS</span>
          </div>

          <h1 className="theatres-main-heading">
            CINEVERSE Theatres in {selectedCity}
          </h1>

          <p className="theatres-subheading">
            Experience world-class acoustic precision, premium recliners, and dual-laser projection across our curated venues.
          </p>

          {/* City Switcher Bar */}
          <div className="theatres-city-pills-bar" role="tablist" aria-label="Select City">
            {availableCities.map(city => {
              const count = theaters.filter(
                t => t.city && t.city.toLowerCase() === city.toLowerCase()
              ).length;
              const isSelected = selectedCity.toLowerCase() === city.toLowerCase();

              return (
                <button
                  key={city}
                  type="button"
                  className={`theatres-city-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCity && setSelectedCity(city)}
                  role="tab"
                  aria-selected={isSelected}
                >
                  <MapPin size={13} className="pill-pin-icon" />
                  <span>{city}</span>
                  <span className="city-count-badge">
                    {count > 0 ? `${count} ${count === 1 ? 'Venue' : 'Venues'}` : 'Soon'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Venues Grid / Content */}
        {cityTheaters.length > 0 ? (
          <div className="theatres-venues-grid">
            {cityTheaters.map(theater => {
              const screenings = movieShowtimesMap[theater.theater_id] || [];

              // Group screenings by movie title
              const screeningsByMovie = {};
              screenings.forEach(sc => {
                const title = sc.movie?.title || 'Featured Film';
                if (!screeningsByMovie[title]) {
                  screeningsByMovie[title] = {
                    movie: sc.movie,
                    slots: []
                  };
                }
                screeningsByMovie[title].slots.push(sc);
              });

              return (
                <article key={theater.theater_id} className="theatre-venue-card">
                  {/* Top Bar with Venue Identity */}
                  <div className="theatre-card-top-bar">
                    <div className="theatre-identity-wrap">
                      <div className="theatre-icon-box">
                        <Building2 size={24} color="#fb7185" />
                      </div>
                      <div>
                        <div className="theatre-badge-row">
                          <span className="theatre-flagship-pill">⭐ Premium Flagship</span>
                          <span className="theatre-city-badge">{theater.city}</span>
                        </div>
                        <h2 className="theatre-venue-title">{theater.theater_name}</h2>
                        <div className="theatre-address-line">
                          <MapPin size={14} className="address-pin" />
                          <span>{theater.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auditoriums & Formats Breakdown */}
                  <div className="theatre-auditoriums-section">
                    <div className="section-mini-label">ACTIVE AUDITORIUMS & SCREENS</div>
                    <div className="theatre-screens-chips-row">
                      {theater.screens && theater.screens.length > 0 ? (
                        theater.screens.map(screen => (
                          <div key={screen.screen_id} className="theatre-screen-chip">
                            <span className="screen-num">{screen.screen_name || `Screen ${screen.screen_number}`}</span>
                            <span className="screen-cap">
                              {screen.capacity ? `${screen.capacity} Seats` : '142 Seats'}
                            </span>
                            <span className="screen-format-tag">
                              {screen.screen_type || (screen.screen_number === 1 ? 'IMAX Laser' : 'Dolby Atmos')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="theatre-screen-chip">
                          <span className="screen-num">Screen 1</span>
                          <span className="screen-cap">142 Seats</span>
                          <span className="screen-format-tag">IMAX Laser</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Movie Screenings Playing at This Venue */}
                  <div className="theatre-screenings-block">
                    <div className="section-mini-label">NOW PLAYING AT THIS VENUE</div>

                    {Object.keys(screeningsByMovie).length > 0 ? (
                      <div className="theatre-movies-screenings-list">
                        {Object.entries(screeningsByMovie).map(([movieTitle, group]) => (
                          <div key={movieTitle} className="theatre-movie-screening-row">
                            <div className="movie-mini-info">
                              {group.movie?.poster_url && (
                                <img
                                  src={group.movie.poster_url}
                                  alt={movieTitle}
                                  className="movie-mini-poster"
                                />
                              )}
                              <div>
                                <h3 className="movie-mini-title">{movieTitle}</h3>
                                <div className="movie-mini-meta">
                                  <span>{group.movie?.genre}</span>
                                  {group.movie?.duration && (
                                    <>
                                      <span className="dot">•</span>
                                      <span>{group.movie.duration}m</span>
                                    </>
                                  )}
                                  {group.movie?.rating && (
                                    <>
                                      <span className="dot">•</span>
                                      <span className="rating-pill">⭐ {group.movie.rating}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Clickable Showtime Pills: Clicking immediately opens booking */}
                            <div className="theatre-slots-flex">
                              {group.slots.map(slot => (
                                <button
                                  key={slot.show_id}
                                  type="button"
                                  className="theatre-showtime-slot-btn"
                                  onClick={() => {
                                    if (onSelectMovie && group.movie) {
                                      onSelectMovie(group.movie, slot);
                                    }
                                  }}
                                  title={`Book ${movieTitle} at ${slot.start_time} (Screen ${slot.screen_number})`}
                                >
                                  <div className="slot-time">{slot.start_time.slice(0, 5)}</div>
                                  <div className="slot-details">
                                    Screen {slot.screen_number} • ₹{slot.base_price}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="theatre-no-screenings-hint">
                        {loadingShowtimes
                          ? 'Loading today’s schedule...'
                          : 'No current showtimes scheduled for today. Check back shortly!'}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Attractive Empty State for Unpopulated Cities */
          <div className="theatres-empty-state-card">
            <div className="empty-theatre-icon-circle">
              <Building2 size={36} color="#fb7185" />
            </div>
            <h2 className="empty-theatre-title">
              No CINEVERSE Theatres Currently in {selectedCity}
            </h2>
            <p className="empty-theatre-text">
              Our flagship architectural auditoriums and multi-screen cinema complexes are currently operational in <strong>Bengaluru</strong>. Expansion to {selectedCity} is actively in progress.
            </p>

            <button
              type="button"
              className="btn btn-primary btn-lg empty-theatre-action-btn"
              onClick={() => setSelectedCity && setSelectedCity('Bengaluru')}
            >
              <span>Explore Operational Bengaluru Theatres (2 Venues)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

