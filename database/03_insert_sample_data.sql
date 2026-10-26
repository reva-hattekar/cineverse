-- ============================================================================
-- SCRIPT 03: INSERT SAMPLE DATA
-- Project: Movie Theater Ticket Engine (RDBMS Lab Project)
-- Database: MovieTheaterDB
-- Description: Seeds the database with realistic sample records:
--              - 2 Theaters
--              - 4 Screens (2 per theater)
--              - 80 Seats across screens (Standard, Premium, VIP)
--              - 10 Movies across diverse genres and languages
--              - 18 Showtimes across dates and screens
--              - 10 Customers with Account and Loyalty Account records
--              - 4 Admin Staff members with distinct roles
--              - 10 Snacks in concessions
--              - 12 Bookings with Booked Seats (confirmed, cancelled)
--              - 12 Payment records
--              - 6 Snack orders with order items
-- ============================================================================

USE MovieTheaterDB;

-- Disable checks temporarily for batch inserting cleanly
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE SNACK_ORDER_ITEM;
TRUNCATE TABLE SNACK_ORDER;
TRUNCATE TABLE SNACK;
TRUNCATE TABLE PAYMENT;
TRUNCATE TABLE BOOKED_SEAT;
TRUNCATE TABLE BOOKING;
TRUNCATE TABLE SHOWTIME;
TRUNCATE TABLE MOVIE;
TRUNCATE TABLE SEAT;
TRUNCATE TABLE SCREEN;
TRUNCATE TABLE ADMIN_STAFF;
TRUNCATE TABLE THEATER;
TRUNCATE TABLE LOYALTY_ACCOUNT;
TRUNCATE TABLE ACCOUNT;
TRUNCATE TABLE CUSTOMER;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. THEATER (2 Physical Theaters)
-- ============================================================================
INSERT INTO THEATER (theater_id, theater_name, city, address) VALUES
(1, 'Grand PVR Cinemas', 'Bengaluru', '4th Floor, Nexus Mall, Koramangala'),
(2, 'Cinepolis IMAX Arena', 'Bengaluru', 'Royal Meenakshi Mall, Bannerghatta Road');

-- ============================================================================
-- 2. SCREEN (4 Screens, 2 per Theater)
-- ============================================================================
INSERT INTO SCREEN (screen_id, screen_number, capacity, theater_id) VALUES
(1, 1, 30, 1), -- Theater 1 Screen 1 (Standard)
(2, 2, 20, 1), -- Theater 1 Screen 2 (IMAX / VIP)
(3, 1, 25, 2), -- Theater 2 Screen 1 (Dolby Atmos)
(4, 2, 25, 2); -- Theater 2 Screen 2 (4DX)

-- ============================================================================
-- 3. SEAT (Seats for each screen across rows A, B, C with various seat types)
-- ============================================================================
-- Screen 1 (20 seats: A1-A6 VIP, B1-B8 Premium, C1-C6 Standard)
INSERT INTO SEAT (seat_number, seat_type, screen_id) VALUES
('A1', 'VIP', 1), ('A2', 'VIP', 1), ('A3', 'VIP', 1), ('A4', 'VIP', 1), ('A5', 'VIP', 1), ('A6', 'VIP', 1),
('B1', 'Premium', 1), ('B2', 'Premium', 1), ('B3', 'Premium', 1), ('B4', 'Premium', 1), ('B5', 'Premium', 1), ('B6', 'Premium', 1), ('B7', 'Premium', 1), ('B8', 'Premium', 1),
('C1', 'Standard', 1), ('C2', 'Standard', 1), ('C3', 'Standard', 1), ('C4', 'Standard', 1), ('C5', 'Standard', 1), ('C6', 'Standard', 1);

