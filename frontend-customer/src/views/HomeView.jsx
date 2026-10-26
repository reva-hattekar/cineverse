import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Play, Sparkles, Star, Clock, Ticket, Film, Compass } from 'lucide-react';
import CinematicHeroCanvas from '../components/hero/CinematicHeroCanvas';
import NowShowingCarousel from '../components/hero/NowShowingCarousel';
import HeroTrailerPlayer from '../components/hero/HeroTrailerPlayer';
import SpiderWebTrigger from '../components/hero/SpiderWebTrigger';
import StepIntoRealityModal from '../components/hero/StepIntoRealityModal';
import { HERO_EXPERIENCES } from '../config/heroExperiences';

/**
 * HomeView
 * Customer homepage matching the CINEVERSE visual specification.
 * - Interactive 01, 02, 03, 04 experiences with timed automatic progression
 *   (30s for 01, 15s for 02-04, pausing on user engagement or page hide)
 * - Delicate spider-web interactive element replacing rotating badge
 * - "STEP INTO ANOTHER REALITY" experiential modal
 * - Continuous charcoal/burgundy atmosphere flowing into database-backed carousel and catalog
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
  const [showRealityModal, setShowRealityModal] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);

  // Current active hero experience from data configuration
  const currentExp = HERO_EXPERIENCES.find((e) => e.id === activeSlide) || HERO_EXPERIENCES[0];

  // Match real movie from live database movies array if configured
  const matchedMovie = currentExp.movieId
    ? movies.find(
        (m) =>
          m.movie_id === currentExp.movieId ||
          m.title?.toLowerCase() === currentExp.fallbackTitle?.toLowerCase()
      )
    : null;

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

  const handleBookCurrentExperience = () => {
    setUserInteracting(true); // Suspend progression when booking
    if (matchedMovie) {
      onSelectMovie(matchedMovie);
    } else if (currentExp.movieId) {
      const fallbackObj = movies.find((m) => m.movie_id === currentExp.movieId) || {
        movie_id: currentExp.movieId,
        title: currentExp.fallbackTitle
      };
      onSelectMovie(fallbackObj);
    } else {
      scrollToMovies();
    }
  };

  // Timed progression (30s on Experience 01, 15s on Experiences 02, 03, 04)
  const timerRef = useRef(null);

  const advanceExperience = useCallback(() => {
    setActiveSlide((prev) => (prev >= 4 ? 1 : prev + 1));
  }, []);

  useEffect(() => {
    // Suspend progression if user is actively interacting, or if reduced-motion is preferred
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (userInteracting || mediaQuery.matches) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const duration = activeSlide === 1 ? 30000 : 15000;

    const scheduleTimer = () => {
      if (document.hidden) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        advanceExperience();
      }, duration);
    };

    scheduleTimer();

    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        scheduleTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [activeSlide, userInteracting, advanceExperience]);

  const handleManualSlideSelect = (id) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveSlide(id);
  };

  return (
    <div className="cineverse-home-page">
      {/* =========================================================
          HERO SECTION: 4 INTERACTIVE EXPERIENCES (01-04)
         ========================================================= */}
      <section className="cineverse-hero-viewport" aria-label="Hero Spotlight">
        {/* Experience 01: Genuine Three.js 3D Procedural Hero Scene */}
        <CinematicHeroCanvas active={currentExp.type === '3d-brand'} />

        {/* Experiences 02, 03, 04: Configurable Featured Trailer Layer */}
        {currentExp.type === 'trailer' && (
          <HeroTrailerPlayer
            key={currentExp.id}
            experience={currentExp}
            movie={matchedMovie}
            onSelectMovie={(m) => {
              setUserInteracting(true);
              onSelectMovie(m);
            }}
            isActive={currentExp.type === 'trailer'}
          />
        )}

        {/* Ambient Dark-Crimson Gradient Vignette Scrim */}
        <div className="hero-atmosphere-scrim" />

        {/* Hero Foreground Content */}
        <div className="hero-foreground-grid">
          {/* Vertical Slide Indicator Rail (01, 02, 03, 04) */}
          <div className="hero-slide-rail" aria-label="Hero experience selector" role="tablist">
            {HERO_EXPERIENCES.map((exp) => (
              <button
                key={exp.id}
                role="tab"
                aria-selected={activeSlide === exp.id}
                aria-label={`Experience 0${exp.id}: ${exp.title || exp.fallbackTitle}`}
                className={`slide-num-btn ${activeSlide === exp.id ? 'active' : ''}`}
                onClick={() => handleManualSlideSelect(exp.id)}
              >
                0{exp.id}
              </button>
            ))}
          </div>

          {/* Left Hero Editorial Column */}
          <div className="hero-editorial-column">
            <div className="editorial-eyebrow">
              <span>{currentExp.eyebrow}</span>
            </div>

            {currentExp.id === 1 ? (
              <h1 className="hero-main-title">
                CINE<span className="title-star-accent">V</span>ERSE
              </h1>
            ) : (
              <h1 className="hero-main-title trailer-movie-title">
                {matchedMovie?.title || currentExp.fallbackTitle}
              </h1>
            )}

            <div className="hero-tagline-row">
              {currentExp.id === 1 ? (
                <>
                  <span>MOVIES</span>
                  <span className="dot-sep">•</span>
                  <span>EXPERIENCES</span>
                  <span className="dot-sep">•</span>
                  <span>BEYOND REALITY</span>
                </>
              ) : (
                <>
                  <span>{matchedMovie?.genre || 'Action'}</span>
                  <span className="dot-sep">•</span>
                  <span>
                    {matchedMovie
                      ? `${Math.floor(matchedMovie.duration / 60)}h ${matchedMovie.duration % 60}m`
                      : '2h 30m'}
                  </span>
                  <span className="dot-sep">•</span>
                  <span className="hero-rating-badge">
                    <Star size={13} fill="#fbbf24" color="#fbbf24" />
                    <span>{matchedMovie?.rating || '8.8'}</span>
                  </span>
                </>
              )}
            </div>

            {currentExp.description && (
              <p className="hero-description-text">{currentExp.description}</p>
            )}

            <div className="hero-actions-cluster">
              {currentExp.id === 1 ? (
                <>
                  <button className="hero-primary-btn" onClick={scrollToMovies}>
                    <span>EXPLORE MOVIES</span>
                    <span className="btn-arrow-circle">
                      <ArrowRight size={15} />
                    </span>
                  </button>

                  <button
                    className="hero-secondary-btn"
                    onClick={() => setShowRealityModal(true)}
                  >
                    <span className="play-icon-circle">
                      <Play size={12} fill="currentColor" />
                    </span>
                    <span>WATCH OUR WORLD</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="hero-primary-btn"
                    onClick={handleBookCurrentExperience}
                  >
                    <Ticket size={15} />
                    <span>BOOK TICKETS NOW</span>
                    <span className="btn-arrow-circle">
                      <ArrowRight size={15} />
                    </span>
                  </button>

                  <button className="hero-secondary-btn" onClick={scrollToMovies}>
                    <Compass size={14} />
                    <span>ALL MOVIES</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Spider-Web Interactive Element (Experience 01) */}
          {currentExp.id === 1 && (
            <div className="hero-interactive-portal-badge">
              <SpiderWebTrigger onClick={() => setShowRealityModal(true)} />
            </div>
          )}
        </div>

        {/* Bottom "NOW SHOWING" Cinematic Movie Carousel */}
        <div className="hero-carousel-dock">
          <NowShowingCarousel movies={movies} onSelectMovie={onSelectMovie} />
        </div>
      </section>

      {/* =========================================================
          CONTINUOUS CATALOG BROWSER & GENRE FILTER SECTION
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
              <span>
                Showing results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
              </span>
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

              const ratingVal = movie.rating ? parseFloat(movie.rating).toFixed(1) : '8.2';

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
                        e.target.src =
                          'https://image.tmdb.org/t/p/w500/bA4bZg5sP002E7e2oR64v5e6Z7a.jpg';
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
          "STEP INTO ANOTHER REALITY" EXPERIENTIAL MODAL
         ========================================================= */}
      <StepIntoRealityModal
        isOpen={showRealityModal}
        onClose={() => setShowRealityModal(false)}
        onExploreMovies={() => {
          setShowRealityModal(false);
          scrollToMovies();
        }}
      />
    </div>
  );
}
