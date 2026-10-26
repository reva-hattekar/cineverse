-- ============================================================================
-- SCRIPT 09: MULTIPLEX EXPANSION (Multi-Screens, Screen Types, & Multiplex Schedules)
-- Database: MovieTheaterDB
-- Description: Supports real multiplex operations:
--              1. Adds screen_name and screen_type to SCREEN table
--              2. Expands all 8 theatres to 4 distinct auditoriums/screens each
--              3. Seeds full 142 seats for all screens
--              4. Schedules simultaneous multi-movie screenings across upcoming 7 days
-- ============================================================================

USE MovieTheaterDB;

-- 1. Add screen_name and screen_type columns if not present
SET @dbname = DATABASE();
SET @tablename = "SCREEN";
SET @columnname = "screen_name";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE SCREEN ADD COLUMN screen_name VARCHAR(60) NULL AFTER screen_number"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = "screen_type";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE SCREEN ADD COLUMN screen_type VARCHAR(40) NOT NULL DEFAULT 'Standard' AFTER screen_name"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Update existing screens 1 & 2 for all theatres
UPDATE SCREEN SET screen_name = 'Audi 1 - IMAX Laser', screen_type = 'IMAX Laser', capacity = 142 WHERE screen_number = 1;
UPDATE SCREEN SET screen_name = 'Audi 2 - Dolby Atmos Luxe', screen_type = 'Dolby Atmos', capacity = 142 WHERE screen_number = 2;

-- 3. Add Screen 3 (4DX Dynamic) and Screen 4 (VIP Onyx Recliner) for each theatre (1 to 8)
INSERT INTO SCREEN (screen_number, screen_name, screen_type, capacity, theater_id)
SELECT 3, 'Audi 3 - 4DX Dynamic', '4DX', 142, t.theater_id
FROM THEATER t
WHERE NOT EXISTS (
  SELECT 1 FROM SCREEN s WHERE s.theater_id = t.theater_id AND s.screen_number = 3
);

INSERT INTO SCREEN (screen_number, screen_name, screen_type, capacity, theater_id)
SELECT 4, 'Audi 4 - VIP Onyx Recliner', 'VIP Lounge', 142, t.theater_id
FROM THEATER t
WHERE NOT EXISTS (
  SELECT 1 FROM SCREEN s WHERE s.theater_id = t.theater_id AND s.screen_number = 4
);

-- 4. Seed full 142 seats for all screens
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G1', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G2', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G3', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G4', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G5', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G6', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G7', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G8', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G9', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G10', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G11', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G12', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G13', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G14', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G15', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'G16', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F1', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F2', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F3', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F4', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F5', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F6', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F7', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F8', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F9', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F10', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F11', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F12', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F13', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F14', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F15', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F16', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'F17', 'Standard', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E1', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E2', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E3', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E4', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E5', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E6', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E7', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E8', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E9', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E10', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E11', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E12', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E13', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E14', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E15', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E16', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E17', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E18', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'E19', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D1', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D2', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D3', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D4', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D5', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D6', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D7', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D8', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D9', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D10', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D11', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D12', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D13', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D14', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D15', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D16', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D17', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D18', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D19', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D20', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D21', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D22', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'D23', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C1', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C2', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C3', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C4', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C5', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C6', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C7', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C8', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C9', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C10', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C11', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C12', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C13', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C14', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C15', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C16', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C17', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C18', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C19', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C20', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C21', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C22', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'C23', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B1', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B2', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B3', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B4', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B5', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B6', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B7', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B8', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B9', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B10', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B11', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B12', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B13', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B14', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B15', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B16', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B17', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B18', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B19', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B20', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B21', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B22', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'B23', 'Premium', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A1', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A2', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A3', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A4', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A5', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A6', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A7', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A8', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A9', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A10', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A11', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A12', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A13', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A14', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A15', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A16', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A17', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A18', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A19', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A20', 'VIP', screen_id FROM SCREEN;
INSERT IGNORE INTO SEAT (seat_number, seat_type, screen_id) SELECT 'A21', 'VIP', screen_id FROM SCREEN;

