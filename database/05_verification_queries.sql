-- ============================================================================
-- SCRIPT 05: VERIFICATION & AUDIT QUERIES
-- Project: Movie Theater Ticket Engine (RDBMS Lab Evaluation)
-- Database: MovieTheaterDB
-- Description: Diagnostic and integrity checks to verify all 15 tables,
--              record counts, foreign key consistency, and seat booking engine rules.
-- ============================================================================

USE MovieTheaterDB;

-- ============================================================================
-- 1. RECORD COUNT AUDIT ACROSS ALL 15 TABLES
-- ============================================================================
SELECT 'CUSTOMER' AS TableName, COUNT(*) AS RecordCount FROM CUSTOMER
UNION ALL SELECT 'ACCOUNT', COUNT(*) FROM ACCOUNT
UNION ALL SELECT 'LOYALTY_ACCOUNT', COUNT(*) FROM LOYALTY_ACCOUNT
UNION ALL SELECT 'THEATER', COUNT(*) FROM THEATER
UNION ALL SELECT 'ADMIN_STAFF', COUNT(*) FROM ADMIN_STAFF
UNION ALL SELECT 'SCREEN', COUNT(*) FROM SCREEN
UNION ALL SELECT 'SEAT', COUNT(*) FROM SEAT
UNION ALL SELECT 'MOVIE', COUNT(*) FROM MOVIE
UNION ALL SELECT 'SHOWTIME', COUNT(*) FROM SHOWTIME
UNION ALL SELECT 'BOOKING', COUNT(*) FROM BOOKING
UNION ALL SELECT 'BOOKED_SEAT', COUNT(*) FROM BOOKED_SEAT
UNION ALL SELECT 'PAYMENT', COUNT(*) FROM PAYMENT
UNION ALL SELECT 'SNACK', COUNT(*) FROM SNACK
UNION ALL SELECT 'SNACK_ORDER', COUNT(*) FROM SNACK_ORDER
UNION ALL SELECT 'SNACK_ORDER_ITEM', COUNT(*) FROM SNACK_ORDER_ITEM;

-- ============================================================================
-- 2. SEAT AVAILABILITY VERIFICATION FOR A GIVEN SHOWTIME
-- Given Showtime ID = 1 (Movie: Interstellar on Screen 1)
-- Checks which seats are booked vs which are available.
-- Note: A seat is ONLY considered booked if it belongs to a booking with
--       booking_status != 'CANCELLED'.
-- ============================================================================
SELECT 
    st.seat_id,
    st.seat_number,
    st.seat_type,
    sh.show_id,
    m.title AS movie_title,
    CASE 
        WHEN bs.seat_id IS NOT NULL AND b.booking_status != 'CANCELLED' THEN 'BOOKED'
        ELSE 'AVAILABLE'
    END AS seat_status,
    b.booking_id,
    b.booking_status
FROM SHOWTIME sh
JOIN SCREEN sc ON sh.screen_id = sc.screen_id
JOIN SEAT st ON sc.screen_id = st.screen_id
JOIN MOVIE m ON sh.movie_id = m.movie_id
LEFT JOIN BOOKED_SEAT bs ON st.seat_id = bs.seat_id
LEFT JOIN BOOKING b ON bs.booking_id = b.booking_id AND b.show_id = sh.show_id AND b.booking_status != 'CANCELLED'
WHERE sh.show_id = 1
ORDER BY st.seat_id ASC;

-- ============================================================================
-- 3. CANCELLATION RELEASE VERIFICATION
-- Verify that Showtime ID = 11 seats (where booking_id = 9 was CANCELLED)
-- are currently available.
-- ============================================================================
SELECT 
    st.seat_id,
    st.seat_number,
    b.booking_id,
    b.booking_status,
    CASE 
        WHEN b.booking_status = 'CANCELLED' THEN 'RELEASED_AND_AVAILABLE'
        WHEN b.booking_status = 'CONFIRMED' THEN 'BOOKED'
        ELSE 'AVAILABLE'
    END AS effective_status
FROM SHOWTIME sh
JOIN SEAT st ON sh.screen_id = st.screen_id
LEFT JOIN BOOKED_SEAT bs ON st.seat_id = bs.seat_id
LEFT JOIN BOOKING b ON bs.booking_id = b.booking_id AND b.show_id = sh.show_id
WHERE sh.show_id = 11 AND st.seat_number IN ('B1', 'B2');

-- ============================================================================
-- 4. FINANCIAL RECONCILIATION
-- Total revenue from completed payments vs total amount from confirmed bookings.
-- ============================================================================
SELECT 
    (SELECT COALESCE(SUM(total_amount), 0.00) FROM BOOKING WHERE booking_status = 'CONFIRMED') AS confirmed_bookings_sum,
    (SELECT COALESCE(SUM(amount), 0.00) FROM PAYMENT WHERE payment_status = 'COMPLETED') AS completed_payments_sum,
    (SELECT COALESCE(SUM(total_price), 0.00) FROM SNACK_ORDER WHERE order_status = 'COMPLETED') AS concession_revenue_sum;

-- ============================================================================
-- 5. CONFLICT DETECTION AUDIT (Zero rows indicates clean integrity)
-- Checks for any duplicate active booking on the same seat for the same showtime.
-- ============================================================================
SELECT 
    b.show_id,
    bs.seat_id,
    COUNT(b.booking_id) AS active_booking_count
FROM BOOKING b
JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
WHERE b.booking_status = 'CONFIRMED'
GROUP BY b.show_id, bs.seat_id
HAVING COUNT(b.booking_id) > 1;

SELECT 'All integrity verification queries executed successfully.' AS Status;

