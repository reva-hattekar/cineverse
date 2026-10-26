const express = require('express');
const router = express.Router();

const { checkDbConnection } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const movieController = require('../controllers/movieController');
const theaterController = require('../controllers/theaterController');
const showtimeController = require('../controllers/showtimeController');
const bookingController = require('../controllers/bookingController');
const customerController = require('../controllers/customerController');
const snackController = require('../controllers/snackController');
const reportController = require('../controllers/reportController');
const adminController = require('../controllers/adminController');
const tmdbController = require('../controllers/tmdbController');

// ============================================================================
// SYSTEM & HEALTH CHECK
// ============================================================================
router.get('/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.json({
    status: 'ONLINE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// ============================================================================
// TMDB PROXY & MOVIE ARTWORK
// ============================================================================
router.get('/tmdb/upcoming', tmdbController.getUpcomingReleases);
router.get('/tmdb/search', tmdbController.searchTmdbArtwork);

// ============================================================================
// PUBLIC MOVIE ROUTES
// ============================================================================
router.get('/movies', movieController.getAllMovies);
router.get('/movies/:id', movieController.getMovieById);
router.get('/movies/:id/showtimes', movieController.getMovieShowtimes);

// ============================================================================
// THEATER & SEAT ROUTES
// ============================================================================
router.get('/theaters', theaterController.getAllTheaters);
router.get('/showtimes/:id/seats', showtimeController.getShowtimeSeats);

// ============================================================================
// SNACK & CONCESSION ROUTES
// ============================================================================
router.get('/snacks', snackController.getAllSnacks);

// ============================================================================
// BOOKING ROUTES
// ============================================================================
router.get('/bookings', bookingController.getAllBookings);
router.get('/bookings/:id', bookingController.getBookingById);
router.post('/bookings', bookingController.createBooking);
router.post('/bookings/:id/cancel', bookingController.cancelBooking);

// ============================================================================
// CUSTOMER ROUTES
// ============================================================================
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/:id/bookings', customerController.getCustomerBookings);

// ============================================================================
// REPORT ROUTES (Protected for Staff / Admin)
// ============================================================================
router.get('/reports/revenue', authenticateToken, reportController.getRevenueReport);
router.get('/reports/popular-movies', authenticateToken, reportController.getPopularMoviesReport);

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================
router.post('/admin/login', adminController.adminLogin);

// ============================================================================
// ADMIN MANAGEMENT ROUTES (Protected by authenticateToken)
// ============================================================================
router.get('/admin/dashboard', authenticateToken, adminController.getAdminDashboard);

// Admin Movie CRUD
router.get('/admin/movies', authenticateToken, movieController.getAllMovies);
router.post('/admin/movies', authenticateToken, requireRole('Admin', 'Manager'), movieController.adminCreateMovie);
router.put('/admin/movies/:id', authenticateToken, requireRole('Admin', 'Manager'), movieController.adminUpdateMovie);
router.delete('/admin/movies/:id', authenticateToken, requireRole('Admin', 'Manager'), movieController.adminDeleteMovie);

// Admin Showtimes
router.get('/admin/showtimes', authenticateToken, showtimeController.getAllShowtimes);
router.post('/admin/showtimes', authenticateToken, requireRole('Admin', 'Manager'), showtimeController.adminCreateShowtime);

// Admin Bookings & Staff
router.get('/admin/bookings', authenticateToken, bookingController.getAllBookings);
router.get('/admin/staff', authenticateToken, adminController.getAdminStaff);

module.exports = router;

