import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowRight, Play, Sparkles, Star, Clock, Ticket, Film, Compass, CheckCircle2 } from 'lucide-react';
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
  setSearchQuery,
  selectedCity = 'Bengaluru',
  setSelectedCity,
  theaters = []
}) {
  const [activeSlide, setActiveSlide] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'now_showing', 'coming_soon'
  const [showRealityModal, setShowRealityModal] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);

  // Filter movies that are legitimately Now Showing with bookable showtimes
  const nowShowingCarouselMovies = useMemo(() => {
    const list = movies.filter(
      (m) =>
        (m.scheduled_showtimes_count > 0 && m.release_status !== 'Ended') ||
        (m.release_status === 'Now Showing' && m.scheduled_showtimes_count > 0)
    );
    return list.length > 0 ? list : movies;
  }, [movies]);

  const nowShowingCount = useMemo(() => {
    return movies.filter(
      (m) => m.scheduled_showtimes_count > 0 && m.release_status !== 'Ended'
    ).length;
  }, [movies]);

  const comingSoonCount = useMemo(() => {
    return movies.filter(
      (m) =>
        m.release_status === 'Coming Soon' ||
        (m.release_date && new Date(m.release_date) > new Date() && (!m.scheduled_showtimes_count || m.scheduled_showtimes_count === 0))
    ).length;
  }, [movies]);

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

  // Filtered movies based on genre and category filter
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchGenre =
        selectedGenre === 'All' || m.genre?.toLowerCase() === selectedGenre.toLowerCase();
      if (!matchGenre) return false;

      const isBookable = m.scheduled_showtimes_count > 0 && m.release_status !== 'Ended';
      const isComingSoon =
        m.release_status === 'Coming Soon' ||
        (m.release_date && new Date(m.release_date) > new Date() && (!m.scheduled_showtimes_count || m.scheduled_showtimes_count === 0));

      if (categoryFilter === 'now_showing') return isBookable;
      if (categoryFilter === 'coming_soon') return isComingSoon;
      return true;
    });
  }, [movies, selectedGenre, categoryFilter]);

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

        {/* Experience 01: Suspended Spider-Web Interaction from Top Edge of Hero */}
        {currentExp.id === 1 && (
          <SpiderWebTrigger onClick={() => setShowRealityModal(true)} />
        )}

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

          {/* Right Column Spacer (Preserves negative space for the 3D cinema installation) */}
          <div className="hero-grid-right-spacer" />
        </div>

        {/* Bottom "NOW SHOWING" Cinematic Movie Carousel (Only Verified Showing Titles) */}
        <div className="hero-carousel-dock">
          <NowShowingCarousel movies={nowShowingCarouselMovies} onSelectMovie={onSelectMovie} />
        </div>
      </section>

      {/* =========================================================
          CONTINUOUS CATALOG BROWSER & GENRE FILTER SECTION
         ========================================================= */}
      <section id="cineverse-catalog-section" className="cineverse-catalog-section">
        <div className="catalog-container">
          <div className="catalog-header-flex" style={{ flexWrap: 'wrap', gap: '18px' }}>
            <div>
              <span className="section-subtitle">DISCOVER THE UNIVERSE</span>
              <h2 className="section-title">Theatrical Movie Catalog</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.82rem', color: '#94a3b8' }}>
                <span>📍 Exploring in <strong style={{ color: '#fff' }}>{selectedCity}</strong></span>
                <span className="dot-sep">•</span>
                {theaters.filter(t => t.city.toLowerCase() === selectedCity.toLowerCase()).length > 0 ? (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{theaters.filter(t => t.city.toLowerCase() === selectedCity.toLowerCase()).length} Flagship Multiplexes Active</span>
                ) : (
                  <span>
                    No local venues yet (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', padding: 0, color: '#fb7185', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                      onClick={() => setSelectedCity && setSelectedCity('Bengaluru')}
                    >
                      switch to Bengaluru
                    </button>
                    )
                  </span>
                )}
              </div>
            </div>

            {/* Combined Category & Genre Filter Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
              {/* Category Pills (Now Showing vs Coming Soon) */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '24px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  type="button"
                  className={`genre-filter-pill ${categoryFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                  style={{ borderRadius: '20px', fontSize: '0.78rem' }}
                >
                  All ({movies.length})
                </button>
                <button
                  type="button"
                  className={`genre-filter-pill ${categoryFilter === 'now_showing' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('now_showing')}
                  style={{ borderRadius: '20px', fontSize: '0.78rem' }}
                >
                  Now Showing ({nowShowingCount})
                </button>
                <button
                  type="button"
                  className={`genre-filter-pill ${categoryFilter === 'coming_soon' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('coming_soon')}
                  style={{ borderRadius: '20px', fontSize: '0.78rem' }}
                >
                  Coming Soon ({comingSoonCount})
                </button>
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
              const showtimesCount = movie.scheduled_showtimes_count || 0;
              const hasShowtimes = showtimesCount > 0 && movie.release_status !== 'Ended';
              const isComingSoon =
                movie.release_status === 'Coming Soon' ||
                (movie.release_date && new Date(movie.release_date) > new Date() && !hasShowtimes);

              return (
                <div
                  key={movie.movie_id || movie.id}
                  className="catalog-movie-card"
                  onClick={() => hasShowtimes && onSelectMovie(movie)}
                  style={{ cursor: hasShowtimes ? 'pointer' : 'default' }}
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

                    {/* Accurate Status Overlays */}
                    {hasShowtimes ? (
                      <div className="catalog-status-badge status-now-showing">
                        <CheckCircle2 size={11} />
                        <span>{showtimesCount} Showtimes</span>
                      </div>
                    ) : isComingSoon ? (
                      <div className="catalog-status-badge status-coming-soon">
                        <Sparkles size={11} />
                        <span>Coming Soon</span>
                      </div>
                    ) : (
                      <div className="catalog-status-badge" style={{ background: 'rgba(100, 116, 139, 0.45)', color: '#94a3b8' }}>
                        <span>Showtimes TBA</span>
                      </div>
                    )}

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

                    {/* Release Date if Coming Soon */}
                    {isComingSoon && movie.release_date && (
                      <div style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700, marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> Releasing: {movie.release_date}
                      </div>
                    )}

                    <div style={{ marginTop: '10px' }}>
                      {hasShowtimes ? (
                        <button
                          className="catalog-book-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMovie(movie);
                          }}
                        >
                          <Ticket size={14} /> Book Seats
                        </button>
                      ) : isComingSoon ? (
                        <button
                          type="button"
                          className="catalog-book-btn btn-disabled"
                          disabled
                          title="Screenings will become bookable once scheduled closer to release date"
                        >
                          <Sparkles size={13} /> Releasing Soon
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="catalog-book-btn btn-disabled"
                          disabled
                          title="No auditoriums currently scheduled for this title"
                        >
                          Showtimes TBA
                        </button>
                      )}
                    </div>
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
