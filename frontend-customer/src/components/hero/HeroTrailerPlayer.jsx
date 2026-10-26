import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Ticket, Film } from 'lucide-react';

/**
 * HeroTrailerPlayer
 * Handles video trailer playback for slides 02, 03, and 04.
 * - Respects browser autoplay policy (muted autoplay)
 * - Mute/Unmute & Play/Pause controls
 * - Graceful poster fallback if no direct videoUrl is configured yet
 * - Full end-state when video completes (dimmed frame, prominent Book Tickets CTA, Watch Again button)
 * - Cleans up HTML5 video element on slide switch or unmount
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

  const posterImage =
    movie?.backdrop_url ||
    experience.posterFallback ||
    movie?.poster_url ||
    'https://image.tmdb.org/t/p/original/fm6K9vYI7vmvup4Q9Z69gtv20ec.jpg';

  const hasVideoSource = Boolean(experience.videoUrl && experience.videoUrl.trim() !== '');

  // Reset states whenever active experience changes
  useEffect(() => {
    setHasEnded(false);
    setVideoError(false);
    setIsPlaying(true);

    const videoEl = videoRef.current;
    if (videoEl && hasVideoSource) {
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay policy prevented playback, keep paused
          console.warn('Autoplay prevented or video interrupted:', err);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      if (videoEl) {
        videoEl.pause();
      }
    };
  }, [experience.id, hasVideoSource, isActive]);

  // Handle Play/Pause
  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (isPlaying) {
      videoEl.pause();
      setIsPlaying(false);
    } else {
      videoEl.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Handle Mute/Unmute
  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle Replay Trailer after ended
  const handleReplay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    setHasEnded(false);
    videoEl.currentTime = 0;
    videoEl.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  return (
    <div className={`hero-trailer-layer ${hasEnded ? 'video-ended-state' : ''}`}>
      {/* Background Media: Video or Backdrop Poster Fallback */}
      {hasVideoSource && !videoError ? (
        <video
          ref={videoRef}
          src={experience.videoUrl}
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
      ) : (
        <div
          className="hero-media-poster"
          style={{ backgroundImage: `url('${posterImage}')` }}
        />
      )}

      {/* Atmospheric Scrim Gradient for Readability */}
      <div className="hero-media-scrim" />

      {/* Floating Video Controls Pill (Only shown if video source is active & not ended) */}
      {hasVideoSource && !videoError && !hasEnded && (
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
        </div>
      )}

      {/* End-State Overlay (When video finishes) */}
      {hasEnded && (
        <div className="trailer-end-overlay">
          <div className="trailer-end-card">
            <span className="trailer-end-badge">
              <Film size={13} /> TRAILER COMPLETED
            </span>
            <h3 className="trailer-end-title">
              {movie?.title || experience.fallbackTitle}
            </h3>
            <p className="trailer-end-desc">
              Experience the theatrical phenomenon on the giant screen. Reserve your seats today.
            </p>
            <div className="trailer-end-actions">
              {movie && (
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
