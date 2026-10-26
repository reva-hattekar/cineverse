import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

/**
 * NowShowingCarousel
 * Horizontal cinematic movie carousel matching the CINEVERSE reference design.
 * - Displays database-backed movies with backdrop imagery, genres, runtimes, and ratings
 * - Autoplays every 5 seconds, pausing on hover, focus, or interaction
 * - Respects prefers-reduced-motion and cleans up timers on unmount
 * - Wraps smoothly when reaching end of track
 */
export default function NowShowingCarousel({ movies = [], onSelectMovie }) {
  const scrollTrackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const scroll = useCallback((direction) => {
    const container = scrollTrackRef.current;
    if (!container) return;

    const scrollAmount = 240; // Approx card width + gap
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      if (container.scrollLeft >= maxScroll - 10) {
        // Smooth loop back to beginning
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 10) {
        container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || isReducedMotion || movies.length <= 1) return;

    const interval = setInterval(() => {
      scroll('right');
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, isReducedMotion, movies.length, scroll]);

  const formatRuntime = (mins) => {
    if (!mins || isNaN(mins)) return '2h 00m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m < 10 ? '0' : ''}${m}m`;
  };

  return (
    <div
      className="now-showing-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Now Showing Movie Carousel"
    >
      <div className="now-showing-header">
        <h2 className="now-showing-title">NOW SHOWING</h2>
        <div className="carousel-nav-controls">
          <button
            className="carousel-arrow-btn"
            onClick={() => {
              setIsPaused(true);
              scroll('left');
            }}
            aria-label="Previous movies"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="carousel-arrow-btn"
            onClick={() => {
              setIsPaused(true);
              scroll('right');
            }}
            aria-label="Next movies"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="carousel-track-container" ref={scrollTrackRef}>
        <div className="carousel-track">
          {movies.map((movie) => {
            const imageSrc =
              movie.backdrop_url ||
              movie.poster_url ||
              'https://image.tmdb.org/t/p/w780/rAiYTsqJJR0KP8UN8vJjZHa820g.jpg';

            const ratingDisplay = movie.rating
              ? parseFloat(movie.rating).toFixed(1)
              : '8.2';

            return (
              <div
                key={movie.movie_id || movie.id}
                className="cinematic-movie-card"
                onClick={() => {
                  setIsPaused(true);
                  onSelectMovie(movie);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsPaused(true);
                    onSelectMovie(movie);
                  }
                }}
              >
                <div className="card-media-wrapper">
                  <img
                    src={imageSrc}
                    alt={movie.title || 'Movie'}
                    className="card-media-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://image.tmdb.org/t/p/w780/rAiYTsqJJR0KP8UN8vJjZHa820g.jpg';
                    }}
                  />
                  <div className="card-gradient-scrim" />
                </div>

                <div className="card-info-content">
                  <h3 className="card-movie-title">{movie.title}</h3>
                  <div className="card-meta-row">
                    <span className="card-genre-runtime">
                      {movie.genre || 'Action'} • {formatRuntime(movie.duration)}
                    </span>
                    <span className="card-rating-badge">
                      <Star size={13} fill="#fbbf24" color="#fbbf24" />
                      <span>{ratingDisplay}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
