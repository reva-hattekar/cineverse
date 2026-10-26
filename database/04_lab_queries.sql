-- ============================================================================
-- SCRIPT 04: LAB EXPERIMENT QUERIES (EXPERIMENTS 1 TO 8)
-- Project: Movie Theater Ticket Engine (RDBMS Lab Evaluation)
-- Database: MovieTheaterDB
-- Description: Comprehensive query file mapped directly to College RDBMS Lab
--              Experiments 1 through 8. Designed for evaluation and viva voce.
-- ============================================================================

USE MovieTheaterDB;

-- ############################################################################
-- EXPERIMENT 1: ER DIAGRAM TO RELATIONAL MODEL, PRIMARY & FOREIGN KEYS
-- Objective: Map conceptual ER entities & cardinalities to relational tables.
-- ############################################################################

-- 1.1 Inspecting the Relational Schema for Core Entities
DESCRIBE CUSTOMER;
DESCRIBE THEATER;
DESCRIBE SCREEN;
DESCRIBE MOVIE;
DESCRIBE SHOWTIME;
DESCRIBE BOOKING;
DESCRIBE BOOKED_SEAT;
DESCRIBE PAYMENT;

-- 1.2 Inspecting Primary Keys and Foreign Key Relationships in Information Schema
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    CONSTRAINT_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'MovieTheaterDB'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    TABLE_NAME, CONSTRAINT_NAME;


-- ############################################################################
-- EXPERIMENT 2: DDL COMMANDS (CREATE, DROP, ALTER, RENAME)
-- Objective: Demonstrate schema definition operations safely.
-- ############################################################################

-- 2.1 CREATE TABLE demonstration: Create a temporary audit table
CREATE TABLE IF NOT EXISTS AUDIT_DISCOUNT_COUPON (
    coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_code VARCHAR(20) NOT NULL UNIQUE,
    discount_pct DECIMAL(5,2) NOT NULL,
    expiry_date DATE NOT NULL
) ENGINE=InnoDB;

-- 2.2 ALTER TABLE: Add a new column
ALTER TABLE AUDIT_DISCOUNT_COUPON 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- 2.3 ALTER TABLE: Modify column definition
ALTER TABLE AUDIT_DISCOUNT_COUPON 
MODIFY COLUMN discount_pct DECIMAL(4,2) NOT NULL;

-- 2.4 ALTER TABLE: Drop a column
ALTER TABLE AUDIT_DISCOUNT_COUPON 
DROP COLUMN is_active;

-- 2.5 RENAME TABLE: Rename the table
RENAME TABLE AUDIT_DISCOUNT_COUPON TO PROMO_COUPON_ARCHIVE;

-- 2.6 DROP TABLE: Clean up demonstration table
DROP TABLE IF EXISTS PROMO_COUPON_ARCHIVE;


-- ############################################################################
-- EXPERIMENT 3: INTEGRITY CONSTRAINTS (PK, FK, CHECK, NOT NULL, DEFAULT)
-- Objective: Enforce domain, entity, and referential integrity constraints.
-- ############################################################################

-- 3.1 Display active constraints defined in MovieTheaterDB
SELECT 
    TABLE_NAME, 
    CONSTRAINT_NAME, 
    CONSTRAINT_TYPE
FROM 
    information_schema.TABLE_CONSTRAINTS
WHERE 
    TABLE_SCHEMA = 'MovieTheaterDB'
ORDER BY 
    TABLE_NAME, CONSTRAINT_TYPE;

-- 3.2 Verification of DEFAULT constraint:
-- Inserting a Customer loyalty account without explicit join_date/membership_level
-- Note: join_date is NOT NULL, membership_level defaults to 'Bronze', total_points defaults to 0.

-- 3.3 Verification of CHECK constraint:
-- Demonstrating that movie rating must be between 0.0 and 10.0 (CHECK chk_movie_rating)
-- (The following insert is intentionally invalid and will fail with CHECK constraint violation):
-- INSERT INTO MOVIE (title, genre, duration, language, rating) 
-- VALUES ('Invalid Movie', 'Action', 120, 'English', 15.5); -- FAILS: rating > 10.0

