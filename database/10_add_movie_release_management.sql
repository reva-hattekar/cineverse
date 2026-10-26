-- ============================================================================
-- SCRIPT 10: ADD MOVIE RELEASE MANAGEMENT & SCHEDULING METADATA
-- Project: CINEVERSE Movie Theater Ticket Engine
-- Database: MovieTheaterDB
-- Description: Adds release_date and release_status columns to MOVIE table.
--              Backward-compatible and rerunnable (safe to execute multiple times).
--              Preserves all existing tables, foreign keys, and records.
-- NOTE: Do not run automatically; apply manually when ready to update schema.
-- ============================================================================

USE MovieTheaterDB;

-- 1. Check and add release_date column (DATE NULL)
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

-- 2. Check and add release_status column (ENUM with safe default 'Now Showing')
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

-- 3. Populate baseline release dates & statuses for existing catalog
-- Movies with active screenings are marked 'Now Showing'
UPDATE MOVIE 
SET release_status = 'Now Showing',
    release_date = COALESCE(release_date, '2026-10-01')
WHERE movie_id IN (
    SELECT DISTINCT movie_id FROM SHOWTIME
);

-- Movies without showtimes default to 'Coming Soon' if release_date is null or upcoming
UPDATE MOVIE 
SET release_status = 'Coming Soon',
    release_date = COALESCE(release_date, '2026-11-15')
WHERE movie_id NOT IN (
    SELECT DISTINCT movie_id FROM SHOWTIME
) AND (release_status IS NULL OR release_status = 'Now Showing');

-- Verification query
SELECT movie_id, title, genre, rating, release_date, release_status 
FROM MOVIE 
ORDER BY movie_id ASC;
