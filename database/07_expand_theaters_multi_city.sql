-- ============================================================================
-- SCRIPT 07: EXPAND THEATERS TO MULTI-CITY (Jaipur, Mumbai, Delhi NCR)
-- Database: MovieTheaterDB
-- Description: Idempotent expansion adding flagship CINEVERSE venues, screens,
--              seats, and showtimes across Jaipur, Mumbai, and Delhi NCR.
-- ============================================================================

USE MovieTheaterDB;

-- 1. Insert Theaters (if not already present)
INSERT INTO THEATER (theater_name, city, address)
SELECT 'CINEVERSE Raj Mandir Luxe', 'Jaipur', 'Bhagwan Das Road, C-Scheme, Jaipur'
WHERE NOT EXISTS (SELECT 1 FROM THEATER WHERE theater_name = 'CINEVERSE Raj Mandir Luxe');

INSERT INTO THEATER (theater_name, city, address)
SELECT 'CINEVERSE Crystal Palm IMAX', 'Jaipur', 'Sardar Patel Marg, C-Scheme, Jaipur'
WHERE NOT EXISTS (SELECT 1 FROM THEATER WHERE theater_name = 'CINEVERSE Crystal Palm IMAX');

INSERT INTO THEATER (theater_name, city, address)
SELECT 'CINEVERSE Palladium Dolby Cinema', 'Mumbai', 'High Street Phoenix, Lower Parel, Mumbai'
WHERE NOT EXISTS (SELECT 1 FROM THEATER WHERE theater_name = 'CINEVERSE Palladium Dolby Cinema');

INSERT INTO THEATER (theater_name, city, address)
SELECT 'CINEVERSE Bandra Royale Luxe', 'Mumbai', 'Linking Road, Bandra West, Mumbai'
WHERE NOT EXISTS (SELECT 1 FROM THEATER WHERE theater_name = 'CINEVERSE Bandra Royale Luxe');

INSERT INTO THEATER (theater_name, city, address)
SELECT 'CINEVERSE Select Citywalk IMAX', 'Delhi NCR', 'A-3 District Centre, Saket, New Delhi'
WHERE NOT EXISTS (SELECT 1 FROM THEATER WHERE theater_name = 'CINEVERSE Select Citywalk IMAX');

INSERT INTO THEATER (theater_name, city, address)
SELECT 'CINEVERSE DLF CyberHub Laser', 'Delhi NCR', 'DLF Cyber City, Sector 24, Gurugram'
WHERE NOT EXISTS (SELECT 1 FROM THEATER WHERE theater_name = 'CINEVERSE DLF CyberHub Laser');

-- 2. Insert Screens for each new theater
-- Screen 1 & Screen 2 for each theater
INSERT INTO SCREEN (screen_number, capacity, theater_id)
SELECT 1, 20, t.theater_id
FROM THEATER t
WHERE t.theater_name IN (
    'CINEVERSE Raj Mandir Luxe',
    'CINEVERSE Crystal Palm IMAX',
    'CINEVERSE Palladium Dolby Cinema',
    'CINEVERSE Bandra Royale Luxe',
    'CINEVERSE Select Citywalk IMAX',
    'CINEVERSE DLF CyberHub Laser'
)
AND NOT EXISTS (
    SELECT 1 FROM SCREEN s WHERE s.theater_id = t.theater_id AND s.screen_number = 1
);

INSERT INTO SCREEN (screen_number, capacity, theater_id)
SELECT 2, 20, t.theater_id
FROM THEATER t
WHERE t.theater_name IN (
    'CINEVERSE Raj Mandir Luxe',
    'CINEVERSE Crystal Palm IMAX',
    'CINEVERSE Palladium Dolby Cinema',
    'CINEVERSE Bandra Royale Luxe',
    'CINEVERSE Select Citywalk IMAX',
    'CINEVERSE DLF CyberHub Laser'
)
AND NOT EXISTS (
    SELECT 1 FROM SCREEN s WHERE s.theater_id = t.theater_id AND s.screen_number = 2
);