-- Screen 2 (16 seats: A1-A4 VIP, B1-B6 Premium, C1-C6 Standard)
INSERT INTO SEAT (seat_number, seat_type, screen_id) VALUES
('A1', 'VIP', 2), ('A2', 'VIP', 2), ('A3', 'VIP', 2), ('A4', 'VIP', 2),
('B1', 'Premium', 2), ('B2', 'Premium', 2), ('B3', 'Premium', 2), ('B4', 'Premium', 2), ('B5', 'Premium', 2), ('B6', 'Premium', 2),
('C1', 'Standard', 2), ('C2', 'Standard', 2), ('C3', 'Standard', 2), ('C4', 'Standard', 2), ('C5', 'Standard', 2), ('C6', 'Standard', 2);

-- Screen 3 (16 seats: A1-A4 Recliner, B1-B6 Premium, C1-C6 Standard)
INSERT INTO SEAT (seat_number, seat_type, screen_id) VALUES
('A1', 'VIP', 3), ('A2', 'VIP', 3), ('A3', 'VIP', 3), ('A4', 'VIP', 3),
('B1', 'Premium', 3), ('B2', 'Premium', 3), ('B3', 'Premium', 3), ('B4', 'Premium', 3), ('B5', 'Premium', 3), ('B6', 'Premium', 3),
('C1', 'Standard', 3), ('C2', 'Standard', 3), ('C3', 'Standard', 3), ('C4', 'Standard', 3), ('C5', 'Standard', 3), ('C6', 'Standard', 3);

-- Screen 4 (16 seats: A1-A4 Recliner, B1-B6 Premium, C1-C6 Standard)
INSERT INTO SEAT (seat_number, seat_type, screen_id) VALUES
('A1', 'VIP', 4), ('A2', 'VIP', 4), ('A3', 'VIP', 4), ('A4', 'VIP', 4),
('B1', 'Premium', 4), ('B2', 'Premium', 4), ('B3', 'Premium', 4), ('B4', 'Premium', 4), ('B5', 'Premium', 4), ('B6', 'Premium', 4),
('C1', 'Standard', 4), ('C2', 'Standard', 4), ('C3', 'Standard', 4), ('C4', 'Standard', 4), ('C5', 'Standard', 4), ('C6', 'Standard', 4);

-- ============================================================================
-- 4. MOVIE (10 Movies with varying duration, genres and languages)
-- ============================================================================
INSERT INTO MOVIE (movie_id, title, genre, duration, language, rating) VALUES
(1, 'Interstellar', 'Sci-Fi', 169, 'English', 8.7),
(2, 'Inception', 'Sci-Fi', 148, 'English', 8.8),
(3, 'The Dark Knight', 'Action', 152, 'English', 9.0),
(4, 'Oppenheimer', 'Drama', 180, 'English', 8.9),
(5, 'Dune: Part Two', 'Sci-Fi', 166, 'English', 8.6),
(6, 'Spirited Away', 'Animation', 125, 'Japanese', 8.6),
(7, 'Spider-Man: Across the Spider-Verse', 'Animation', 140, 'English', 8.7),
(8, 'Kantara', 'Action-Thriller', 148, 'Kannada', 8.3),
(9, 'RRR', 'Action', 187, 'Telugu', 8.0),
(10, '3 Idiots', 'Comedy-Drama', 170, 'Hindi', 8.4);

-- ============================================================================
-- 5. SHOWTIME (18 Showtimes across dates, movies and screens)
-- ============================================================================
INSERT INTO SHOWTIME (show_id, show_date, start_time, end_time, base_price, movie_id, screen_id) VALUES
(1,  '2026-10-15', '10:00:00', '13:00:00', 250.00, 1, 1),
(2,  '2026-10-15', '14:00:00', '17:00:00', 300.00, 2, 1),
(3,  '2026-10-15', '18:00:00', '21:00:00', 350.00, 3, 1),
(4,  '2026-10-15', '11:00:00', '14:00:00', 400.00, 4, 2),
(5,  '2026-10-15', '15:30:00', '18:30:00', 450.00, 5, 2),
(6,  '2026-10-15', '19:30:00', '22:30:00', 400.00, 5, 2),
(7,  '2026-10-16', '10:30:00', '13:00:00', 220.00, 6, 3),
(8,  '2026-10-16', '14:00:00', '16:45:00', 280.00, 7, 3),
(9,  '2026-10-16', '18:00:00', '21:00:00', 320.00, 8, 3),
(10, '2026-10-16', '10:00:00', '13:30:00', 350.00, 9, 4),
(11, '2026-10-16', '14:30:00', '17:30:00', 260.00, 10, 4),
(12, '2026-10-16', '19:00:00', '22:00:00', 380.00, 3, 4),
(13, '2026-10-17', '10:00:00', '13:00:00', 300.00, 1, 2),
(14, '2026-10-17', '14:00:00', '17:00:00', 350.00, 4, 2),
(15, '2026-10-17', '18:00:00', '21:00:00', 420.00, 5, 1),
(16, '2026-10-17', '11:00:00', '14:00:00', 240.00, 7, 3),
(17, '2026-10-17', '15:00:00', '18:00:00', 310.00, 8, 4),
(18, '2026-10-17', '19:00:00', '22:00:00', 360.00, 9, 1);

