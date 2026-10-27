const { query } = require('../config/db');
const { normalizeTrailerUrl, getYouTubeEmbedUrl, isValidTrailerUrl } = require('../utils/trailerUtils');
const { loadFallbackSettings, saveFallbackSettings } = require('./heroController');

/**
 * Helper to check which columns exist on MOVIE table
 */
async function checkMovieSchema() {
  try {
    const cols = await query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'MOVIE' 
        AND COLUMN_NAME IN ('release_date', 'release_status', 'trailer_url')
    `);
    const found = cols.map(c => c.COLUMN_NAME);
    return {
      release_date: found.includes('release_date'),
      release_status: found.includes('release_status'),
      trailer_url: found.includes('trailer_url'),
      isMigrated: found.includes('release_date') && found.includes('release_status')
    };
  } catch (err) {
    return { release_date: false, release_status: false, trailer_url: false, isMigrated: false };
  }
}

/**
 * Public: Get all movies with optional filters
 */
async function getAllMovies(req, res, next) {
  try {
    const { genre, language, search, status } = req.query;
    const schema = await checkMovieSchema();

    let sql;
    if (schema.isMigrated && schema.trailer_url) {
      sql = `
        SELECT 
          m.movie_id,
          m.title,
          m.genre,
          m.duration,
          m.language,
          m.rating,
          m.poster_url,
          m.backdrop_url,
          m.trailer_url,
          DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
          CASE
            WHEN COUNT(s.show_id) > 0 THEN 'Now Showing'
            WHEN m.release_date IS NOT NULL AND m.release_date < CURRENT_DATE() THEN 'Ended'
            WHEN m.release_date IS NOT NULL AND m.release_date > CURRENT_DATE() THEN 'Coming Soon'
            ELSE 'Unscheduled'
          END AS release_status,
          COUNT(s.show_id) AS scheduled_showtimes_count
        FROM MOVIE m
        LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
        WHERE 1=1
      `;
    } else if (schema.isMigrated) {
      sql = `
        SELECT 
          m.movie_id,
          m.title,
          m.genre,
          m.duration,
          m.language,
          m.rating,
          m.poster_url,
          m.backdrop_url,
          NULL AS trailer_url,
          DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
          CASE
            WHEN COUNT(s.show_id) > 0 THEN 'Now Showing'
            WHEN m.release_date IS NOT NULL AND m.release_date < CURRENT_DATE() THEN 'Ended'
            WHEN m.release_date IS NOT NULL AND m.release_date > CURRENT_DATE() THEN 'Coming Soon'
            ELSE 'Unscheduled'
          END AS release_status,
          COUNT(s.show_id) AS scheduled_showtimes_count
        FROM MOVIE m
        LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
        WHERE 1=1
      `;
    } else {
      sql = `
        SELECT 
          m.movie_id,
          m.title,
          m.genre,
          m.duration,
          m.language,
          m.rating,
          m.poster_url,
          m.backdrop_url,
          NULL AS trailer_url,
          NULL AS release_date,
          IF(COUNT(s.show_id) > 0, 'Now Showing', 'Unscheduled') AS release_status,
          COUNT(s.show_id) AS scheduled_showtimes_count
        FROM MOVIE m
        LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
        WHERE 1=1
      `;
    }

    const params = [];

    if (genre && genre !== 'All') {
      sql += ' AND m.genre = ?';
      params.push(genre);
    }
    if (language) {
      sql += ' AND m.language = ?';
      params.push(language);
    }
    if (search) {
      sql += ' AND (m.title LIKE ? OR m.genre LIKE ? OR m.language LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY m.movie_id';

    // Optional status filter
    if (status) {
      const normalizedStatus = status.toLowerCase().replace(/[-_ ]/g, '');
      if (normalizedStatus === 'nowshowing') {
        sql += ' HAVING scheduled_showtimes_count > 0';
      } else if (normalizedStatus === 'comingsoon') {
        if (schema.isMigrated) {
          sql += " HAVING scheduled_showtimes_count = 0 AND release_status = 'Coming Soon'";
        } else {
          // Rule: When unmigrated, movies with NULL release dates do NOT qualify as Coming Soon
          sql += " HAVING 1=0";
        }
      } else if (normalizedStatus === 'ended') {
        if (schema.isMigrated) {
          sql += " HAVING scheduled_showtimes_count = 0 AND release_status = 'Ended'";
        } else {
          sql += " HAVING 1=0";
        }
      }
    }

    sql += ' ORDER BY m.rating DESC, m.title ASC';
    const movies = await query(sql, params);
    const fallback = loadFallbackSettings();

    // Compute clear metadata and trailer links
    const formattedMovies = movies.map(m => {
      const fallbackTrailer = fallback.movie_trailers[m.movie_id];
      const finalTrailer = schema.trailer_url
        ? normalizeTrailerUrl(m.trailer_url)
        : (fallbackTrailer !== undefined ? normalizeTrailerUrl(fallbackTrailer) : null);
      const fallbackDate = fallback.movie_release_dates[m.movie_id];
      const finalDate = m.release_date || (schema.isMigrated ? null : fallbackDate) || null;

      return {
        ...m,
        release_date: finalDate,
        trailer_url: finalTrailer,
        embed_url: finalTrailer ? getYouTubeEmbedUrl(finalTrailer) : null,
        has_trailer: Boolean(finalTrailer && isValidTrailerUrl(finalTrailer)),
        is_bookable: m.scheduled_showtimes_count > 0 && m.release_status === 'Now Showing'
      };
    });

    res.json({
      success: true,
      count: formattedMovies.length,
      schemaMigrated: schema.isMigrated,
      data: formattedMovies
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public: Get movie details by ID
 */
async function getMovieById(req, res, next) {
  try {
    const { id } = req.params;
    const schema = await checkMovieSchema();

    let sql;
    if (schema.isMigrated && schema.trailer_url) {
      sql = `
        SELECT 
          m.movie_id,
          m.title,
          m.genre,
          m.duration,
          m.language,
          m.rating,
          m.poster_url,
          m.backdrop_url,
          m.trailer_url,
          DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
          CASE
            WHEN COUNT(s.show_id) > 0 THEN 'Now Showing'
            WHEN m.release_date IS NOT NULL AND m.release_date < CURRENT_DATE() THEN 'Ended'
            WHEN m.release_date IS NOT NULL AND m.release_date > CURRENT_DATE() THEN 'Coming Soon'
            ELSE 'Unscheduled'
          END AS release_status,
          COUNT(s.show_id) AS scheduled_showtimes_count
        FROM MOVIE m
        LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
        WHERE m.movie_id = ?
        GROUP BY m.movie_id
      `;
    } else if (schema.isMigrated) {
      sql = `
        SELECT 
          m.movie_id,
          m.title,
          m.genre,
          m.duration,
          m.language,
          m.rating,
          m.poster_url,
          m.backdrop_url,
          NULL AS trailer_url,
          DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
          CASE
            WHEN COUNT(s.show_id) > 0 THEN 'Now Showing'
            WHEN m.release_date IS NOT NULL AND m.release_date < CURRENT_DATE() THEN 'Ended'
            WHEN m.release_date IS NOT NULL AND m.release_date > CURRENT_DATE() THEN 'Coming Soon'
            ELSE 'Unscheduled'
          END AS release_status,
          COUNT(s.show_id) AS scheduled_showtimes_count
        FROM MOVIE m
        LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
        WHERE m.movie_id = ?
        GROUP BY m.movie_id
      `;
    } else {
      sql = `
        SELECT 
          m.movie_id,
          m.title,
          m.genre,
          m.duration,
          m.language,
          m.rating,
          m.poster_url,
          m.backdrop_url,
          NULL AS trailer_url,
          NULL AS release_date,
          IF(COUNT(s.show_id) > 0, 'Now Showing', 'Unscheduled') AS release_status,
          COUNT(s.show_id) AS scheduled_showtimes_count
        FROM MOVIE m
        LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
        WHERE m.movie_id = ?
        GROUP BY m.movie_id
      `;
    }

    const movies = await query(sql, [id]);

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const fallback = loadFallbackSettings();
    const raw = movies[0];
    const fallbackTrailer = fallback.movie_trailers[raw.movie_id];
    const finalTrailer = schema.trailer_url
      ? normalizeTrailerUrl(raw.trailer_url)
      : (fallbackTrailer !== undefined ? normalizeTrailerUrl(fallbackTrailer) : null);
    const fallbackDate = fallback.movie_release_dates[raw.movie_id];
    const finalDate = raw.release_date || (schema.isMigrated ? null : fallbackDate) || null;

    const movie = {
      ...raw,
      release_date: finalDate,
      trailer_url: finalTrailer,
      embed_url: finalTrailer ? getYouTubeEmbedUrl(finalTrailer) : null,
      has_trailer: Boolean(finalTrailer && isValidTrailerUrl(finalTrailer)),
      is_bookable: raw.scheduled_showtimes_count > 0 && raw.release_status === 'Now Showing'
    };

    res.json({ success: true, schemaMigrated: schema.isMigrated, data: movie });
  } catch (err) {
    next(err);
  }
}

/**
 * Public: Get showtimes for a specific movie with Theater & Screen info
 */
async function getMovieShowtimes(req, res, next) {
  try {
    const { id } = req.params;
    const { date, city } = req.query;

    let sql = `
      SELECT 
        s.show_id,
        DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
        s.start_time,
        s.end_time,
        s.base_price,
        s.screen_id,
        sc.screen_number,
        sc.screen_name,
        sc.screen_type,
        sc.capacity,
        t.theater_id,
        t.theater_name,
        t.city,
        t.address
      FROM SHOWTIME s
      JOIN SCREEN sc ON s.screen_id = sc.screen_id
      JOIN THEATER t ON sc.theater_id = t.theater_id
      WHERE s.movie_id = ?
    `;
    const params = [id];

    if (date) {
      sql += ' AND s.show_date = ?';
      params.push(date);
    }
    if (city) {
      sql += ' AND LOWER(t.city) = LOWER(?)';
      params.push(city);
    }

    sql += ' ORDER BY s.show_date ASC, t.theater_name ASC, sc.screen_number ASC, s.start_time ASC';
    const showtimes = await query(sql, params);

    res.json({ success: true, count: showtimes.length, data: showtimes });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Add a new movie
 * Supports trailer_url, release_status and release_date gracefully
 */
async function adminCreateMovie(req, res, next) {
  try {
    const {
      title,
      genre,
      duration,
      language,
      rating,
      poster_url,
      backdrop_url,
      release_date,
      release_status,
      trailer_url
    } = req.body;

    if (!title || !genre || !duration || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required movie fields: title, genre, duration, and language are mandatory.'
      });
    }

    const durationNum = parseInt(duration, 10);
    const ratingNum = rating ? parseFloat(rating) : 8.0;

    if (durationNum <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be a positive integer.' });
    }
    if (ratingNum < 0 || ratingNum > 10) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0.0 and 10.0.' });
    }

    const validStatuses = ['Now Showing', 'Coming Soon', 'Ended'];
    let safeStatus = release_status || 'Now Showing';
    if (release_status && !validStatuses.includes(release_status)) {
      safeStatus = 'Now Showing';
    }

    if (trailer_url && typeof trailer_url === 'string' && trailer_url.trim()) {
      if (!isValidTrailerUrl(trailer_url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid trailer URL. Supported formats: YouTube watch links (youtube.com/watch?v=...), short links (youtu.be/...), or embed links (youtube.com/embed/...).'
        });
      }
    }

    const safeTrailer = trailer_url ? normalizeTrailerUrl(trailer_url) : null;
    const schema = await checkMovieSchema();

    let result;
    if (schema.isMigrated && schema.trailer_url) {
      const sql = `
        INSERT INTO MOVIE (
          title, genre, duration, language, rating, 
          poster_url, backdrop_url, release_date, release_status, trailer_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      result = await query(sql, [
        title,
        genre,
        durationNum,
        language,
        ratingNum,
        poster_url || null,
        backdrop_url || null,
        release_date || null,
        safeStatus,
        safeTrailer
      ]);
    } else if (schema.isMigrated) {
      const sql = `
        INSERT INTO MOVIE (
          title, genre, duration, language, rating, 
          poster_url, backdrop_url, release_date, release_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      result = await query(sql, [
        title,
        genre,
        durationNum,
        language,
        ratingNum,
        poster_url || null,
        backdrop_url || null,
        release_date || null,
        safeStatus
      ]);
    } else {
      const sql = `
        INSERT INTO MOVIE (
          title, genre, duration, language, rating, 
          poster_url, backdrop_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      result = await query(sql, [
        title,
        genre,
        durationNum,
        language,
        ratingNum,
        poster_url || null,
        backdrop_url || null
      ]);
    }

    const newId = result.insertId;

    // Save fallback settings for unmigrated fields
    if (!schema.trailer_url && safeTrailer) {
      const fallback = loadFallbackSettings();
      fallback.movie_trailers[newId] = safeTrailer;
      saveFallbackSettings(fallback);
    }
    if (!schema.release_date && release_date) {
      const fallback = loadFallbackSettings();
      fallback.movie_release_dates[newId] = release_date;
      saveFallbackSettings(fallback);
    }

    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      movieId: newId,
      schemaMigrated: schema.isMigrated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update movie details
 * Supports trailer_url, release_status and release_date gracefully
 */
async function adminUpdateMovie(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      genre,
      duration,
      language,
      rating,
      poster_url,
      backdrop_url,
      release_date,
      release_status,
      trailer_url
    } = req.body;

    const existing = await query('SELECT * FROM MOVIE WHERE movie_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const validStatuses = ['Now Showing', 'Coming Soon', 'Ended'];
    const safeStatus = release_status && validStatuses.includes(release_status)
      ? release_status
      : null;

    if (trailer_url && typeof trailer_url === 'string' && trailer_url.trim()) {
      if (!isValidTrailerUrl(trailer_url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid trailer URL. Supported formats: YouTube watch links (youtube.com/watch?v=...), short links (youtu.be/...), or embed links (youtube.com/embed/...).'
        });
      }
    }

    const hasTrailerUpdate = trailer_url !== undefined;
    const safeTrailer = hasTrailerUpdate && trailer_url && trailer_url.trim() ? normalizeTrailerUrl(trailer_url) : null;
    const schema = await checkMovieSchema();

    if (schema.isMigrated && schema.trailer_url) {
      const sql = `
        UPDATE MOVIE 
        SET title = COALESCE(?, title),
            genre = COALESCE(?, genre),
            duration = COALESCE(?, duration),
            language = COALESCE(?, language),
            rating = COALESCE(?, rating),
            poster_url = COALESCE(?, poster_url),
            backdrop_url = COALESCE(?, backdrop_url),
            release_date = COALESCE(?, release_date),
            release_status = COALESCE(?, release_status),
            trailer_url = CASE WHEN ? = 1 THEN ? ELSE trailer_url END
        WHERE movie_id = ?
      `;
      await query(sql, [
        title || null,
        genre || null,
        duration ? parseInt(duration, 10) : null,
        language || null,
        rating ? parseFloat(rating) : null,
        poster_url || null,
        backdrop_url || null,
        release_date || null,
        safeStatus,
        hasTrailerUpdate ? 1 : 0,
        safeTrailer || null,
        id
      ]);
    } else if (schema.isMigrated) {
      const sql = `
        UPDATE MOVIE 
        SET title = COALESCE(?, title),
            genre = COALESCE(?, genre),
            duration = COALESCE(?, duration),
            language = COALESCE(?, language),
            rating = COALESCE(?, rating),
            poster_url = COALESCE(?, poster_url),
            backdrop_url = COALESCE(?, backdrop_url),
            release_date = COALESCE(?, release_date),
            release_status = COALESCE(?, release_status)
        WHERE movie_id = ?
      `;
      await query(sql, [
        title || null,
        genre || null,
        duration ? parseInt(duration, 10) : null,
        language || null,
        rating ? parseFloat(rating) : null,
        poster_url || null,
        backdrop_url || null,
        release_date || null,
        safeStatus,
        id
      ]);
    } else {
      const sql = `
        UPDATE MOVIE 
        SET title = COALESCE(?, title),
            genre = COALESCE(?, genre),
            duration = COALESCE(?, duration),
            language = COALESCE(?, language),
            rating = COALESCE(?, rating),
            poster_url = COALESCE(?, poster_url),
            backdrop_url = COALESCE(?, backdrop_url)
        WHERE movie_id = ?
      `;
      await query(sql, [
        title || null,
        genre || null,
        duration ? parseInt(duration, 10) : null,
        language || null,
        rating ? parseFloat(rating) : null,
        poster_url || null,
        backdrop_url || null,
        id
      ]);
    }

    // Persist trailer_url and release_date in fallback store if schema unmigrated
    const fallback = loadFallbackSettings();
    if (!schema.trailer_url && hasTrailerUpdate) {
      fallback.movie_trailers[id] = safeTrailer || null;
    }
    if (!schema.release_date && release_date !== undefined) {
      fallback.movie_release_dates[id] = release_date || null;
    }
    saveFallbackSettings(fallback);

    // Fetch and return the updated movie data
    let updatedMovie = null;
    const selectCols = schema.trailer_url ? '*, DATE_FORMAT(release_date, "%Y-%m-%d") AS release_date' : '*';
    const rows = await query(`SELECT ${selectCols} FROM MOVIE WHERE movie_id = ?`, [id]);
    if (rows.length > 0) {
      const raw = rows[0];
      const fallbackTrailer = fallback.movie_trailers[id];
      const fallbackDate = fallback.movie_release_dates[id];
      const finalTrailer = schema.trailer_url
        ? normalizeTrailerUrl(raw.trailer_url)
        : (fallbackTrailer !== undefined ? normalizeTrailerUrl(fallbackTrailer) : null);
      const finalDate = raw.release_date || (!schema.release_date ? fallbackDate : null) || null;
      updatedMovie = {
        ...raw,
        release_date: finalDate,
        trailer_url: finalTrailer,
        embed_url: finalTrailer ? getYouTubeEmbedUrl(finalTrailer) : null,
        has_trailer: Boolean(finalTrailer && isValidTrailerUrl(finalTrailer))
      };
    }

    res.json({
      success: true,
      message: 'Movie updated successfully.',
      data: updatedMovie,
      movie: updatedMovie,
      schemaMigrated: schema.isMigrated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Delete a movie with diagnostics
 */
async function adminDeleteMovie(req, res, next) {
  try {
    const { id } = req.params;

    const movie = await query('SELECT * FROM MOVIE WHERE movie_id = ?', [id]);
    if (movie.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const showtimes = await query('SELECT show_id FROM SHOWTIME WHERE movie_id = ?', [id]);
    if (showtimes.length > 0) {
      const showIds = showtimes.map(s => s.show_id);
      const bookings = await query(
        `SELECT COUNT(DISTINCT b.booking_id) AS total_bookings 
         FROM BOOKING b 
         WHERE b.show_id IN (${showIds.map(() => '?').join(',')})`,
        showIds
      );

      return res.status(409).json({
        success: false,
        message: `Cannot delete "${movie[0].title}". It is assigned to ${showtimes.length} showtime(s) with ${bookings[0].total_bookings} booking(s).`,
        conflict: {
          showtimesCount: showtimes.length,
          bookingsCount: bookings[0].total_bookings
        }
      });
    }

    await query('DELETE FROM MOVIE WHERE movie_id = ?', [id]);

    // Clean up fallback settings
    const fallback = loadFallbackSettings();
    delete fallback.movie_trailers[id];
    delete fallback.movie_release_dates[id];
    saveFallbackSettings(fallback);

    res.json({
      success: true,
      message: `Movie "${movie[0].title}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllMovies,
  getMovieById,
  getMovieShowtimes,
  adminCreateMovie,
  adminUpdateMovie,
  adminDeleteMovie
};
