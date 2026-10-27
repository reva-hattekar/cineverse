-- ============================================================================
-- SCRIPT 11: ADD MOVIE TRAILERS & HERO TRAILER SLOTS MANAGEMENT
-- Project: CINEVERSE Movie Theater Ticket Engine
-- Database: MovieTheaterDB
-- Description: Adds trailer_url to MOVIE table and creates HERO_TRAILER_SLOT table.
--              Backward-compatible, idempotent, and rerunnable.
-- NOTE: Do not run automatically; apply manually when ready to update schema:
--       mysql -u root -p MovieTheaterDB < database/11_add_movie_trailer_and_hero_settings.sql
-- ============================================================================

USE MovieTheaterDB;

-- 1. Check and add release_date column (DATE NULL) if not exists
SET @exist_release_date := (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'MovieTheaterDB' 
      AND TABLE_NAME = 'MOVIE' 
      AND COLUMN_NAME = 'release_date'
);
SET @sql_release_date := IF(@exist_release_date = 0, 
    'ALTER TABLE MOVIE ADD COLUMN release_date DATE NULL AFTER rating', 
    'SELECT "release_date column already exists in MOVIE" AS Status'
);
PREPARE stmt_date FROM @sql_release_date;
EXECUTE stmt_date;
DEALLOCATE PREPARE stmt_date;

-- 2. Check and add release_status column if not exists
SET @exist_release_status := (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'MovieTheaterDB' 
      AND TABLE_NAME = 'MOVIE' 
      AND COLUMN_NAME = 'release_status'
);
SET @sql_release_status := IF(@exist_release_status = 0, 
    'ALTER TABLE MOVIE ADD COLUMN release_status ENUM(\'Now Showing\', \'Coming Soon\', \'Ended\') NOT NULL DEFAULT \'Now Showing\' AFTER release_date', 
    'SELECT "release_status column already exists in MOVIE" AS Status'
);
PREPARE stmt_status FROM @sql_release_status;
EXECUTE stmt_status;
DEALLOCATE PREPARE stmt_status;

-- 3. Check and add trailer_url column (VARCHAR(500) NULL)
SET @exist_trailer_url := (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'MovieTheaterDB' 
      AND TABLE_NAME = 'MOVIE' 
      AND COLUMN_NAME = 'trailer_url'
);
SET @sql_trailer_url := IF(@exist_trailer_url = 0, 
    'ALTER TABLE MOVIE ADD COLUMN trailer_url VARCHAR(500) NULL AFTER backdrop_url', 
    'SELECT "trailer_url column already exists in MOVIE" AS Status'
);
PREPARE stmt_trailer FROM @sql_trailer_url;
EXECUTE stmt_trailer;
DEALLOCATE PREPARE stmt_trailer;

-- 4. Create HERO_TRAILER_SLOT table for admin overrides and slot configuration
CREATE TABLE IF NOT EXISTS HERO_TRAILER_SLOT (
    slot_id INT PRIMARY KEY,
    slot_type ENUM('latest', 'coming_soon') NOT NULL,
    slot_label VARCHAR(100) NOT NULL,
    override_movie_id INT NULL,
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (override_movie_id) REFERENCES MOVIE(movie_id) ON DELETE SET NULL
);

-- Seed initial 4 slots
INSERT IGNORE INTO HERO_TRAILER_SLOT (slot_id, slot_type, slot_label, override_movie_id, is_manual) VALUES
(1, 'latest', 'Slot 1: Latest Release', NULL, FALSE),
(2, 'latest', 'Slot 2: Latest Release', NULL, FALSE),
(3, 'latest', 'Slot 3: Latest Release', NULL, FALSE),
(4, 'coming_soon', 'Slot 4: Coming Soon Spotlight', NULL, FALSE);

-- 5. Seed baseline release dates & verified official YouTube trailers for catalog
-- Oppenheimer
UPDATE MOVIE 
SET release_date = COALESCE(release_date, '2026-10-01'),
    release_status = 'Now Showing',
    trailer_url = COALESCE(trailer_url, 'https://www.youtube.com/watch?v=uYPbbksJxIg')
WHERE title LIKE '%Oppenheimer%';

-- Interstellar
UPDATE MOVIE 
SET release_date = COALESCE(release_date, '2026-09-15'),
    release_status = 'Now Showing',
    trailer_url = COALESCE(trailer_url, 'https://www.youtube.com/watch?v=zSWdZVtXT7E')
WHERE title LIKE '%Interstellar%';

-- The Dark Knight
UPDATE MOVIE 
SET release_date = COALESCE(release_date, '2026-08-01'),
    release_status = 'Now Showing',
    trailer_url = COALESCE(trailer_url, 'https://www.youtube.com/watch?v=EXeTwQWrcwY')
WHERE title LIKE '%Dark Knight%';

-- Dune: Part Two
UPDATE MOVIE 
SET release_date = COALESCE(release_date, '2026-07-20'),
    release_status = 'Now Showing',
    trailer_url = COALESCE(trailer_url, 'https://www.youtube.com/watch?v=Way9Dexny3w')
WHERE title LIKE '%Dune%';

-- Spider-Man: Across the Spider-Verse
UPDATE MOVIE 
SET release_date = COALESCE(release_date, '2026-06-10'),
    release_status = 'Now Showing',
    trailer_url = COALESCE(trailer_url, 'https://www.youtube.com/watch?v=cqGjhVJWtEg')
WHERE title LIKE '%Across the Spider-Verse%';

-- Inception
UPDATE MOVIE 
SET release_date = COALESCE(release_date, '2026-05-15'),
    release_status = 'Now Showing',
    trailer_url = COALESCE(trailer_url, 'https://www.youtube.com/watch?v=YoHD9XEInc0')
WHERE title LIKE '%Inception%';

-- Avengers: Doomsday (Genuine Upcoming Release: Dec 18, 2026)
UPDATE MOVIE 
SET release_date = '2026-12-18',
    release_status = 'Coming Soon',
    trailer_url = COALESCE(trailer_url, 'https://www.youtube.com/watch?v=hA6hldpSTF8')
WHERE title LIKE '%Avengers: Doomsday%';

-- Spider-Man: Brand New Day (Genuine Upcoming Release: Nov 27, 2026)
UPDATE MOVIE 
SET release_date = '2026-11-27',
    release_status = 'Coming Soon',
    trailer_url = COALESCE(trailer_url, 'https://www.youtube.com/watch?v=rt-2cxAiPJk')
WHERE title LIKE '%Brand New Day%';

-- Verification queries
SELECT movie_id, title, rating, release_date, release_status, trailer_url 
FROM MOVIE 
ORDER BY movie_id ASC;

SELECT * FROM HERO_TRAILER_SLOT;

