/**
 * CINEVERSE - Trailer URL Validation & Normalization Utility (Customer)
 * Supports standard YouTube watch URLs, youtu.be short links, and embed URLs.
 */

export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function isValidTrailerUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return Boolean(extractYouTubeVideoId(url) || url.trim().match(/\.(mp4|webm)($|\?)/i));
}

export function normalizeTrailerUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const videoId = extractYouTubeVideoId(trimmed);
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  return trimmed;
}

export function getYouTubeEmbedUrl(url, { autoplay = 1, mute = 1, controls = 0, loop = 1 } = {}) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${mute}&controls=${controls}&loop=${loop}&playlist=${videoId}&enablejsapi=1`;
}

