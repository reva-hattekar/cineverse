/**
 * CINEVERSE Hero Experiences Configuration
 * 
 * Defines the 4 hero slide experiences controlled by the 01, 02, 03, 04 indicators:
 * - Slide 01: The bespoke 3D liquid chrome / obsidian sculpture brand experience.
 * - Slide 02, 03, 04: Configurable featured movie trailers.
 * 
 * ===================================================================================
 * TO INSERT YOUR VIDEO TRAILERS:
 * Simply add your direct MP4 / WebM URL to the `videoUrl` field for slides 02, 03, or 04.
 * Example:
 *   videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
 * 
 * If you leave `videoUrl` empty (""), the system automatically falls back to the movie's
 * high-resolution cinematic backdrop image from the database without any broken player.
 * ===================================================================================
 */

export const HERO_EXPERIENCES = [
  {
    id: 1,
    type: '3d-brand',
    title: 'CINEVERSE',
    eyebrow: 'A UNIVERSE OF STORIES AWAITS',
    tagline: 'MOVIES • EXPERIENCES • BEYOND REALITY',
    description: 'Immerse yourself in state-of-the-art cinema technology, IMAX 70mm, and artisanal auditoriums.'
  },
  {
    id: 2,
    type: 'trailer',
    movieId: 4, // Oppenheimer
    fallbackTitle: 'Oppenheimer',
    eyebrow: 'NOW SCREENING IN 70MM IMAX',
    tagline: 'DRAMA • HISTORY • 3H 00M',
    description: 'The story of J. Robert Oppenheimer and the Manhattan Project that reshaped civilization forever.',
    // Insert your direct video URL here (MP4 / WebM)
    videoUrl: '',
    // Optional embedded player URL (if using external embed)
    embedUrl: '',
    posterFallback: 'https://image.tmdb.org/t/p/original/fm6K9vYI7vmvup4Q9Z69gtv20ec.jpg'
  },
  {
    id: 3,
    type: 'trailer',
    movieId: 1, // Interstellar
    fallbackTitle: 'Interstellar',
    eyebrow: 'EXPERIENCE THE ACADEMY AWARD WINNER',
    tagline: 'SCI-FI • ADVENTURE • 2H 49M',
    description: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanity’s survival.',
    // Insert your direct video URL here (MP4 / WebM)
    videoUrl: '',
    // Optional embedded player URL (if using external embed)
    embedUrl: '',
    posterFallback: 'https://image.tmdb.org/t/p/original/rAiYTsqJJR0KP8UN8vJjZHa820g.jpg'
  },
  {
    id: 4,
    type: 'trailer',
    movieId: 3, // The Dark Knight
    fallbackTitle: 'The Dark Knight',
    eyebrow: 'CHRISTOPHER NOLAN MASTERPIECE',
    tagline: 'ACTION • CRIME • 2H 32M',
    description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest tests.',
    // Insert your direct video URL here (MP4 / WebM)
    videoUrl: '',
    // Optional embedded player URL (if using external embed)
    embedUrl: '',
    posterFallback: 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg'
  }
];