-- Safely remove any legacy unbooked overlapping test showtimes (preserves all booked showtimes)
DELETE FROM SHOWTIME 
WHERE (show_id IN (15, 18) OR (show_id BETWEEN 19 AND 59))
  AND NOT EXISTS (SELECT 1 FROM BOOKING b WHERE b.show_id = SHOWTIME.show_id);

-- 5. Insert Realistic Multiplex Schedules for upcoming dates (2026-10-27 to 2026-11-03)
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '10:00:00', '12:49:00', 380.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '10:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '13:15:00', '16:01:00', 380.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '16:30:00', '19:30:00', 400.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '20:00:00', '22:49:00', 420.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '20:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '10:15:00', '13:01:00', 320.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '10:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '13:30:00', '16:02:00', 320.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '13:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '16:30:00', '18:58:00', 300.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '19:30:00', '22:02:00', 350.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '19:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '10:30:00', '12:50:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '10:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '13:15:00', '15:43:00', 320.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '16:15:00', '18:35:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '16:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '19:00:00', '21:46:00', 360.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '19:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '10:45:00', '13:13:00', 450.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '10:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '13:45:00', '16:45:00', 480.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '13:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '17:15:00', '20:04:00', 480.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '17:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-27', '20:30:00', '22:58:00', 480.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-27' 
    AND sh.start_time = '20:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '10:00:00', '12:49:00', 380.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '10:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '13:15:00', '16:01:00', 380.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '16:30:00', '19:30:00', 400.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '20:00:00', '22:49:00', 420.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '20:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '10:15:00', '13:01:00', 320.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '10:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '13:30:00', '16:02:00', 320.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '13:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '16:30:00', '18:58:00', 300.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '19:30:00', '22:02:00', 350.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '19:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '10:30:00', '12:50:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '10:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '13:15:00', '15:43:00', 320.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '16:15:00', '18:35:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '16:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '19:00:00', '21:46:00', 360.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '19:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '10:45:00', '13:13:00', 450.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '10:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '13:45:00', '16:45:00', 480.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '13:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '17:15:00', '20:04:00', 480.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '17:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-28', '20:30:00', '22:58:00', 480.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-28' 
    AND sh.start_time = '20:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '10:00:00', '12:49:00', 380.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '10:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '13:15:00', '16:01:00', 380.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '16:30:00', '19:30:00', 400.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '20:00:00', '22:49:00', 420.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '20:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '10:15:00', '13:01:00', 320.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '10:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '13:30:00', '16:02:00', 320.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '13:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '16:30:00', '18:58:00', 300.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '19:30:00', '22:02:00', 350.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '19:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '10:30:00', '12:50:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '10:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '13:15:00', '15:43:00', 320.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '16:15:00', '18:35:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '16:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '19:00:00', '21:46:00', 360.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '19:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '10:45:00', '13:13:00', 450.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '10:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '13:45:00', '16:45:00', 480.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '13:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '17:15:00', '20:04:00', 480.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '17:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-29', '20:30:00', '22:58:00', 480.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-29' 
    AND sh.start_time = '20:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '10:00:00', '12:49:00', 380.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '10:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '13:15:00', '16:01:00', 380.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '16:30:00', '19:30:00', 400.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '20:00:00', '22:49:00', 420.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '20:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '10:15:00', '13:01:00', 320.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '10:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '13:30:00', '16:02:00', 320.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '13:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '16:30:00', '18:58:00', 300.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '19:30:00', '22:02:00', 350.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '19:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '10:30:00', '12:50:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '10:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '13:15:00', '15:43:00', 320.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '16:15:00', '18:35:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '16:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '19:00:00', '21:46:00', 360.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '19:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '10:45:00', '13:13:00', 450.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '10:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '13:45:00', '16:45:00', 480.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '13:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '17:15:00', '20:04:00', 480.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '17:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-30', '20:30:00', '22:58:00', 480.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-30' 
    AND sh.start_time = '20:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '10:00:00', '12:49:00', 380.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '10:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '13:15:00', '16:01:00', 380.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '16:30:00', '19:30:00', 400.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '20:00:00', '22:49:00', 420.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '20:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '10:15:00', '13:01:00', 320.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '10:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '13:30:00', '16:02:00', 320.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '13:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '16:30:00', '18:58:00', 300.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '19:30:00', '22:02:00', 350.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '19:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '10:30:00', '12:50:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '10:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '13:15:00', '15:43:00', 320.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '16:15:00', '18:35:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '16:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '19:00:00', '21:46:00', 360.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '19:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '10:45:00', '13:13:00', 450.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '10:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '13:45:00', '16:45:00', 480.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '13:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '17:15:00', '20:04:00', 480.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '17:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-10-31', '20:30:00', '22:58:00', 480.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-10-31' 
    AND sh.start_time = '20:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '10:00:00', '12:49:00', 380.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '10:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '13:15:00', '16:01:00', 380.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '16:30:00', '19:30:00', 400.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '20:00:00', '22:49:00', 420.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '20:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '10:15:00', '13:01:00', 320.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '10:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '13:30:00', '16:02:00', 320.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '13:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '16:30:00', '18:58:00', 300.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '19:30:00', '22:02:00', 350.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '19:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '10:30:00', '12:50:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '10:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '13:15:00', '15:43:00', 320.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '16:15:00', '18:35:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '16:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '19:00:00', '21:46:00', 360.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '19:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '10:45:00', '13:13:00', 450.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '10:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '13:45:00', '16:45:00', 480.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '13:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '17:15:00', '20:04:00', 480.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '17:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-01', '20:30:00', '22:58:00', 480.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-01' 
    AND sh.start_time = '20:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '10:00:00', '12:49:00', 380.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '10:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '13:15:00', '16:01:00', 380.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '16:30:00', '19:30:00', 400.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '20:00:00', '22:49:00', 420.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '20:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '10:15:00', '13:01:00', 320.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '10:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '13:30:00', '16:02:00', 320.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '13:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '16:30:00', '18:58:00', 300.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '19:30:00', '22:02:00', 350.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '19:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '10:30:00', '12:50:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '10:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '13:15:00', '15:43:00', 320.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '16:15:00', '18:35:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '16:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '19:00:00', '21:46:00', 360.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '19:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '10:45:00', '13:13:00', 450.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '10:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '13:45:00', '16:45:00', 480.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '13:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '17:15:00', '20:04:00', 480.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '17:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-02', '20:30:00', '22:58:00', 480.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-02' 
    AND sh.start_time = '20:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '10:00:00', '12:49:00', 380.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '10:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '13:15:00', '16:01:00', 380.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '16:30:00', '19:30:00', 400.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '20:00:00', '22:49:00', 420.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 1
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '20:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '10:15:00', '13:01:00', 320.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '10:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '13:30:00', '16:02:00', 320.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '13:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '16:30:00', '18:58:00', 300.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '16:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '19:30:00', '22:02:00', 350.00, 3, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 2
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '19:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '10:30:00', '12:50:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '10:30:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '13:15:00', '15:43:00', 320.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '13:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '16:15:00', '18:35:00', 340.00, 7, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '16:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '19:00:00', '21:46:00', 360.00, 5, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 3
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '19:00:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '10:45:00', '13:13:00', 450.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '10:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '13:45:00', '16:45:00', 480.00, 4, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '13:45:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '17:15:00', '20:04:00', 480.00, 1, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '17:15:00'
);
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT '2026-11-03', '20:30:00', '22:58:00', 480.00, 2, s.screen_id
FROM SCREEN s
WHERE s.screen_number = 4
AND NOT EXISTS (
  SELECT 1 FROM SHOWTIME sh 
  WHERE sh.screen_id = s.screen_id 
    AND sh.show_date = '2026-11-03' 
    AND sh.start_time = '20:30:00'
);
