-- ============================================================================
-- SCRIPT 02: CREATE TABLES & CONSTRAINTS
-- Project: Movie Theater Ticket Engine (RDBMS Lab Project)
-- Database: MovieTheaterDB
-- Description: Creates 15 normalized relational tables with PRIMARY KEY,
--              FOREIGN KEY, UNIQUE, CHECK, NOT NULL, and DEFAULT constraints.
-- Engine: InnoDB (required for ACID compliance and transactional foreign keys)
-- ============================================================================

USE MovieTheaterDB;

-- Disable foreign key checks during tear-down to avoid dependency errors on re-run
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS SNACK_ORDER_ITEM;
DROP TABLE IF EXISTS SNACK_ORDER;
DROP TABLE IF EXISTS SNACK;
DROP TABLE IF EXISTS PAYMENT;
DROP TABLE IF EXISTS BOOKED_SEAT;
DROP TABLE IF EXISTS BOOKING;
DROP TABLE IF EXISTS SHOWTIME;
DROP TABLE IF EXISTS MOVIE;
DROP TABLE IF EXISTS SEAT;
DROP TABLE IF EXISTS SCREEN;
DROP TABLE IF EXISTS ADMIN_STAFF;
DROP TABLE IF EXISTS THEATER;
DROP TABLE IF EXISTS LOYALTY_ACCOUNT;
DROP TABLE IF EXISTS ACCOUNT;
DROP TABLE IF EXISTS CUSTOMER;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. CUSTOMER TABLE
-- Primary entity representing individuals who book tickets.
-- ============================================================================
CREATE TABLE CUSTOMER (
    customer_id INT AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL,
    CONSTRAINT pk_customer PRIMARY KEY (customer_id),
    CONSTRAINT uq_customer_email UNIQUE (email),
    CONSTRAINT chk_customer_email CHECK (email LIKE '%_@__%.__%')
) ENGINE=InnoDB;