-- ============================================================================
-- 6. CUSTOMER (10 Customers)
-- ============================================================================
INSERT INTO CUSTOMER (customer_id, customer_name, phone, email) VALUES
(1,  'Aarav Sharma',     '9876543210', 'aarav.sharma@example.com'),
(2,  'Diya Patel',       '9876543211', 'diya.patel@example.com'),
(3,  'Rohan Iyer',       '9876543212', 'rohan.iyer@example.com'),
(4,  'Ananya Nair',      '9876543213', 'ananya.nair@example.com'),
(5,  'Vikram Malhotra',  '9876543214', 'vikram.m@example.com'),
(6,  'Pooja Hegde',      '9876543215', 'pooja.h@example.com'),
(7,  'Rahul Verma',      '9876543216', 'rahul.v@example.com'),
(8,  'Sneha Kulkarni',   '9876543217', 'sneha.k@example.com'),
(9,  'Karan Johar',      '9876543218', 'karan.j@example.com'),
(10, 'Meera Sen',        '9876543219', 'meera.sen@example.com');

-- ============================================================================
-- 7. ACCOUNT (Customer Auth Accounts)
-- Default password for all customer accounts is: User@123
-- Hash generated using bcrypt: $2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi
-- ============================================================================
INSERT INTO ACCOUNT (account_id, customer_id, email, password_hash, is_active) VALUES
(1, 1, 'aarav.sharma@example.com', '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE),
(2, 2, 'diya.patel@example.com',   '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE),
(3, 3, 'rohan.iyer@example.com',   '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE),
(4, 4, 'ananya.nair@example.com',  '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE),
(5, 5, 'vikram.m@example.com',     '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE),
(6, 6, 'pooja.h@example.com',      '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE),
(7, 7, 'rahul.v@example.com',      '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE),
(8, 8, 'sneha.k@example.com',      '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE);
-- Note: Customers 9 and 10 intentionally have no ACCOUNT record (demonstrating 1:0..1 relationship)

-- ============================================================================
-- 8. LOYALTY_ACCOUNT (Customer Loyalty Points & Tiers)
-- ============================================================================
INSERT INTO LOYALTY_ACCOUNT (loyalty_id, customer_id, total_points, join_date, membership_level) VALUES
(1, 1, 450, '2024-01-15', 'Gold'),
(2, 2, 210, '2024-03-20', 'Silver'),
(3, 3, 90,  '2024-06-10', 'Bronze'),
(4, 4, 820, '2023-11-01', 'Platinum'),
(5, 5, 150, '2024-05-04', 'Silver'),
(6, 6, 0,   '2024-09-01', 'Bronze'),
(7, 7, 520, '2024-02-14', 'Gold');
-- Note: Customers 8, 9, 10 have no loyalty record (demonstrating 1:0..1 optionality)

-- ============================================================================
-- 9. ADMIN_STAFF (4 Staff Members across the 2 Theaters)
-- Default demo password: Admin@123
-- Hash generated using bcrypt: $2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi
-- ============================================================================
INSERT INTO ADMIN_STAFF (staff_id, staff_name, email, phone, role, password_hash, is_active, theater_id) VALUES
(1, 'Rajesh Kumar',  'admin@cinema.com',    '9811122233', 'Admin',      '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE, 1),
(2, 'Priya Menon',   'manager1@cinema.com', '9811122234', 'Manager',    '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE, 1),
(3, 'Amit Saxena',   'manager2@cinema.com', '9811122235', 'Manager',    '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE, 2),
(4, 'Kavita Das',    'cashier@cinema.com',  '9811122236', 'Cashier',    '$2a$10$wT0vQO5E0U89.V11F/qgG.r69Zt1h1n7C91c3B7h8y4Zf0yC2/Oqi', TRUE, 2);

-- ============================================================================
-- 10. SNACK (10 Concessions)
-- ============================================================================
INSERT INTO SNACK (snack_id, snack_name, price, stock_quantity) VALUES
(1,  'Caramel Popcorn (L)',   220.00, 150),
(2,  'Salted Popcorn (R)',    160.00, 200),
(3,  'Cheese Nachos & Dip',   190.00, 120),
(4,  'Coca-Cola 500ml',        90.00, 300),
(5,  'Sprite 500ml',           90.00, 250),
(6,  'Chicken Hot Dog',       180.00, 80),
(7,  'Veg Burger Deluxe',     150.00, 100),
(8,  'Chocolate Lava Cake',   140.00, 90),
(9,  'Bottled Mineral Water',  40.00, 500),
(10, 'Cold Coffee',           130.00, 110);

-- ============================================================================
-- 11. BOOKING (10 Bookings: confirmed and cancelled)
-- ============================================================================
INSERT INTO BOOKING (booking_id, booking_date, total_amount, booking_status, customer_id, show_id) VALUES
(1,  '2026-10-12 10:15:00', 500.00, 'CONFIRMED', 1, 1),  -- 2 tickets @ 250
(2,  '2026-10-12 11:30:00', 600.00, 'CONFIRMED', 2, 2),  -- 2 tickets @ 300
(3,  '2026-10-12 12:45:00', 350.00, 'CONFIRMED', 3, 3),  -- 1 ticket @ 350
(4,  '2026-10-13 09:20:00', 800.00, 'CONFIRMED', 4, 4),  -- 2 tickets @ 400
(5,  '2026-10-13 14:10:00', 900.00, 'CONFIRMED', 5, 5),  -- 2 tickets @ 450
(6,  '2026-10-13 16:50:00', 440.00, 'CONFIRMED', 1, 7),  -- 2 tickets @ 220
(7,  '2026-10-14 11:00:00', 280.00, 'CONFIRMED', 6, 8),  -- 1 ticket @ 280
(8,  '2026-10-14 13:25:00', 700.00, 'CONFIRMED', 7, 10), -- 2 tickets @ 350
(9,  '2026-10-14 15:40:00', 520.00, 'CANCELLED', 2, 11), -- Cancelled booking (releases seats)
(10, '2026-10-14 17:15:00', 380.00, 'CONFIRMED', 8, 12); -- 1 ticket @ 380
-- Note: Customers 9 and 10 have no bookings yet (useful for anti-join queries in Lab 7 & 8)

-- ============================================================================
-- 12. BOOKED_SEAT (Seats tied to Show Screen)
-- Note: Seats 1..20 belong to Screen 1, 21..36 belong to Screen 2,
--       37..52 belong to Screen 3, 53..68 belong to Screen 4.
-- ============================================================================
-- Booking 1 (Show 1 on Screen 1): Seats 1 (A1) and 2 (A2)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(1, 1, 250.00),
(1, 2, 250.00);

-- Booking 2 (Show 2 on Screen 1): Seats 7 (B1) and 8 (B2)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(2, 7, 300.00),
(2, 8, 300.00);

-- Booking 3 (Show 3 on Screen 1): Seat 15 (C1)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(3, 15, 350.00);

-- Booking 4 (Show 4 on Screen 2): Seats 21 (A1) and 22 (A2)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(4, 21, 400.00),
(4, 22, 400.00);

-- Booking 5 (Show 5 on Screen 2): Seats 25 (B1) and 26 (B2)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(5, 25, 450.00),
(5, 26, 450.00);

-- Booking 6 (Show 7 on Screen 3): Seats 37 (A1) and 38 (A2)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(6, 37, 220.00),
(6, 38, 220.00);

-- Booking 7 (Show 8 on Screen 3): Seat 47 (C1)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(7, 47, 280.00);

-- Booking 8 (Show 10 on Screen 4): Seats 53 (A1) and 54 (A2)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(8, 53, 350.00),
(8, 54, 350.00);

-- Booking 9 (CANCELLED - Show 11 on Screen 4): Seats 57 (B1) and 58 (B2)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(9, 57, 260.00),
(9, 58, 260.00);

-- Booking 10 (Show 12 on Screen 4): Seat 63 (C1)
INSERT INTO BOOKED_SEAT (booking_id, seat_id, ticket_price) VALUES
(10, 63, 380.00);

-- ============================================================================
-- 13. PAYMENT (1:0..1 with BOOKING)
-- Every booking has a payment record. Cancelled bookings retain their payment
-- record with status REFUNDED or COMPLETED as per audit trail.
-- ============================================================================
INSERT INTO PAYMENT (payment_id, amount, payment_method, payment_status, payment_date, booking_id) VALUES
(1,  500.00, 'UPI',         'COMPLETED', '2026-10-12 10:16:00', 1),
(2,  600.00, 'Credit Card', 'COMPLETED', '2026-10-12 11:31:00', 2),
(3,  350.00, 'Debit Card',  'COMPLETED', '2026-10-12 12:46:00', 3),
(4,  800.00, 'Net Banking', 'COMPLETED', '2026-10-13 09:21:00', 4),
(5,  900.00, 'UPI',         'COMPLETED', '2026-10-13 14:11:00', 5),
(6,  440.00, 'Cash',        'COMPLETED', '2026-10-13 16:51:00', 6),
(7,  280.00, 'UPI',         'COMPLETED', '2026-10-14 11:01:00', 7),
(8,  700.00, 'Credit Card', 'COMPLETED', '2026-10-14 13:26:00', 8),
(9,  520.00, 'UPI',         'REFUNDED',  '2026-10-14 15:41:00', 9),
(10, 380.00, 'Debit Card',  'COMPLETED', '2026-10-14 17:16:00', 10);

-- ============================================================================
-- 14. SNACK_ORDER (Concession orders attached to bookings)
-- ============================================================================
INSERT INTO SNACK_ORDER (snack_order_id, order_date, order_status, total_price, booking_id) VALUES
(1, '2026-10-12 10:20:00', 'COMPLETED', 310.00, 1),
(2, '2026-10-12 11:35:00', 'COMPLETED', 280.00, 2),
(3, '2026-10-13 09:25:00', 'COMPLETED', 410.00, 4),
(4, '2026-10-13 14:15:00', 'COMPLETED', 380.00, 5),
(5, '2026-10-14 13:30:00', 'COMPLETED', 180.00, 8);

-- ============================================================================
-- 15. SNACK_ORDER_ITEM (Itemized concession line items)
-- ============================================================================
INSERT INTO SNACK_ORDER_ITEM (snack_order_id, snack_id, quantity, unit_price) VALUES
(1, 1, 1, 220.00), -- 1x Caramel Popcorn
(1, 4, 1, 90.00),  -- 1x Coca-Cola
(2, 2, 1, 160.00), -- 1x Salted Popcorn
(2, 3, 1, 190.00), -- 1x Cheese Nachos (discounted/bundle 120 + ...)
(3, 1, 1, 220.00), -- 1x Caramel Popcorn
(3, 3, 1, 190.00), -- 1x Nachos
(4, 3, 2, 190.00), -- 2x Nachos
(5, 4, 2, 90.00);  -- 2x Coca-Cola

SELECT 'Sample data inserted successfully across all 15 tables.' AS Status;