-- 3.4 Verification of UNIQUE constraint:
-- Demonstrating email uniqueness on CUSTOMER (uq_customer_email):
-- INSERT INTO CUSTOMER (customer_name, phone, email) 
-- VALUES ('Duplicate User', '9999999999', 'aarav.sharma@example.com'); -- FAILS: duplicate entry


-- ############################################################################
-- EXPERIMENT 4: MULTI-ROW INSERT AND INSERT ... SELECT
-- Objective: Batch population and bulk data ingestion from existing tables.
-- ############################################################################

-- 4.1 Multi-row INSERT demonstration
CREATE TABLE IF NOT EXISTS TOP_RATED_MOVIES_SHOWCASE (
    movie_id INT PRIMARY KEY,
    title VARCHAR(150),
    rating DECIMAL(3,1),
    genre VARCHAR(50)
) ENGINE=InnoDB;

-- 4.2 INSERT ... SELECT: Ingest top-rated movies (rating >= 8.7) from MOVIE table
INSERT INTO TOP_RATED_MOVIES_SHOWCASE (movie_id, title, rating, genre)
SELECT movie_id, title, rating, genre
FROM MOVIE
WHERE rating >= 8.7;

-- 4.3 View populated table
SELECT * FROM TOP_RATED_MOVIES_SHOWCASE;

-- Clean up showcase table
DROP TABLE IF EXISTS TOP_RATED_MOVIES_SHOWCASE;


-- ############################################################################
-- EXPERIMENT 5: DQL (SELECT, WHERE, LIKE, DISTINCT, BETWEEN, IN)
-- Objective: Data retrieval and filtering.
-- ############################################################################

-- 5.1 SELECT with WHERE and LIKE: Find all Sci-Fi movies or titles containing 'Knight'
SELECT movie_id, title, genre, duration, language, rating
FROM MOVIE
WHERE genre = 'Sci-Fi' OR title LIKE '%Knight%';

-- 5.2 SELECT DISTINCT: Distinct movie genres currently screened
SELECT DISTINCT genre 
FROM MOVIE 
ORDER BY genre ASC;

-- 5.3 SELECT with BETWEEN: Find showtimes priced between 250.00 and 380.00
SELECT show_id, show_date, start_time, base_price, movie_id
FROM SHOWTIME
WHERE base_price BETWEEN 250.00 AND 380.00
ORDER BY base_price DESC;

-- 5.4 SELECT with IN operator: Filter snacks in specific high-demand categories
SELECT snack_id, snack_name, price, stock_quantity
FROM SNACK
WHERE snack_name IN ('Caramel Popcorn (L)', 'Cheese Nachos & Dip', 'Coca-Cola 500ml', 'Cold Coffee');


-- ############################################################################
-- EXPERIMENT 6: AGGREGATE FUNCTIONS & GROUP BY (COUNT, MAX, MIN, AVG, SUM, HAVING)
-- Objective: Summary statistics, grouping and filtered aggregations.
-- ############################################################################

-- 6.1 Basic aggregates on MOVIE table
SELECT 
    COUNT(*) AS total_movies,
    MIN(duration) AS min_duration_mins,
    MAX(duration) AS max_duration_mins,
    ROUND(AVG(duration), 2) AS avg_duration_mins,
    ROUND(AVG(rating), 2) AS avg_imdb_rating
FROM MOVIE;

-- 6.2 Total revenue and average booking amount by booking status
SELECT 
    booking_status,
    COUNT(booking_id) AS total_bookings,
    SUM(total_amount) AS total_revenue,
    ROUND(AVG(total_amount), 2) AS avg_booking_amount
FROM BOOKING
GROUP BY booking_status;

-- 6.3 Revenue grouped by movie (Total earnings per movie from confirmed bookings)
SELECT 
    m.movie_id,
    m.title,
    m.genre,
    COUNT(b.booking_id) AS total_bookings_count,
    COALESCE(SUM(b.total_amount), 0.00) AS total_revenue_generated