-- ============================================================================
-- 2. ACCOUNT TABLE (1:0..1 with CUSTOMER)
-- Credentials and portal status for registered customers.
-- ============================================================================
CREATE TABLE ACCOUNT (
    account_id INT AUTO_INCREMENT,
    customer_id INT NOT NULL,
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_account PRIMARY KEY (account_id),
    CONSTRAINT uq_account_customer UNIQUE (customer_id),
    CONSTRAINT uq_account_email UNIQUE (email),
    CONSTRAINT fk_account_customer FOREIGN KEY (customer_id) 
        REFERENCES CUSTOMER(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 3. LOYALTY_ACCOUNT TABLE (1:0..1 with CUSTOMER)
-- Rewards points and tiered membership program for returning customers.
-- ============================================================================
CREATE TABLE LOYALTY_ACCOUNT (
    loyalty_id INT AUTO_INCREMENT,
    customer_id INT NOT NULL,
    total_points INT NOT NULL DEFAULT 0,
    join_date DATE NOT NULL,
    membership_level VARCHAR(20) NOT NULL DEFAULT 'Bronze',
    CONSTRAINT pk_loyalty PRIMARY KEY (loyalty_id),
    CONSTRAINT uq_loyalty_customer UNIQUE (customer_id),
    CONSTRAINT chk_loyalty_points CHECK (total_points >= 0),
    CONSTRAINT chk_loyalty_level CHECK (membership_level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    CONSTRAINT fk_loyalty_customer FOREIGN KEY (customer_id) 
        REFERENCES CUSTOMER(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 4. THEATER TABLE
-- Physical cinema locations.
-- ============================================================================
CREATE TABLE THEATER (
    theater_id INT AUTO_INCREMENT,
    theater_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    CONSTRAINT pk_theater PRIMARY KEY (theater_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 5. ADMIN_STAFF TABLE (1:M with THEATER)
-- Cinema employees and administrators with RBAC roles.
-- ============================================================================
CREATE TABLE ADMIN_STAFF (
    staff_id INT AUTO_INCREMENT,
    staff_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Cashier',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    theater_id INT NOT NULL,
    CONSTRAINT pk_admin_staff PRIMARY KEY (staff_id),
    CONSTRAINT uq_admin_staff_email UNIQUE (email),
    CONSTRAINT chk_admin_role CHECK (role IN ('Manager', 'Supervisor', 'Cashier', 'Admin')),
    CONSTRAINT fk_admin_theater FOREIGN KEY (theater_id) 
        REFERENCES THEATER(theater_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- 6. SCREEN TABLE (1:M with THEATER)
-- Auditoriums belonging to a theater.
-- ============================================================================
CREATE TABLE SCREEN (
    screen_id INT AUTO_INCREMENT,
    screen_number INT NOT NULL,
    capacity INT NOT NULL,
    theater_id INT NOT NULL,
    CONSTRAINT pk_screen PRIMARY KEY (screen_id),
    CONSTRAINT uq_theater_screen UNIQUE (theater_id, screen_number),
    CONSTRAINT chk_screen_number CHECK (screen_number > 0),
    CONSTRAINT chk_screen_capacity CHECK (capacity > 0),
    CONSTRAINT fk_screen_theater FOREIGN KEY (theater_id) 
        REFERENCES THEATER(theater_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 7. SEAT TABLE (1:M with SCREEN)
-- Mandatory physical seats inside an auditorium.
-- ============================================================================
CREATE TABLE SEAT (
    seat_id INT AUTO_INCREMENT,
    seat_number VARCHAR(10) NOT NULL,
    seat_type VARCHAR(20) NOT NULL DEFAULT 'Standard',
    screen_id INT NOT NULL,
    CONSTRAINT pk_seat PRIMARY KEY (seat_id),
    CONSTRAINT uq_screen_seat UNIQUE (screen_id, seat_number),
    CONSTRAINT chk_seat_type CHECK (seat_type IN ('Standard', 'Premium', 'VIP', 'Recliner')),
    CONSTRAINT fk_seat_screen FOREIGN KEY (screen_id) 
        REFERENCES SCREEN(screen_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 8. MOVIE TABLE
-- Motion pictures available for screening.
-- ============================================================================
CREATE TABLE MOVIE (
    movie_id INT AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    duration INT NOT NULL, -- duration in minutes
    language VARCHAR(30) NOT NULL,
    rating DECIMAL(3,1) NOT NULL DEFAULT 8.0,
    CONSTRAINT pk_movie PRIMARY KEY (movie_id),
    CONSTRAINT chk_movie_duration CHECK (duration > 0),
    CONSTRAINT chk_movie_rating CHECK (rating >= 0.0 AND rating <= 10.0)
) ENGINE=InnoDB;

-- ============================================================================
-- 9. SHOWTIME TABLE
-- Scheduled movie screening inside a specific screen at a designated time.
-- ============================================================================
CREATE TABLE SHOWTIME (
    show_id INT AUTO_INCREMENT,
    show_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    movie_id INT NOT NULL,
    screen_id INT NOT NULL,
    CONSTRAINT pk_showtime PRIMARY KEY (show_id),
    CONSTRAINT chk_showtime_base_price CHECK (base_price >= 0.00),
    CONSTRAINT fk_showtime_movie FOREIGN KEY (movie_id) 
        REFERENCES MOVIE(movie_id) ON DELETE RESTRICT,
    CONSTRAINT fk_showtime_screen FOREIGN KEY (screen_id) 
        REFERENCES SCREEN(screen_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- 10. BOOKING TABLE
-- Customer transaction reserving seats for a showtime.
-- ============================================================================
CREATE TABLE BOOKING (
    booking_id INT AUTO_INCREMENT,
    booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    customer_id INT NOT NULL,
    show_id INT NOT NULL,
    CONSTRAINT pk_booking PRIMARY KEY (booking_id),
    CONSTRAINT chk_booking_amount CHECK (total_amount >= 0.00),
    CONSTRAINT chk_booking_status CHECK (booking_status IN ('CONFIRMED', 'CANCELLED', 'PENDING')),
    CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) 
        REFERENCES CUSTOMER(customer_id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_showtime FOREIGN KEY (show_id) 
        REFERENCES SHOWTIME(show_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- 11. BOOKED_SEAT TABLE (Composite PK, M:N link between BOOKING and SEAT)
-- Represents reserved seats. Seat availability is determined by checking
-- active bookings (booking_status != 'CANCELLED') for a given showtime.
-- ============================================================================
CREATE TABLE BOOKED_SEAT (
    booking_id INT NOT NULL,
    seat_id INT NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT pk_booked_seat PRIMARY KEY (booking_id, seat_id),
    CONSTRAINT chk_booked_seat_price CHECK (ticket_price >= 0.00),
    CONSTRAINT fk_booked_seat_booking FOREIGN KEY (booking_id) 
        REFERENCES BOOKING(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_booked_seat_seat FOREIGN KEY (seat_id) 
        REFERENCES SEAT(seat_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- 12. PAYMENT TABLE (1:0..1 with BOOKING)
-- One-payment-per-booking model.
-- ============================================================================
CREATE TABLE PAYMENT (
    payment_id INT AUTO_INCREMENT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    booking_id INT NOT NULL,
    CONSTRAINT pk_payment PRIMARY KEY (payment_id),
    CONSTRAINT uq_payment_booking UNIQUE (booking_id),
    CONSTRAINT chk_payment_amount CHECK (amount >= 0.00),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('COMPLETED', 'FAILED', 'REFUNDED', 'PENDING')),
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) 
        REFERENCES BOOKING(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 13. SNACK TABLE
-- Concessions inventory.
-- ============================================================================
CREATE TABLE SNACK (
    snack_id INT AUTO_INCREMENT,
    snack_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    CONSTRAINT pk_snack PRIMARY KEY (snack_id),
    CONSTRAINT chk_snack_price CHECK (price >= 0.00),
    CONSTRAINT chk_snack_stock CHECK (stock_quantity >= 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 14. SNACK_ORDER TABLE (1:M with BOOKING)
-- Concession orders tied to a movie booking.
-- ============================================================================
CREATE TABLE SNACK_ORDER (
    snack_order_id INT AUTO_INCREMENT,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    total_price DECIMAL(10,2) NOT NULL,
    booking_id INT NOT NULL,
    CONSTRAINT pk_snack_order PRIMARY KEY (snack_order_id),
    CONSTRAINT chk_snack_order_price CHECK (total_price >= 0.00),
    CONSTRAINT chk_snack_order_status CHECK (order_status IN ('COMPLETED', 'CANCELLED', 'PENDING')),
    CONSTRAINT fk_snack_order_booking FOREIGN KEY (booking_id) 
        REFERENCES BOOKING(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 15. SNACK_ORDER_ITEM TABLE (Composite PK, M:N between SNACK_ORDER and SNACK)
-- Line items in a concession order.
-- ============================================================================
CREATE TABLE SNACK_ORDER_ITEM (
    snack_order_id INT NOT NULL,
    snack_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT pk_snack_order_item PRIMARY KEY (snack_order_id, snack_id),
    CONSTRAINT chk_snack_item_qty CHECK (quantity > 0),
    CONSTRAINT chk_snack_item_unit_price CHECK (unit_price >= 0.00),
    CONSTRAINT fk_snack_item_order FOREIGN KEY (snack_order_id) 
        REFERENCES SNACK_ORDER(snack_order_id) ON DELETE CASCADE,
    CONSTRAINT fk_snack_item_snack FOREIGN KEY (snack_id) 
        REFERENCES SNACK(snack_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- Speeds up lookups on foreign keys and frequently filtered columns.
-- ============================================================================
CREATE INDEX idx_showtime_date ON SHOWTIME(show_date);
CREATE INDEX idx_showtime_movie ON SHOWTIME(movie_id);
CREATE INDEX idx_showtime_screen ON SHOWTIME(screen_id);
CREATE INDEX idx_booking_customer ON BOOKING(customer_id);
CREATE INDEX idx_booking_showtime ON BOOKING(show_id);
CREATE INDEX idx_booking_status ON BOOKING(booking_status);
CREATE INDEX idx_booked_seat_seat ON BOOKED_SEAT(seat_id);
CREATE INDEX idx_payment_booking ON PAYMENT(booking_id);
CREATE INDEX idx_snack_order_booking ON SNACK_ORDER(booking_id);

SELECT 'All 15 tables and indexes created successfully.' AS Status;

