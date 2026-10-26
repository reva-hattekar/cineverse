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
        DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
        s.start_time,
        s.end_time,
        s.base_price,
        s.movie_id,
        s.screen_id,
        m.title AS movie_title,
        m.genre,
        m.rating,
        m.duration,
        sc.screen_number,
        sc.screen_name,
        sc.screen_type,
        sc.capacity,
        t.theater_id,
        t.theater_name,
        t.city,
        t.address
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
    const { date, movie_id, screen_id, theater_id } = req.query;
    let sql = `
      SELECT 
        s.show_id,
        DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
        s.start_time,
        s.end_time,
        s.base_price,
        s.movie_id,
        m.title AS movie_title,
        m.duration,
        s.screen_id,
        sc.screen_number,
        sc.screen_name,
        sc.screen_type,
        t.theater_id,
        t.theater_name,
        t.city,
        (SELECT COUNT(*) FROM BOOKING b WHERE b.show_id = s.show_id AND b.booking_status != 'CANCELLED') AS active_bookings_count
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
    if (theater_id) {
      sql += ' AND t.theater_id = ?';
      params.push(theater_id);
    }

    sql += ' ORDER BY s.show_date DESC, t.theater_name ASC, s.start_time ASC';
    const showtimes = await query(sql, params);

    res.json({ success: true, count: showtimes.length, data: showtimes });
  } catch (err) {
    next(err);
  }
}

/**
 * Helper to compute end_time in 'HH:MM:SS' given start_time 'HH:MM' and duration minutes (+ buffer)
 */
function computeEndTime(startTimeStr, durationMins, turnaroundMins = 15) {
  const parts = startTimeStr.split(':');
  let hours = parseInt(parts[0], 10);
  let mins = parseInt(parts[1], 10);

  const totalMins = hours * 60 + mins + durationMins + turnaroundMins;
  const endHours = Math.floor(totalMins / 60) % 24;
  const endRemainingMins = totalMins % 60;

  const hh = String(endHours).padStart(2, '0');
  const mm = String(endRemainingMins).padStart(2, '0');
  return `${hh}:${mm}:00`;
}

/**
 * Admin: Schedule a new showtime
 * Validates against screening overlaps on the same screen (accounting for runtime + turnaround)
 */
async function adminCreateShowtime(req, res, next) {
  try {
    const { show_date, start_time, end_time, base_price, movie_id, screen_id } = req.body;

    if (!show_date || !start_time || !base_price || !movie_id || !screen_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required screening fields: show_date, start_time, base_price, movie_id, and screen_id are mandatory.'
      });
    }

    // Verify movie exists and fetch duration
    const movieRows = await query('SELECT movie_id, title, duration FROM MOVIE WHERE movie_id = ?', [movie_id]);
    if (movieRows.length === 0) {
      return res.status(400).json({ success: false, message: `Movie with ID #${movie_id} does not exist.` });
    }
    const movie = movieRows[0];

    // Verify screen exists and fetch auditorium details
    const screenRows = await query(`
      SELECT sc.screen_id, sc.screen_number, sc.screen_name, sc.screen_type, t.theater_id, t.theater_name
      FROM SCREEN sc
      JOIN THEATER t ON sc.theater_id = t.theater_id
      WHERE sc.screen_id = ?
    `, [screen_id]);

    if (screenRows.length === 0) {
      return res.status(400).json({ success: false, message: `Auditorium screen with ID #${screen_id} does not exist.` });
    }
    const screen = screenRows[0];

    // Compute or validate end_time
    let calculatedEndTime = end_time;
    if (!calculatedEndTime) {
      calculatedEndTime = computeEndTime(start_time, movie.duration, 15);
    } else {
      // Ensure formatted with seconds
      if (calculatedEndTime.length === 5) calculatedEndTime += ':00';
    }

    let formattedStartTime = start_time;
    if (formattedStartTime.length === 5) formattedStartTime += ':00';

    const priceNum = parseFloat(base_price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ success: false, message: 'Base ticket price must be a valid positive amount.' });
    }

    // Overlap Integrity Check:
    // Prevent overlapping screenings on the same screen on that date
    // Two time intervals [A_start, A_end] and [B_start, B_end] overlap if A_start < B_end AND A_end > B_start
    const overlapCheck = await query(`
      SELECT s.show_id, s.start_time, s.end_time, m.title AS movie_title
      FROM SHOWTIME s
      JOIN MOVIE m ON s.movie_id = m.movie_id
      WHERE s.screen_id = ?
        AND s.show_date = ?
        AND (s.start_time < ? AND s.end_time > ?)
    `, [screen_id, show_date, calculatedEndTime, formattedStartTime]);

    if (overlapCheck.length > 0) {
      const conflict = overlapCheck[0];
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Scheduling Conflict: ${screen.screen_name || `Screen ${screen.screen_number}`} at ${screen.theater_name} already has "${conflict.movie_title}" scheduled from ${conflict.start_time.slice(0, 5)} to ${conflict.end_time.slice(0, 5)} on ${show_date}. Auditoriums require sequential screenings with turnaround time.`,
        conflictDetails: {
          conflictingShowId: conflict.show_id,
          conflictingMovie: conflict.movie_title,
          conflictingStartTime: conflict.start_time,
          conflictingEndTime: conflict.end_time,
          screenName: screen.screen_name,
          theaterName: screen.theater_name
        }
      });
    }

    const sql = `
      INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [show_date, formattedStartTime, calculatedEndTime, priceNum, movie_id, screen_id]);

    res.status(201).json({
      success: true,
      message: `Showtime successfully scheduled for "${movie.title}" on ${show_date} at ${formattedStartTime.slice(0, 5)}.`,
      showId: result.insertId,
      screening: {
        showId: result.insertId,
        movieTitle: movie.title,
        theaterName: screen.theater_name,
        screenName: screen.screen_name,
        showDate: show_date,
        startTime: formattedStartTime,
        endTime: calculatedEndTime,
        basePrice: priceNum
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Delete a showtime
 * Validates that no active bookings exist
 */
async function adminDeleteShowtime(req, res, next) {
  try {
    const { id } = req.params;

    // Check for active bookings
    const bookings = await query(`
      SELECT booking_id, customer_id, total_amount, booking_status
      FROM BOOKING
      WHERE show_id = ? AND booking_status != 'CANCELLED'
    `, [id]);

    if (bookings.length > 0) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Cannot delete showtime #${id}. It has ${bookings.length} active customer reservation(s). Cancel the customer bookings first or reassign the schedule.`
      });
    }

    const result = await query('DELETE FROM SHOWTIME WHERE show_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    res.json({ success: true, message: `Showtime #${id} deleted successfully.` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getShowtimeSeats,
  getAllShowtimes,
  adminCreateShowtime,
  adminDeleteShowtime
};
