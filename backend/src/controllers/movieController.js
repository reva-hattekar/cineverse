const { query } = require('../config/db');

// Schema cache to detect whether 10_add_movie_release_management.sql has been applied
let lastCheckTime = 0;
let hasReleaseColumns = false;

async function checkMovieSchema() {
  const now = Date.now();
  // Check every 15 seconds if not yet confirmed migrated
  if (!hasReleaseColumns && now - lastCheckTime < 15000) {
    return hasReleaseColumns;
  }
  try {
    const cols = await query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'MOVIE' 
        AND COLUMN_NAME IN ('release_date', 'release_status')
    `);
    hasReleaseColumns = cols.length >= 2;
    lastCheckTime = now;
  } catch {
    hasReleaseColumns = false;
  }
  return hasReleaseColumns;
}

/**
 * Public: Get all movies with optional filters
 */
async function getAllMovies(req, res, next) {
  try {
    const { genre, language, search, status } = req.query;
    const isMigrated = await checkMovieSchema();

    let sql;
    if (isMigrated) {
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
          DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
          m.release_status,
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
          NULL AS release_date,
          IF(COUNT(s.show_id) > 0, 'Now Showing', 'Coming Soon') AS release_status,
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
        if (isMigrated) {
          sql += " HAVING m.release_status = 'Now Showing' OR scheduled_showtimes_count > 0";
        } else {
          sql += ' HAVING scheduled_showtimes_count > 0';
        }
      } else if (normalizedStatus === 'comingsoon') {
        if (isMigrated) {
          sql += " HAVING m.release_status = 'Coming Soon'";
        } else {
          sql += ' HAVING scheduled_showtimes_count = 0';
        }
      } else if (normalizedStatus === 'ended') {
        if (isMigrated) {
          sql += " HAVING m.release_status = 'Ended'";
        }
      }
    }

    sql += ' ORDER BY m.rating DESC, m.title ASC';
    const movies = await query(sql, params);

    // Compute clear boolean is_bookable for consumers
    const formattedMovies = movies.map(m => ({
      ...m,
      is_bookable: m.scheduled_showtimes_count > 0 && m.release_status !== 'Ended'
    }));

    res.json({
      success: true,
      count: formattedMovies.length,
      schemaMigrated: isMigrated,
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
    const isMigrated = await checkMovieSchema();

    let sql;
    if (isMigrated) {
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
          DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
          m.release_status,
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
          NULL AS release_date,
          IF(COUNT(s.show_id) > 0, 'Now Showing', 'Coming Soon') AS release_status,
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

    const movie = {
      ...movies[0],
      is_bookable: movies[0].scheduled_showtimes_count > 0 && movies[0].release_status !== 'Ended'
    };

    res.json({ success: true, schemaMigrated: isMigrated, data: movie });
  } catch (err) {
    next(err);
  }
}

/**
 * Public: Get showtimes for a specific movie with Theater & Screen info
 * Supports optional date and city filtering, includes screen types & formatting
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
 * Supports release_status and release_date gracefully whether schema is migrated or not
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
      release_status
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

    // Validate release_status
    const validStatuses = ['Now Showing', 'Coming Soon', 'Ended'];
    let safeStatus = release_status || 'Now Showing';
    if (release_status && !validStatuses.includes(release_status)) {
      safeStatus = 'Now Showing';
    }

    const isMigrated = await checkMovieSchema();

    let result;
    if (isMigrated) {
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

    res.status(201).json({
      success: true,
      message: isMigrated
        ? 'Movie created successfully with release status.'
        : 'Movie created successfully. (Notice: Apply database/10_add_movie_release_management.sql to store custom release dates & statuses in the database).',
      movieId: result.insertId,
      schemaMigrated: isMigrated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update movie details
 * Supports release_status and release_date gracefully whether schema is migrated or not
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
      release_status
    } = req.body;

    const existing = await query('SELECT * FROM MOVIE WHERE movie_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const validStatuses = ['Now Showing', 'Coming Soon', 'Ended'];
    const safeStatus = release_status && validStatuses.includes(release_status)
      ? release_status
      : null;

    const isMigrated = await checkMovieSchema();

    if (isMigrated) {
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

    res.json({
      success: true,
      message: 'Movie updated successfully.',
      schemaMigrated: isMigrated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Delete a movie (checks for foreign key constraints)
 */
async function adminDeleteMovie(req, res, next) {
  try {
    const { id } = req.params;

    // Check if any showtimes reference this movie, including screen and booking details
    const showtimes = await query(`
      SELECT s.show_id, s.show_date, s.start_time, t.theater_name, sc.screen_number,
             (SELECT COUNT(*) FROM BOOKING b WHERE b.show_id = s.show_id) AS booking_count
      FROM SHOWTIME s
      JOIN SCREEN sc ON s.screen_id = sc.screen_id
      JOIN THEATER t ON sc.theater_id = t.theater_id
      WHERE s.movie_id = ?
      ORDER BY s.show_date DESC, s.start_time ASC
    `, [id]);

    if (showtimes.length > 0) {
      const totalBookings = showtimes.reduce((sum, s) => sum + (parseInt(s.booking_count, 10) || 0), 0);
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Cannot delete movie (ID #${id}). It is actively linked to ${showtimes.length} scheduled showtime(s) across theaters with ${totalBookings} customer booking(s). Foreign key constraint fk_showtime_movie protects historical records.`,
        dependentShowtimes: showtimes,
        totalBookings,
        showtimesCount: showtimes.length
      });
    }

    const result = await query('DELETE FROM MOVIE WHERE movie_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    res.json({ success: true, message: 'Movie deleted successfully.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Cannot delete movie. Database foreign key integrity constraint violation: related records exist in other tables.`,
        error: err.message
      });
    }
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
