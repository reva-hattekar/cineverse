-- ============================================================================
-- SCRIPT 06: ADD MOVIE ARTWORK & METADATA (BACKWARD-COMPATIBLE MIGRATION)
-- Project: Movie Theater Ticket Engine (CINEVERSE)
-- Database: MovieTheaterDB
-- Description: Adds optional poster_url and backdrop_url columns to MOVIE table.
--              Preserves all existing data, foreign keys, and constraints.
-- ============================================================================

USE MovieTheaterDB;

-- Add poster_url and backdrop_url columns if they don't already exist
SET @exist_poster := (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'MovieTheaterDB' 
      AND TABLE_NAME = 'MOVIE' 
      AND COLUMN_NAME = 'poster_url'
);

SET @sql_poster := IF(@exist_poster = 0, 
    'ALTER TABLE MOVIE ADD COLUMN poster_url VARCHAR(500) NULL AFTER rating, ADD COLUMN backdrop_url VARCHAR(500) NULL AFTER poster_url', 
    'SELECT "poster_url already exists" AS Info'
);

PREPARE stmt FROM @sql_poster;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Populate verified TMDB official image paths for the seeded 10 movies
UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/rAiYTsqJJR0KP8UN8vJjZHa820g.jpg'
WHERE title = 'Interstellar';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg'
WHERE title = 'Inception';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg'
WHERE title = 'The Dark Knight';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/fm6K9vYI7vmvup4Q9Z69gtv20ec.jpg'
WHERE title = 'Oppenheimer';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b22.jpg'
WHERE title = 'Dune: Part Two';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg'
WHERE title = 'Spirited Away';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg'
WHERE title = 'Spider-Man: Across the Spider-Verse';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/l0G1f98W9Uf09n7Z99o25Z0xH2Y.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/bKxiL9421rTLIR15UM8tR31NsT6.jpg'
WHERE title = 'Kantara';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0ye21lgdp.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg'
WHERE title = 'RRR';

UPDATE MOVIE SET 
  poster_url = 'https://image.tmdb.org/t/p/w500/66A9MqX3ZII6WllW0bF6k86259f.jpg',
  backdrop_url = 'https://image.tmdb.org/t/p/original/u7kuU3W79afz7k4tG6L35p53kU0.jpg'
WHERE title = '3 Idiots';

SELECT movie_id, title, rating, poster_url, backdrop_url FROM MOVIE LIMIT 5;

