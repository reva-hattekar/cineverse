import React, { useState } from 'react';
import { ArrowRight, Play, Sparkles, Star, Clock, Ticket, Film, Compass, ChevronRight } from 'lucide-react';
import CinematicHeroCanvas from '../components/hero/CinematicHeroCanvas';
import NowShowingCarousel from '../components/hero/NowShowingCarousel';

/**
 * HomeView
 * Redesigned customer homepage matching the CINEVERSE visual specification.
 * Combines 3D procedural hero sculpture, asymmetric editorial typography,
 * interactive format badges, and horizontal database-backed movie carousel.
 */
export default function HomeView({
  movies = [],
  upcomingMovies = [],
  onSelectMovie,
  searchQuery = '',
  setSearchQuery
}) {
  const [activeSlide, setActiveSlide] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showWorldVideoModal, setShowWorldVideoModal] = useState(false);

  // Available unique genres from live movies
  const genres = ['All', ...Array.from(new Set(movies.map((m) => m.genre).filter(Boolean)))];

  // Filtered movies based on navbar search or genre filter
  const filteredMovies = movies.filter((m) => {
    const matchSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.genre && m.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchGenre =
      selectedGenre === 'All' || m.genre?.toLowerCase() === selectedGenre.toLowerCase();
    return matchSearch && matchGenre;
  });

  const scrollToMovies = () => {
    const el = document.getElementById('cineverse-catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="cineverse-home-page">
      {/* =========================================================
          HERO SECTION: ASYMMETRIC 3D LIQUID CHROME & EDITORIAL
         ========================================================= */}
      <section className="cineverse-hero-viewport">
        {/* Genuine Three.js 3D Procedural Hero Scene */}
        <CinematicHeroCanvas />

        {/* Ambient Dark-Crimson Gradient Vignette Scrim */}
        <div className="hero-atmosphere-scrim" />

        {/* Hero Foreground Content */}
        <div className="hero-foreground-grid">
          {/* Vertical Slide Indicator Rail */}
          <div className="hero-slide-rail" aria-label="Hero slider pagination">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                className={`slide-num-btn ${activeSlide === num ? 'active' : ''}`}
                onClick={() => setActiveSlide(num)}
                aria-label={`Slide 0${num}`}
              >
                0{num}
              </button>
            ))}
          </div>

          {/* Left Hero Editorial Content */}
          <div className="hero-editorial-column">
            <div className="editorial-eyebrow">
              <span>A UNIVERSE OF STORIES AWAITS</span>
            </div>

            <h1 className="hero-main-title">
              CINE<span className="title-star-accent">V</span>ERSE
            </h1>

            <div className="hero-tagline-row">
              <span>MOVIES</span>
              <span className="dot-sep">•</span>
              <span>EXPERIENCES</span>
              <span className="dot-sep">•</span>
              <span>BEYOND REALITY</span>
            </div>

            <div className="hero-actions-cluster">
              <button
                className="hero-primary-btn"
                onClick={scrollToMovies}
              >
                <span>EXPLORE MOVIES</span>
                <span className="btn-arrow-circle">
                  <ArrowRight size={15} />
                </span>
              </button>

              <button
                className="hero-secondary-btn"
                onClick={() => setShowWorldVideoModal(true)}
              >
                <span className="play-icon-circle">
                  <Play size={12} fill="currentColor" />
                </span>
                <span>WATCH OUR WORLD</span>
              </button>
            </div>
          </div>

          {/* Right Column: Portal Stargate Ring & Interactive Badge */}
          <div className="hero-interactive-portal-badge">
            <div
              className="rotating-reality-badge"
              onClick={() => setShowWorldVideoModal(true)}
              role="button"
              tabIndex={0}
            >
              <div className="reality-play-core">
                <Play size={16} fill="#fff" />
              </div>
              <svg className="rotating-text-svg" viewBox="0 0 100 100">
                <path
                  id="circlePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text fontSize="7.8" fill="#e2e8f0" letterSpacing="2.2">
                  <textPath href="#circlePath">
                    STEP INTO ANOTHER REALITY • CINEVERSE •
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom "NOW SHOWING" Cinematic Movie Carousel */}
        <div className="hero-carousel-dock">
          <NowShowingCarousel
            movies={movies}
            onSelectMovie={onSelectMovie}
          />
        </div>
      </section>

      {/* =========================================================
          FULL CATALOG BROWSER & GENRE FILTER SECTION
         ========================================================= */}
      <section id="cineverse-catalog-section" className="cineverse-catalog-section">
        <div className="catalog-container">
          <div className="catalog-header-flex">
            <div>
              <span className="section-subtitle">DISCOVER THE UNIVERSE</span>
              <h2 className="section-title">All Theatrical Screenings</h2>
            </div>

            {/* Genre Filter Pills */}
            <div className="genre-pills-row">
              {genres.map((g) => (
                <button
                  key={g}
                  className={`genre-filter-pill ${selectedGenre === g ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Feedback */}
          {searchQuery && (
            <div className="search-feedback-bar">
              <span>Showing results for &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery && setSearchQuery('')}
              >
                Clear search
              </button>
            </div>
          )}

          {/* Catalog Grid */}
          <div className="catalog-grid">
            {filteredMovies.map((movie) => {
              const poster =
                movie.poster_url ||
                movie.backdrop_url ||
                'https://image.tmdb.org/t/p/w500/bA4bZg5sP002E7e2oR64v5e6Z7a.jpg';

              const ratingVal = movie.rating
                ? parseFloat(movie.rating).toFixed(1)
                : '8.2';

              return (
                <div
                  key={movie.movie_id || movie.id}
                  className="catalog-movie-card"
                  onClick={() => onSelectMovie(movie)}
                >
                  <div className="catalog-poster-wrap">
                    <img
                      src={poster}
                      alt={movie.title}
                      className="catalog-poster-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://image.tmdb.org/t/p/w500/bA4bZg5sP002E7e2oR64v5e6Z7a.jpg';
                      }}
                    />
                    <div className="catalog-badge-overlay">
                      <span className="badge-rating">
                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                        <span>{ratingVal}</span>
                      </span>
                    </div>
                  </div>

                  <div className="catalog-card-details">
                    <h3 className="catalog-card-title">{movie.title}</h3>
                    <div className="catalog-card-meta">
                      <span>{movie.genre || 'Action'}</span>
                      <span className="meta-sep">•</span>
                      <span className="meta-time">
                        <Clock size={12} /> {movie.duration || 120}m
                      </span>
                      {movie.language && (
                        <>
                          <span className="meta-sep">•</span>
                          <span>{movie.language}</span>
                        </>
                      )}
                    </div>
                    <button
                      className="catalog-book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMovie(movie);
                      }}
                    >
                      <Ticket size={14} /> Book Seats
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMovies.length === 0 && (
            <div className="empty-catalog-state">
              <Film size={42} color="#64748b" />
              <h3>No Screenings Found</h3>
              <p>We could not find any titles matching your filter or search query.</p>
              <button
                className="hero-primary-btn"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setSelectedGenre('All');
                  if (setSearchQuery) setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          WATCH OUR WORLD VIDEO MODAL
         ========================================================= */}
      {showWorldVideoModal && (
        <div
          className="cinema-modal-backdrop"
          onClick={() => setShowWorldVideoModal(false)}
        >
          <div
            className="cinema-modal-card cinematic-video-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Sparkles size={18} color="#e11d48" />
                <h3>CINEVERSE — Step Into Another Reality</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowWorldVideoModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-video-container">
              <iframe
                title="CINEVERSE Experience Teaser"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="modal-video-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
