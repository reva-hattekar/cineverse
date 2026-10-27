const { getConnection, query } = require('../config/db');

/**
 * Public/Staff: Get all bookings with rich details
 */
async function getAllBookings(req, res, next) {
  try {
    const { customer_id, status } = req.query;
    let sql = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        b.customer_id,
        c.customer_name,
        c.email AS customer_email,
        b.show_id,
        DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
        s.start_time,
        m.title AS movie_title,
        t.theater_name,
        sc.screen_number,
        p.payment_id,
        p.payment_method,
        p.payment_status,
        GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS seats
      FROM BOOKING b
      JOIN CUSTOMER c ON b.customer_id = c.customer_id
      JOIN SHOWTIME s ON b.show_id = s.show_id
      JOIN MOVIE m ON s.movie_id = m.movie_id
      JOIN SCREEN sc ON s.screen_id = sc.screen_id
      JOIN THEATER t ON sc.theater_id = t.theater_id
      LEFT JOIN PAYMENT p ON b.booking_id = p.booking_id
      LEFT JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
      LEFT JOIN SEAT st ON bs.seat_id = st.seat_id
      WHERE 1=1
    `;
    const params = [];

    if (customer_id) {
      sql += ' AND b.customer_id = ?';
      params.push(customer_id);
    }
    if (status) {
      sql += ' AND b.booking_status = ?';
      params.push(status);
    }

    sql += ' GROUP BY b.booking_id ORDER BY b.booking_date DESC';
    const bookings = await query(sql, params);

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
}

/**
 * Public/Staff: Get single booking details
 */
async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        c.customer_id,
        c.customer_name,
        c.email,
        c.phone,
        s.show_id,
        DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
        s.start_time,
        m.title AS movie_title,
        m.genre,
        t.theater_name,
        sc.screen_number,
        p.payment_id,
        p.amount AS payment_amount,
        p.payment_method,
        p.payment_status,
        p.payment_date
      FROM BOOKING b
      JOIN CUSTOMER c ON b.customer_id = c.customer_id
      JOIN SHOWTIME s ON b.show_id = s.show_id
      JOIN MOVIE m ON s.movie_id = m.movie_id
      JOIN SCREEN sc ON s.screen_id = sc.screen_id
      JOIN THEATER t ON sc.theater_id = t.theater_id
      LEFT JOIN PAYMENT p ON b.booking_id = p.booking_id
      WHERE b.booking_id = ?
    `;
    const rows = await query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = rows[0];

    // Fetch individual seats
    const seatRows = await query(`
      SELECT bs.seat_id, bs.ticket_price, s.seat_number, s.seat_type
      FROM BOOKED_SEAT bs
      JOIN SEAT s ON bs.seat_id = s.seat_id
      WHERE bs.booking_id = ?
    `, [id]);

    // Fetch snack order if any
    const snackRows = await query(`
      SELECT so.snack_order_id, so.total_price, so.order_status,
             soi.snack_id, soi.quantity, soi.unit_price, sn.snack_name
      FROM SNACK_ORDER so
      JOIN SNACK_ORDER_ITEM soi ON so.snack_order_id = soi.snack_order_id
      JOIN SNACK sn ON soi.snack_id = sn.snack_id
      WHERE so.booking_id = ?
    `, [id]);

    booking.seats = seatRows;
    booking.snacks = snackRows;

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new movie ticket booking wrapped in an ACID Transaction.
 * Performs validation, seat ownership verification, conflict detection,
 * server-side price calculation, and mock payment generation.
 */
async function createBooking(req, res, next) {
  const conn = await getConnection();
  try {
    const { customer_id, show_id, seat_ids, payment_method, snacks } = req.body;

    // 1. Basic validation
    if (!customer_id || !show_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      conn.release();
      return res.status(400).json({
        success: false,
        message: 'Invalid request. customer_id, show_id, and non-empty seat_ids array are required.'
      });
    }

    const validPaymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash'];
    const chosenMethod = validPaymentMethods.includes(payment_method) ? payment_method : 'UPI';

    // Start Transaction
    await conn.beginTransaction();

    // 2. Validate Customer exists
    const [customerRows] = await conn.execute(
      'SELECT customer_id, customer_name, email FROM CUSTOMER WHERE customer_id = ?',
      [customer_id]
    );
    if (customerRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // 3. Validate Showtime exists and fetch base price and screen
    const [showRows] = await conn.execute(
      'SELECT show_id, screen_id, base_price FROM SHOWTIME WHERE show_id = ?',
      [show_id]
    );
    if (showRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    const showtime = showRows[0];
    const basePrice = parseFloat(showtime.base_price);
    const screenId = showtime.screen_id;

    // 4. Validate that all requested seats belong to the showtime's Screen
    // Build parameterized placeholder
    const seatPlaceholders = seat_ids.map(() => '?').join(',');
    const [seatsFound] = await conn.query(
      `SELECT seat_id, seat_number, seat_type, screen_id FROM SEAT WHERE seat_id IN (${seatPlaceholders})`,
      seat_ids
    );

    if (seatsFound.length !== seat_ids.length) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        success: false,
        message: 'One or more selected seats do not exist.'
      });
    }

    for (const seat of seatsFound) {
      if (seat.screen_id !== screenId) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.seat_number} belongs to screen ${seat.screen_id}, not the scheduled screen ${screenId}.`
        });
      }
    }

    // 5. Conflict Check: verify seats are not already reserved in active bookings for this showtime
    const [alreadyBooked] = await conn.query(
      `SELECT bs.seat_id, s.seat_number
       FROM BOOKED_SEAT bs
       JOIN BOOKING b ON bs.booking_id = b.booking_id
       JOIN SEAT s ON bs.seat_id = s.seat_id
       WHERE b.show_id = ? 
         AND b.booking_status != 'CANCELLED'
         AND bs.seat_id IN (${seatPlaceholders})`,
      [show_id, ...seat_ids]
    );

    if (alreadyBooked.length > 0) {
      const bookedNumbers = alreadyBooked.map(s => s.seat_number).join(', ');
      await conn.rollback();
      conn.release();
      return res.status(409).json({
        success: false,
        error: 'SeatConflict',
        message: `Seats already booked for this showtime: ${bookedNumbers}. Please choose different seats.`
      });
    }

    // 6. Calculate total ticket price on the server
    let ticketTotal = 0;
    const seatPriceMap = [];

    for (const seat of seatsFound) {
      let seatPrice = basePrice;
      if (seat.seat_type === 'VIP') seatPrice = Math.round(basePrice * 1.4);
      else if (seat.seat_type === 'Premium') seatPrice = Math.round(basePrice * 1.2);

      ticketTotal += seatPrice;
      seatPriceMap.push({ seat_id: seat.seat_id, price: seatPrice });
    }

    // 7. Calculate snack total if snacks ordered
    let snackTotal = 0;
    const snackOrderItems = [];

    if (snacks && Array.isArray(snacks) && snacks.length > 0) {
      for (const item of snacks) {
        if (!item.snack_id || !item.quantity || item.quantity <= 0) continue;
        const [snackRows] = await conn.execute(
          'SELECT snack_id, snack_name, price, stock_quantity FROM SNACK WHERE snack_id = ? FOR UPDATE',
          [item.snack_id]
        );
        if (snackRows.length === 0) continue;
        const snack = snackRows[0];
        if (snack.stock_quantity < item.quantity) {
          await conn.rollback();
          conn.release();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${snack.snack_name}. Available: ${snack.stock_quantity}`
          });
        }

        const unitPrice = parseFloat(snack.price);
        const lineTotal = unitPrice * item.quantity;
        snackTotal += lineTotal;

        // Deduct inventory
        await conn.execute(
          'UPDATE SNACK SET stock_quantity = stock_quantity - ? WHERE snack_id = ?',
          [item.quantity, item.snack_id]
        );

        snackOrderItems.push({
          snack_id: item.snack_id,
          quantity: item.quantity,
          unit_price: unitPrice
        });
      }
    }

    const grandTotal = ticketTotal + snackTotal;

    // 8. Insert BOOKING record
    const [bookingResult] = await conn.execute(
      `INSERT INTO BOOKING (total_amount, booking_status, customer_id, show_id)
       VALUES (?, 'CONFIRMED', ?, ?)`,
      [grandTotal, customer_id, show_id]
    );
    const newBookingId = bookingResult.insertId;

    // 9. Insert BOOKED_SEAT records
    for (const sp of seatPriceMap) {
      await conn.execute(
        `INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price)
         VALUES (?, ?, ?)`,
        [newBookingId, sp.seat_id, sp.price]
      );
    }

    // 10. Record clearly labelled Mock Payment
    await conn.execute(
      `INSERT INTO PAYMENT (amount, payment_method, payment_status, booking_id)
       VALUES (?, ?, 'COMPLETED', ?)`,
      [grandTotal, chosenMethod, newBookingId]
    );

    // 11. Record snack orders if applicable
    if (snackOrderItems.length > 0) {
      const [orderResult] = await conn.execute(
        `INSERT INTO SNACK_ORDER (order_status, total_price, booking_id)
         VALUES ('COMPLETED', ?, ?)`,
        [snackTotal, newBookingId]
      );
      const snackOrderId = orderResult.insertId;

      for (const soi of snackOrderItems) {
        await conn.execute(
          `INSERT INTO SNACK_ORDER_ITEM (snack_order_id, snack_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [snackOrderId, soi.snack_id, soi.quantity, soi.unit_price]
        );
      }
    }

    // 12. Commit Transaction
    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: {
        booking_id: newBookingId,
        customer_id,
        show_id,
        seats_booked: seat_ids.length,
        total_amount: grandTotal,
        payment_status: 'COMPLETED (Mock Simulation)',
        payment_method: chosenMethod
      }
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
}

/**
 * Cancel a booking: sets status to 'CANCELLED', sets payment status to 'REFUNDED'.
 * Releases seat availability without deleting historical records.
 */
async function cancelBooking(req, res, next) {
  const conn = await getConnection();
  try {
    const { id } = req.params;

    await conn.beginTransaction();

    const [bookingRows] = await conn.execute(
      'SELECT booking_id, booking_status, customer_id FROM BOOKING WHERE booking_id = ? FOR UPDATE',
      [id]
    );

    if (bookingRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookingRows[0];
    if (booking.booking_status === 'CANCELLED') {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Update booking status to CANCELLED
    await conn.execute(
      "UPDATE BOOKING SET booking_status = 'CANCELLED' WHERE booking_id = ?",
      [id]
    );

    // Update payment record to REFUNDED to maintain financial audit trail
    await conn.execute(
      "UPDATE PAYMENT SET payment_status = 'REFUNDED' WHERE booking_id = ?",
      [id]
    );

    await conn.commit();
    conn.release();

    res.json({
      success: true,
      message: `Booking #${id} successfully cancelled. Seats have been released and payment marked REFUNDED.`,
      booking_id: parseInt(id, 10),
      status: 'CANCELLED'
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking
};