FROM MOVIE m
JOIN SHOWTIME s ON m.movie_id = s.movie_id
JOIN BOOKING b ON s.show_id = b.show_id
WHERE b.booking_status = 'CONFIRMED'
GROUP BY m.movie_id, m.title, m.genre
ORDER BY total_revenue_generated DESC;

-- 6.4 GROUP BY with HAVING: Genres having more than 1 movie screened
SELECT 
    genre,
    COUNT(movie_id) AS movie_count,
    ROUND(AVG(rating), 2) AS avg_genre_rating
FROM MOVIE
GROUP BY genre
HAVING COUNT(movie_id) > 1
ORDER BY movie_count DESC;


-- ############################################################################
-- EXPERIMENT 7: JOINS (INNER, LEFT, RIGHT, FULL OUTER JOIN EQUIVALENT, NON-EQUI)
-- Objective: Multi-table relationship queries and join variations.
-- ############################################################################

-- 7.1 INNER JOIN: Bookings with Customer, Movie, Showtime, and Payment details
SELECT 
    b.booking_id,
    c.customer_name,
    c.email AS customer_email,
    m.title AS movie_title,
    s.show_date,
    s.start_time,
    t.theater_name,
    sc.screen_number,
    b.total_amount,
    b.booking_status,
    p.payment_method,
    p.payment_status
FROM BOOKING b
INNER JOIN CUSTOMER c ON b.customer_id = c.customer_id
INNER JOIN SHOWTIME s ON b.show_id = s.show_id
INNER JOIN MOVIE m ON s.movie_id = m.movie_id
INNER JOIN SCREEN sc ON s.screen_id = sc.screen_id
INNER JOIN THEATER t ON sc.theater_id = t.theater_id
LEFT JOIN PAYMENT p ON b.booking_id = p.booking_id
ORDER BY b.booking_id ASC;

-- 7.2 LEFT JOIN: All customers, including those with zero bookings
SELECT 
    c.customer_id,
    c.customer_name,
    c.email,
    COUNT(b.booking_id) AS total_bookings_made
FROM CUSTOMER c
LEFT JOIN BOOKING b ON c.customer_id = b.customer_id
GROUP BY c.customer_id, c.customer_name, c.email
ORDER BY total_bookings_made ASC, c.customer_id ASC;

-- 7.3 RIGHT JOIN: All showtimes and any bookings attached to them
SELECT 
    s.show_id,
    m.title AS movie_title,
    s.show_date,
    s.start_time,
    b.booking_id,
    b.booking_status
FROM BOOKING b
RIGHT JOIN SHOWTIME s ON b.show_id = s.show_id
JOIN MOVIE m ON s.movie_id = m.movie_id
ORDER BY s.show_id ASC;

-- 7.4 FULL OUTER JOIN EQUIVALENT in MySQL
-- MySQL does not natively support FULL OUTER JOIN. We implement it using:
-- (Table A LEFT JOIN Table B) UNION ALL (Table B LEFT JOIN Table A WHERE Table A is NULL)
SELECT 
    c.customer_id,
    c.customer_name,
    b.booking_id,
    b.total_amount,
    b.booking_status
FROM CUSTOMER c
LEFT JOIN BOOKING b ON c.customer_id = b.customer_id
UNION ALL
SELECT 
    c.customer_id,
    c.customer_name,
    b.booking_id,
    b.total_amount,
    b.booking_status
FROM BOOKING b
LEFT JOIN CUSTOMER c ON b.customer_id = c.customer_id
WHERE c.customer_id IS NULL;

-- 7.5 NON-EQUI JOIN: Matching snack prices to tiered price brackets
SELECT 
    s.snack_name,
    s.price,
    CASE 
        WHEN s.price < 100 THEN 'Economy Concession'
        WHEN s.price BETWEEN 100 AND 180 THEN 'Standard Concession'
        ELSE 'Premium Concession'
    END AS price_tier
FROM SNACK s
ORDER BY s.price ASC;


-- ############################################################################
-- EXPERIMENT 8: SUBQUERIES (IN, ANY, ALL, EXISTS, NOT EXISTS, CORRELATED)
-- Objective: Nested queries and correlated sub-select logic.
-- ############################################################################

