const { query } = require('../config/db');

/**
 * Public: Get all movies with optional filters
 */
async function getAllMovies(req, res, next) {
  try {
    const { genre, language, search } = req.query;
    let sql = `
      SELECT 
        m.movie_id,
        m.title,
        m.genre,
        m.duration,
        m.language,
        m.rating,
        m.poster_url,
        m.backdrop_url,
        COUNT(s.show_id) AS scheduled_showtimes_count
      FROM MOVIE m
      LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
      WHERE 1=1
    `;
    const params = [];

    if (genre) {
      sql += ' AND m.genre = ?';
      params.push(genre);
    }
    if (language) {
      sql += ' AND m.language = ?';
      params.push(language);
    }
    if (search) {
      sql += ' AND (m.title LIKE ? OR m.genre LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY m.movie_id ORDER BY m.rating DESC, m.title ASC';
    const movies = await query(sql, params);

    res.json({ success: true, count: movies.length, data: movies });
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
    const movies = await query('SELECT * FROM MOVIE WHERE movie_id = ?', [id]);

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    res.json({ success: true, data: movies[0] });
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
    const sql = `
      SELECT 
        s.show_id,
        s.show_date,
        s.start_time,
        s.end_time,
        s.base_price,
        s.screen_id,
        sc.screen_number,
        sc.capacity,
        t.theater_id,
        t.theater_name,
        t.city
      FROM SHOWTIME s
      JOIN SCREEN sc ON s.screen_id = sc.screen_id
      JOIN THEATER t ON sc.theater_id = t.theater_id
      WHERE s.movie_id = ?
      ORDER BY s.show_date ASC, s.start_time ASC
    `;
    const showtimes = await query(sql, [id]);

    res.json({ success: true, count: showtimes.length, data: showtimes });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Add a new movie
 */
async function adminCreateMovie(req, res, next) {
  try {
    const { title, genre, duration, language, rating, poster_url, backdrop_url } = req.body;

    if (!title || !genre || !duration || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required movie fields: title, genre, duration, and language are mandatory.'
      });
    }

    const durationNum = parseInt(duration, 10);
    const ratingNum = rating ? parseFloat(rating) : 8.0;

    if (durationNum <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be positive.' });
    }
    if (ratingNum < 0 || ratingNum > 10) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0.0 and 10.0.' });
    }

    const sql = 'INSERT INTO MOVIE (title, genre, duration, language, rating, poster_url, backdrop_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const result = await query(sql, [title, genre, durationNum, language, ratingNum, poster_url || null, backdrop_url || null]);

    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      movieId: result.insertId
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update movie details
 */
async function adminUpdateMovie(req, res, next) {
  try {
    const { id } = req.params;
    const { title, genre, duration, language, rating, poster_url, backdrop_url } = req.body;

    const existing = await query('SELECT * FROM MOVIE WHERE movie_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

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

    res.json({ success: true, message: 'Movie updated successfully.' });
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

