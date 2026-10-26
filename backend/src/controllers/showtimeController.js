const { query } = require('../config/db');

/**
 * Public: Get seat layout and live availability for a specific showtime.
 * Determines booked vs available status based on active non-cancelled bookings.
 */
async function getShowtimeSeats(req, res, next) {
  try {
    const { id } = req.params;

    // 1. Fetch showtime details
    const showtimeRows = await query(`
      SELECT 
        s.show_id,
        s.show_date,
        s.start_time,
        s.end_time,
        s.base_price,
        s.movie_id,
        s.screen_id,
        m.title AS movie_title,
        m.genre,
        m.rating,
        sc.screen_number,
        sc.capacity,
        t.theater_id,
        t.theater_name,
        t.city
      FROM SHOWTIME s
      JOIN MOVIE m ON s.movie_id = m.movie_id
      JOIN SCREEN sc ON s.screen_id = sc.screen_id
      JOIN THEATER t ON sc.theater_id = t.theater_id
      WHERE s.show_id = ?
    `, [id]);

    if (showtimeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    const showtime = showtimeRows[0];
    const basePrice = parseFloat(showtime.base_price);

    // 2. Fetch all seats for the screen
    const seats = await query(`
      SELECT seat_id, seat_number, seat_type, screen_id
      FROM SEAT
      WHERE screen_id = ?
      ORDER BY 
        SUBSTRING(seat_number, 1, 1) ASC,
        CAST(SUBSTRING(seat_number, 2) AS UNSIGNED) ASC
    `, [showtime.screen_id]);

    // 3. Fetch currently booked seats for this showtime (only active CONFIRMED or PENDING bookings)
    const bookedSeatRows = await query(`
      SELECT bs.seat_id
      FROM BOOKED_SEAT bs
      JOIN BOOKING b ON bs.booking_id = b.booking_id
      WHERE b.show_id = ? AND b.booking_status != 'CANCELLED'
    `, [id]);

    const bookedSeatIds = new Set(bookedSeatRows.map(r => r.seat_id));

    // 4. Map seat pricing and availability
    const seatMap = seats.map(s => {
      let price = basePrice;
      if (s.seat_type === 'VIP') price = Math.round(basePrice * 1.4);
      else if (s.seat_type === 'Premium') price = Math.round(basePrice * 1.2);

      const isBooked = bookedSeatIds.has(s.seat_id);

      return {
        seat_id: s.seat_id,
        seat_number: s.seat_number,
        seat_type: s.seat_type,
        screen_id: s.screen_id,
        price: price,
        is_booked: isBooked
      };
    });

    res.json({
      success: true,
      data: {
        showtime,
        total_seats: seats.length,
        available_seats: seats.length - bookedSeatIds.size,
        booked_seats: bookedSeatIds.size,
        seats: seatMap
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: List all showtimes with movie & theater details
 */
async function getAllShowtimes(req, res, next) {
  try {
    const { date, movie_id, screen_id } = req.query;
    let sql = `
      SELECT 
        s.show_id,
        s.show_date,
        s.start_time,
        s.end_time,
        s.base_price,
        s.movie_id,
        m.title AS movie_title,
        m.duration,
        s.screen_id,
        sc.screen_number,
        t.theater_id,
        t.theater_name
      FROM SHOWTIME s
      JOIN MOVIE m ON s.movie_id = m.movie_id
      JOIN SCREEN sc ON s.screen_id = sc.screen_id
      JOIN THEATER t ON sc.theater_id = t.theater_id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ' AND s.show_date = ?';
      params.push(date);
    }
    if (movie_id) {
      sql += ' AND s.movie_id = ?';
      params.push(movie_id);
    }
    if (screen_id) {
      sql += ' AND s.screen_id = ?';
      params.push(screen_id);
    }

    sql += ' ORDER BY s.show_date DESC, s.start_time ASC';
    const showtimes = await query(sql, params);

    res.json({ success: true, count: showtimes.length, data: showtimes });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Schedule a new showtime
 */
async function adminCreateShowtime(req, res, next) {
  try {
    const { show_date, start_time, end_time, base_price, movie_id, screen_id } = req.body;

    if (!show_date || !start_time || !end_time || !base_price || !movie_id || !screen_id) {
      return res.status(400).json({
        success: false,
        message: 'All showtime fields (show_date, start_time, end_time, base_price, movie_id, screen_id) are required.'
      });
    }

    // Verify screen and movie exist
    const movieCheck = await query('SELECT movie_id FROM MOVIE WHERE movie_id = ?', [movie_id]);
    if (movieCheck.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid movie_id.' });
    }

    const screenCheck = await query('SELECT screen_id FROM SCREEN WHERE screen_id = ?', [screen_id]);
    if (screenCheck.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid screen_id.' });
    }

    const sql = `
      INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [show_date, start_time, end_time, parseFloat(base_price), movie_id, screen_id]);

    res.status(201).json({
      success: true,
      message: 'Showtime scheduled successfully.',
      showId: result.insertId
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getShowtimeSeats,
  getAllShowtimes,
  adminCreateShowtime
};

