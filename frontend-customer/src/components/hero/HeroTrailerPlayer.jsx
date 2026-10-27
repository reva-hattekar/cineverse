import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Ticket, Film, ExternalLink } from 'lucide-react';
import { extractYouTubeVideoId, getYouTubeEmbedUrl, isValidTrailerUrl } from '../../utils/trailerUtils';

/**
 * HeroTrailerPlayer
 * Handles dynamic video trailer playback for the featured hero slots:
 * - Supports YouTube watch URLs, short links, and embed URLs (iframe embed)
 * - Supports direct MP4 / WebM video files (HTML5 video)
 * - Respects browser autoplay policies (starts muted, background playback)
 * - Mute/Unmute & Play/Pause controls
 * - Graceful high-resolution poster backdrop fallback if no trailer is attached
 * - End-state and booking actions
 */
export default function HeroTrailerPlayer({
  experience,
  movie,
  onSelectMovie,
  isActive
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const trailerUrl = movie?.trailer_url || experience?.trailerUrl || experience?.videoUrl || '';
  const youtubeId = extractYouTubeVideoId(trailerUrl);
  const isDirectVideo = Boolean(trailerUrl && trailerUrl.match(/\.(mp4|webm)($|\?)/i));
  const hasTrailer = Boolean(youtubeId || isDirectVideo);

  const posterImage =
    movie?.backdrop_url ||
    experience?.posterFallback ||
    movie?.poster_url ||
    'https://image.tmdb.org/t/p/original/fm6K9vYI7vmvup4Q9Z69gtv20ec.jpg';

  // Reset playback states on slide switch
  useEffect(() => {
    setHasEnded(false);
    setVideoError(false);
    setIsPlaying(true);

    const videoEl = videoRef.current;
    if (videoEl && isDirectVideo) {
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented:', err);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      if (videoEl) {
        videoEl.pause();
      }
    };
  }, [experience?.id, movie?.movie_id, isDirectVideo, isActive]);

  const togglePlay = () => {
    if (isDirectVideo) {
      const videoEl = videoRef.current;
      if (!videoEl) return;
      if (isPlaying) {
        videoEl.pause();
        setIsPlaying(false);
      } else {
        videoEl.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleReplay = () => {
    setHasEnded(false);
    setIsPlaying(true);
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
    }
  };

  return (
    <div className={`hero-trailer-layer ${hasEnded ? 'video-ended-state' : ''}`}>
      {/* Background Media: YouTube Iframe, Direct Video, or High-Res Poster Fallback */}
      {hasTrailer && !videoError ? (
        youtubeId ? (
          <div className="hero-media-youtube-wrap" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${youtubeId}&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              title={`Trailer for ${movie?.title || experience?.fallbackTitle}`}
              style={{
                width: '100vw',
                height: '56.25vw', // 16:9 ratio
                minHeight: '100%',
                minWidth: '177.77vh',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: 'none',
                opacity: isPlaying ? 0.85 : 0.4,
                transition: 'opacity 0.5s ease',
                pointerEvents: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={trailerUrl}
            className="hero-media-video"
            playsInline
            autoPlay
            muted={isMuted}
            poster={posterImage}
            onEnded={() => {
              setHasEnded(true);
              setIsPlaying(false);
            }}
            onError={() => {
              setVideoError(true);
            }}
          />
        )
      ) : (
        <div
          className="hero-media-poster"
          style={{ backgroundImage: `url('${posterImage}')` }}
        />
      )}

      {/* Atmospheric Scrim Gradient for Readability */}
      <div className="hero-media-scrim" />

      {/* Floating Video Controls Pill (Only shown if trailer is active) */}
      {hasTrailer && !videoError && !hasEnded && (
        <div className="trailer-playback-controls">
          <button
            className="trailer-ctrl-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause Trailer' : 'Play Trailer'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          </button>
          <button
            className="trailer-ctrl-btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          {trailerUrl && (
            <a
              href={trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="trailer-ctrl-btn"
              title="Open full trailer on YouTube"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}

      {/* End-State Overlay (When video completes) */}
      {hasEnded && (
        <div className="trailer-end-overlay">
          <div className="trailer-end-card">
            <span className="trailer-end-badge">
              <Film size={13} /> TRAILER COMPLETED
            </span>
            <h3 className="trailer-end-title">
              {movie?.title || experience?.fallbackTitle}
            </h3>
            <p className="trailer-end-desc">
              Experience the theatrical phenomenon on the giant screen. Reserve your seats today.
            </p>
            <div className="trailer-end-actions">
              {movie && movie.scheduled_showtimes_count > 0 && (
                <button
                  className="hero-primary-btn"
                  onClick={() => onSelectMovie(movie)}
                >
                  <Ticket size={15} />
                  <span>BOOK TICKETS NOW</span>
                </button>
              )}
              <button className="hero-secondary-btn" onClick={handleReplay}>
                <RotateCcw size={14} />
                <span>WATCH TRAILER AGAIN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