-- 8.1 Subquery using IN: Find customers who have made at least one confirmed booking
SELECT customer_id, customer_name, email
FROM CUSTOMER
WHERE customer_id IN (
    SELECT DISTINCT customer_id 
    FROM BOOKING 
    WHERE booking_status = 'CONFIRMED'
);

-- 8.2 Subquery using NOT IN: Customers who have NEVER made a booking
SELECT customer_id, customer_name, email, phone
FROM CUSTOMER
WHERE customer_id NOT IN (
    SELECT DISTINCT customer_id 
    FROM BOOKING
);

-- 8.3 Subquery using > ALL: Movies longer than ALL Animation movies
SELECT movie_id, title, genre, duration
FROM MOVIE
WHERE duration > ALL (
    SELECT duration 
    FROM MOVIE 
    WHERE genre = 'Animation'
);

-- 8.4 Subquery using > ANY: Showtimes priced higher than ANY showtime on Screen 1
SELECT show_id, show_date, start_time, base_price, screen_id
FROM SHOWTIME
WHERE base_price > ANY (
    SELECT base_price 
    FROM SHOWTIME 
    WHERE screen_id = 1
)
ORDER BY base_price DESC;

-- 8.5 Scalar Subquery: Movies longer than the average movie duration
SELECT 
    movie_id, 
    title, 
    duration,
    (SELECT ROUND(AVG(duration), 2) FROM MOVIE) AS avg_duration
FROM MOVIE
WHERE duration > (
    SELECT AVG(duration) FROM MOVIE
)
ORDER BY duration DESC;

-- 8.6 Showtimes priced above average base price
SELECT 
    s.show_id, 
    m.title, 
    s.base_price,
    (SELECT ROUND(AVG(base_price), 2) FROM SHOWTIME) AS overall_avg_price
FROM SHOWTIME s
JOIN MOVIE m ON s.movie_id = m.movie_id
WHERE s.base_price > (
    SELECT AVG(base_price) FROM SHOWTIME
)
ORDER BY s.base_price DESC;

-- 8.7 Subquery using EXISTS: Screens that currently host at least one showtime
SELECT screen_id, screen_number, theater_id
FROM SCREEN sc
WHERE EXISTS (
    SELECT 1 
    FROM SHOWTIME sh 
    WHERE sh.screen_id = sc.screen_id
);

-- 8.8 Subquery using NOT EXISTS: Customers who do NOT have any loyalty account
SELECT c.customer_id, c.customer_name, c.email
FROM CUSTOMER c
WHERE NOT EXISTS (
    SELECT 1 
    FROM LOYALTY_ACCOUNT l 
    WHERE l.customer_id = c.customer_id
);

-- 8.9 Correlated Subquery: For each customer, find their latest booking amount
SELECT 
    c.customer_id,
    c.customer_name,
    (
        SELECT b.total_amount
        FROM BOOKING b
        WHERE b.customer_id = c.customer_id
        ORDER BY b.booking_date DESC
        LIMIT 1
    ) AS latest_booking_amount
FROM CUSTOMER c;


-- ############################################################################
-- SEPARATE DEMONSTRATION SECTION: DESTRUCTIVE OPERATIONS (UPDATE, DELETE)
-- (With comments and preview SELECT statements - DO NOT EXECUTE ON STARTUP)
-- ############################################################################

-- PREVIEW BEFORE UPDATE:
-- SELECT snack_id, snack_name, price FROM SNACK WHERE snack_id = 1;
-- 
-- DESTRUCTIVE UPDATE DEMONSTRATION (Example only):
-- UPDATE SNACK 
-- SET price = price * 1.10 
-- WHERE snack_id = 1;

-- PREVIEW BEFORE CANCELLATION/RELEASE:
-- SELECT booking_id, booking_status FROM BOOKING WHERE booking_id = 9;
--
-- CANCELLATION RELEASE DEMONSTRATION:
-- UPDATE BOOKING 
-- SET booking_status = 'CANCELLED' 
-- WHERE booking_id = 9;
-- (Seat availability query automatically ignores CANCELLED bookings)

SELECT 'Lab 04 queries compiled and ready for evaluation.' AS Status;

