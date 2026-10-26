const { query } = require('../config/db');

/**
 * Admin: Revenue report with breakdown by movie and overall totals
 */
async function getRevenueReport(req, res, next) {
  try {
    // 1. Overall financial summary
    const summaryRows = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0.00) AS confirmed_ticket_revenue,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CANCELLED' THEN b.total_amount ELSE 0 END), 0.00) AS cancelled_or_refunded_amount,
        COUNT(CASE WHEN b.booking_status = 'CONFIRMED' THEN 1 END) AS confirmed_bookings_count,
        COUNT(CASE WHEN b.booking_status = 'CANCELLED' THEN 1 END) AS cancelled_bookings_count
      FROM BOOKING b
    `);

    // 2. Concession revenue
    const snackRows = await query(`
      SELECT COALESCE(SUM(total_price), 0.00) AS total_concession_revenue
      FROM SNACK_ORDER
      WHERE order_status = 'COMPLETED'
    `);

    // 3. Breakdown by movie
    const movieBreakdown = await query(`
      SELECT 
        m.movie_id,
        m.title,
        m.genre,
        COUNT(DISTINCT b.booking_id) AS total_bookings,
        COUNT(bs.seat_id) AS total_tickets_sold,
        COALESCE(SUM(b.total_amount), 0.00) AS movie_revenue
      FROM MOVIE m
      JOIN SHOWTIME s ON m.movie_id = s.movie_id
      LEFT JOIN BOOKING b ON s.show_id = b.show_id AND b.booking_status = 'CONFIRMED'
      LEFT JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
      GROUP BY m.movie_id, m.title, m.genre
      ORDER BY movie_revenue DESC
    `);

    res.json({
      success: true,
      data: {
        summary: {
          ...summaryRows[0],
          total_concession_revenue: snackRows[0].total_concession_revenue,
          grand_total_revenue: (
            parseFloat(summaryRows[0].confirmed_ticket_revenue) +
            parseFloat(snackRows[0].total_concession_revenue)
          ).toFixed(2)
        },
        movie_breakdown: movieBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Popular movies report
 */
async function getPopularMoviesReport(req, res, next) {
  try {
    const popular = await query(`
      SELECT 
        m.movie_id,
        m.title,
        m.genre,
        m.rating,
        m.duration,
        COUNT(DISTINCT s.show_id) AS total_screenings,
        COUNT(DISTINCT b.booking_id) AS total_bookings,
        COUNT(bs.seat_id) AS total_seats_sold,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0.00) AS gross_revenue
      FROM MOVIE m
      LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
      LEFT JOIN BOOKING b ON s.show_id = b.show_id AND b.booking_status = 'CONFIRMED'
      LEFT JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
      GROUP BY m.movie_id, m.title, m.genre, m.rating, m.duration
      ORDER BY total_seats_sold DESC, gross_revenue DESC
    `);

    res.json({ success: true, count: popular.length, data: popular });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRevenueReport,
  getPopularMoviesReport
};