-- 3. Insert Seats for newly created screens
-- VIP (A1..A6), Premium (B1..B8), Standard (C1..C6)
INSERT INTO SEAT (seat_number, seat_type, screen_id)
SELECT v.seat_num, v.stype, s.screen_id
FROM SCREEN s
JOIN THEATER t ON s.theater_id = t.theater_id
CROSS JOIN (
    SELECT 'A1' AS seat_num, 'VIP' AS stype UNION ALL
    SELECT 'A2', 'VIP' UNION ALL
    SELECT 'A3', 'VIP' UNION ALL
    SELECT 'A4', 'VIP' UNION ALL
    SELECT 'A5', 'VIP' UNION ALL
    SELECT 'A6', 'VIP' UNION ALL
    SELECT 'B1', 'Premium' UNION ALL
    SELECT 'B2', 'Premium' UNION ALL
    SELECT 'B3', 'Premium' UNION ALL
    SELECT 'B4', 'Premium' UNION ALL
    SELECT 'B5', 'Premium' UNION ALL
    SELECT 'B6', 'Premium' UNION ALL
    SELECT 'B7', 'Premium' UNION ALL
    SELECT 'B8', 'Premium' UNION ALL
    SELECT 'C1', 'Standard' UNION ALL
    SELECT 'C2', 'Standard' UNION ALL
    SELECT 'C3', 'Standard' UNION ALL
    SELECT 'C4', 'Standard' UNION ALL
    SELECT 'C5', 'Standard' UNION ALL
    SELECT 'C6', 'Standard'
) v
WHERE t.city IN ('Jaipur', 'Mumbai', 'Delhi NCR')
AND NOT EXISTS (
    SELECT 1 FROM SEAT st WHERE st.screen_id = s.screen_id AND st.seat_number = v.seat_num
);

-- 4. Insert Showtimes for existing movies (1 to 5, 7) across newly created screens
-- Interstellar (1), Inception (2), The Dark Knight (3), Oppenheimer (4), Dune: Part Two (5), Spider-Man (7)
INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT 
    '2026-10-28', '11:00:00', '14:00:00', 320.00, 1, s.screen_id
FROM SCREEN s
JOIN THEATER t ON s.theater_id = t.theater_id
WHERE t.city IN ('Jaipur', 'Mumbai', 'Delhi NCR') AND s.screen_number = 1
AND NOT EXISTS (
    SELECT 1 FROM SHOWTIME sh WHERE sh.screen_id = s.screen_id AND sh.movie_id = 1 AND sh.start_time = '11:00:00' AND sh.show_date = '2026-10-28'
);

INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT 
    '2026-10-28', '15:30:00', '18:30:00', 350.00, 5, s.screen_id
FROM SCREEN s
JOIN THEATER t ON s.theater_id = t.theater_id
WHERE t.city IN ('Jaipur', 'Mumbai', 'Delhi NCR') AND s.screen_number = 1
AND NOT EXISTS (
    SELECT 1 FROM SHOWTIME sh WHERE sh.screen_id = s.screen_id AND sh.movie_id = 5 AND sh.start_time = '15:30:00' AND sh.show_date = '2026-10-28'
);

INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT 
    '2026-10-28', '19:45:00', '22:45:00', 400.00, 3, s.screen_id
FROM SCREEN s
JOIN THEATER t ON s.theater_id = t.theater_id
WHERE t.city IN ('Jaipur', 'Mumbai', 'Delhi NCR') AND s.screen_number = 1
AND NOT EXISTS (
    SELECT 1 FROM SHOWTIME sh WHERE sh.screen_id = s.screen_id AND sh.movie_id = 3 AND sh.start_time = '19:45:00' AND sh.show_date = '2026-10-28'
);

INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT 
    '2026-10-29', '10:30:00', '13:30:00', 280.00, 2, s.screen_id
FROM SCREEN s
JOIN THEATER t ON s.theater_id = t.theater_id
WHERE t.city IN ('Jaipur', 'Mumbai', 'Delhi NCR') AND s.screen_number = 2
AND NOT EXISTS (
    SELECT 1 FROM SHOWTIME sh WHERE sh.screen_id = s.screen_id AND sh.movie_id = 2 AND sh.start_time = '10:30:00' AND sh.show_date = '2026-10-29'
);

INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT 
    '2026-10-29', '14:30:00', '17:30:00', 380.00, 4, s.screen_id
FROM SCREEN s
JOIN THEATER t ON s.theater_id = t.theater_id
WHERE t.city IN ('Jaipur', 'Mumbai', 'Delhi NCR') AND s.screen_number = 2
AND NOT EXISTS (
    SELECT 1 FROM SHOWTIME sh WHERE sh.screen_id = s.screen_id AND sh.movie_id = 4 AND sh.start_time = '14:30:00' AND sh.show_date = '2026-10-29'
);

INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id)
SELECT 
    '2026-10-29', '19:00:00', '21:45:00', 340.00, 7, s.screen_id
FROM SCREEN s
JOIN THEATER t ON s.theater_id = t.theater_id
WHERE t.city IN ('Jaipur', 'Mumbai', 'Delhi NCR') AND s.screen_number = 2
AND NOT EXISTS (
    SELECT 1 FROM SHOWTIME sh WHERE sh.screen_id = s.screen_id AND sh.movie_id = 7 AND sh.start_time = '19:00:00' AND sh.show_date = '2026-10-29'
);
