-- ============================================================================
-- SCRIPT 01: CREATE DATABASE
-- Project: Movie Theater Ticket Engine (RDBMS Lab Project)
-- Database: MovieTheaterDB
-- Description: Creates the database with UTF-8 character encoding and collation.
-- Safe execution: Checks if database exists before creating.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS MovieTheaterDB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE MovieTheaterDB;

-- Output confirmation
SELECT 'Database MovieTheaterDB created or selected successfully.' AS Status;

