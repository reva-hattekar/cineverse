/**
 * API Service for CINEVERSE Customer Experience
 */

const BASE_URL = '/api';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || data.error || `HTTP ${res.status}: ${res.statusText}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Public Movies Catalog
  getMovies: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/movies${q ? `?${q}` : ''}`);
    return handleResponse(res);
  },

  getMovieById: async (id) => {
    const res = await fetch(`${BASE_URL}/movies/${id}`);
    return handleResponse(res);
  },

  getMovieShowtimes: async (id, params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/movies/${id}/showtimes${q ? `?${q}` : ''}`);
    return handleResponse(res);
  },

  // Theaters
  getTheaters: async () => {
    const res = await fetch(`${BASE_URL}/theaters`);
    return handleResponse(res);
  },

  // Showtime Seats & Live Availability
  getShowtimeSeats: async (showId) => {
    const res = await fetch(`${BASE_URL}/showtimes/${showId}/seats`);
    return handleResponse(res);
  },

  // Concessions & Snacks
  getSnacks: async () => {
    const res = await fetch(`${BASE_URL}/snacks`);
    return handleResponse(res);
  },

  // Transactional Booking Creation
  createBooking: async (payload) => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Booking Cancellation & Seat Release
  cancelBooking: async (bookingId) => {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // Customer Profiles & Booking History
  getCustomers: async () => {
    const res = await fetch(`${BASE_URL}/customers`);
    return handleResponse(res);
  },

  getCustomerBookings: async (customerId) => {
    const res = await fetch(`${BASE_URL}/customers/${customerId}/bookings`);
    return handleResponse(res);
  },

  // Dynamic Hero Slots
  getHeroSlots: async () => {
    const res = await fetch(`${BASE_URL}/hero/slots`);
    return handleResponse(res);
  },

  // TMDB Proxy (Upcoming Releases)
  getUpcomingReleases: async () => {
    const res = await fetch(`${BASE_URL}/tmdb/upcoming`);
    return handleResponse(res);
  }
};

