const { query } = require('../config/db');

// Verified fallback upcoming releases with real TMDB official image assets
const CURATED_UPCOMING_MOVIES = [
  {
    id: 101,
    title: 'Avatar: Fire and Ash',
    genre: 'Sci-Fi / Adventure',
    language: 'English',
    release_date: '2025-12-19',
    poster_url: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/mDeUmU5t79eJdG52f6xL5H9J5p6.jpg',
    overview: 'Jake Sully and Neytiri encounter the Ash People, a volcanic clan of Na\'vi, exploring uncharted regions of Pandora.',
    status: 'Upcoming'
  },
  {
    id: 102,
    title: 'Superman',
    genre: 'Action / Sci-Fi',
    language: 'English',
    release_date: '2025-07-11',
    poster_url: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/k8Yw2f2e5B9F9u7b8C7a0e5f4c2.jpg',
    overview: 'Clark Kent balances his Kryptonian heritage with his human upbringing in Metropolis as the defender of truth and justice.',
    status: 'Upcoming'
  },
  {
    id: 103,
    title: 'War 2',
    genre: 'Action / Spy Thriller',
    language: 'Hindi / Telugu',
    release_date: '2025-08-14',
    poster_url: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0ye21lgdp.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    overview: 'Major Kabir Dhaliwal confronts a lethal operative in a globe-trotting mission with high-stakes espionage.',
    status: 'Upcoming'
  },
  {
    id: 104,
    title: 'F1: The Movie',
    genre: 'Sports / Drama',
    language: 'English',
    release_date: '2025-06-27',
    poster_url: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b22.jpg',
    overview: 'A veteran Formula 1 driver returns from retirement to mentor a promising prodigy on the APXGP team.',
    status: 'Upcoming'
  }
];

/**
 * Helper: Query database for upcoming / Coming Soon titles
 */
async function getDatabaseUpcomingMovies() {
  try {
    // Check if release_status column exists
    const cols = await query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'MOVIE' 
        AND COLUMN_NAME = 'release_status'
    `);

    let sql;
    if (cols.length > 0) {
      sql = `
        SELECT 
          m.movie_id AS id,
          m.title,
          m.genre,
          m.language,
          DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
          m.poster_url,
          m.backdrop_url,
          'Coming Soon' AS status
        FROM MOVIE m
        LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
        WHERE m.release_status = 'Coming Soon'
           OR (m.release_date IS NOT NULL AND m.release_date > CURRENT_DATE AND s.show_id IS NULL)
        GROUP BY m.movie_id
        ORDER BY m.release_date ASC, m.title ASC
      `;
    } else {
      // Unmigrated fallback: movies with zero scheduled showtimes
      sql = `
        SELECT 
          m.movie_id AS id,
          m.title,
          m.genre,
          m.language,
          NULL AS release_date,
          m.poster_url,
          m.backdrop_url,
          'Coming Soon' AS status
        FROM MOVIE m
        LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
        GROUP BY m.movie_id
        HAVING COUNT(s.show_id) = 0
        ORDER BY m.title ASC
      `;
    }
    return await query(sql);
  } catch (err) {
    console.warn('[Upcoming Movies] Failed to query database upcoming movies:', err.message);
    return [];
  }
}

/**
 * Proxy/Helper: Get upcoming releases (Database Coming Soon + Curated verified releases)
 */
async function getUpcomingReleases(req, res, next) {
  try {
    const dbUpcoming = await getDatabaseUpcomingMovies();
    const existingTitles = new Set(dbUpcoming.map(m => m.title.trim().toLowerCase()));

    // Filter curated list to remove duplicates
    const nonDuplicateCurated = CURATED_UPCOMING_MOVIES.filter(
      c => !existingTitles.has(c.title.trim().toLowerCase())
    );

    // Combined catalog with DB movies prioritized first
    const combined = [...dbUpcoming, ...nonDuplicateCurated];

    res.json({
      success: true,
      source: dbUpcoming.length > 0 ? 'HYBRID_DATABASE_CURATED' : 'CURATED_VERIFIED',
      dbCount: dbUpcoming.length,
      data: combined
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Proxy/Helper: Search TMDB for movie poster artwork
 */
async function searchTmdbArtwork(req, res, next) {
  try {
    const { query: searchQuery } = req.query;
    if (!searchQuery) {
      return res.status(400).json({ success: false, message: 'query parameter is required' });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        message: 'TMDB_API_KEY not configured in environment. Using database artwork.'
      });
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'TMDB search failed' });
    }

    const data = await response.json();
    const results = (data.results || []).slice(0, 5).map(m => ({
      tmdb_id: m.id,
      title: m.title,
      release_date: m.release_date,
      poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null
    }));

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUpcomingReleases,
  searchTmdbArtwork
};

