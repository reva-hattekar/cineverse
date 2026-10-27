const { query } = require('../config/db');

/**
 * Public/Staff: Get all customers with their loyalty & account info
 */
async function getAllCustomers(req, res, next) {
  try {
    const sql = `
      SELECT 
        c.customer_id,
        c.customer_name,
        c.email,
        c.phone,
        a.account_id,
        a.is_active AS account_active,
        a.created_at AS account_created_at,
        la.loyalty_id,
        la.total_points,
        la.membership_level,
        la.join_date,
        COUNT(b.booking_id) AS total_bookings_count
      FROM CUSTOMER c
      LEFT JOIN ACCOUNT a ON c.customer_id = a.customer_id
      LEFT JOIN LOYALTY_ACCOUNT la ON c.customer_id = la.customer_id
      LEFT JOIN BOOKING b ON c.customer_id = b.customer_id
      GROUP BY c.customer_id
      ORDER BY c.customer_id ASC
    `;
    const customers = await query(sql);

    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    next(err);
  }
}

/**
 * Public: Get booking history for a specific customer
 */
async function getCustomerBookings(req, res, next) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        s.show_id,
        DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
        s.start_time,
        m.title AS movie_title,
        m.genre,
        t.theater_name,
        sc.screen_number,
        p.payment_status,
        p.payment_method,
        GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seats
      FROM BOOKING b
      JOIN SHOWTIME s ON b.show_id = s.show_id
      JOIN MOVIE m ON s.movie_id = m.movie_id
      JOIN SCREEN sc ON s.screen_id = sc.screen_id
      JOIN THEATER t ON sc.theater_id = t.theater_id
      LEFT JOIN PAYMENT p ON b.booking_id = p.booking_id
      LEFT JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
      LEFT JOIN SEAT st ON bs.seat_id = st.seat_id
      WHERE b.customer_id = ?
      GROUP BY b.booking_id
      ORDER BY b.booking_date DESC
    `;
    const bookings = await query(sql, [id]);

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCustomers,
  getCustomerBookings
};

