/**
 * API Client Service for Movie Theater Ticket Engine
 */

const BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('cineticket_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
  // Health
  checkHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // Movies (Public)
  getMovies: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/movies${query ? `?${query}` : ''}`);
    return handleResponse(res);
  },

  getMovieById: async (id) => {
    const res = await fetch(`${BASE_URL}/movies/${id}`);
    return handleResponse(res);
  },

  getMovieShowtimes: async (id) => {
    const res = await fetch(`${BASE_URL}/movies/${id}/showtimes`);
    return handleResponse(res);
  },

  // Theaters & Screens
  getTheaters: async () => {
    const res = await fetch(`${BASE_URL}/theaters`);
    return handleResponse(res);
  },

  // Showtime Seats & Live Availability
  getShowtimeSeats: async (showId) => {
    const res = await fetch(`${BASE_URL}/showtimes/${showId}/seats`);
    return handleResponse(res);
  },

  // Snacks & Concessions
  getSnacks: async () => {
    const res = await fetch(`${BASE_URL}/snacks`);
    return handleResponse(res);
  },

  // Bookings
  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/bookings${query ? `?${query}` : ''}`);
    return handleResponse(res);
  },

  getBookingById: async (id) => {
    const res = await fetch(`${BASE_URL}/bookings/${id}`);
    return handleResponse(res);
  },

  createBooking: async (bookingPayload) => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    return handleResponse(res);
  },

  cancelBooking: async (id) => {
    const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // Customers
  getCustomers: async () => {
    const res = await fetch(`${BASE_URL}/customers`);
    return handleResponse(res);
  },

  getCustomerBookings: async (customerId) => {
    const res = await fetch(`${BASE_URL}/customers/${customerId}/bookings`);
    return handleResponse(res);
  },

  // Admin Auth
  adminLogin: async (email, password) => {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('cineticket_admin_token', data.token);
      localStorage.setItem('cineticket_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  adminLogout: () => {
    localStorage.removeItem('cineticket_admin_token');
    localStorage.removeItem('cineticket_admin_user');
  },

  getStoredAdminUser: () => {
    const raw = localStorage.getItem('cineticket_admin_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Admin Protected Routes
  getAdminDashboard: async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  getAdminMovies: async () => {
    const res = await fetch(`${BASE_URL}/admin/movies`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  createMovie: async (movieData) => {
    const res = await fetch(`${BASE_URL}/admin/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(movieData)
    });
    return handleResponse(res);
  },

  updateMovie: async (id, movieData) => {
    const res = await fetch(`${BASE_URL}/admin/movies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(movieData)
    });
    return handleResponse(res);
  },

  deleteMovie: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/movies/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  getAdminShowtimes: async () => {
    const res = await fetch(`${BASE_URL}/admin/showtimes`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  createShowtime: async (showtimeData) => {
    const res = await fetch(`${BASE_URL}/admin/showtimes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(showtimeData)
    });
    return handleResponse(res);
  },

  getAdminStaff: async () => {
    const res = await fetch(`${BASE_URL}/admin/staff`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  getRevenueReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/revenue`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  getPopularMoviesReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/popular-movies`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  }
};

