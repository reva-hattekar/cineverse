/**
 * API Service for CINEVERSE Admin Portal
 */

const BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('cineverse_admin_token');
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
  // System Health
  checkHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // Admin Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('cineverse_admin_token', data.token);
      localStorage.setItem('cineverse_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('cineverse_admin_token');
    localStorage.removeItem('cineverse_admin_user');
  },

  getStoredUser: () => {
    const raw = localStorage.getItem('cineverse_admin_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Dashboard Overview
  getDashboard: async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Movie Management
  getMovies: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/admin/movies${q ? `?${q}` : ''}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  createMovie: async (movieData) => {
    const res = await fetch(`${BASE_URL}/admin/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(movieData)
    });
    return handleResponse(res);
  },

  updateMovie: async (id, movieData) => {
    const res = await fetch(`${BASE_URL}/admin/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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

  // Theaters & Screens
  getTheaters: async () => {
    const res = await fetch(`${BASE_URL}/theaters`);
    return handleResponse(res);
  },

  // Showtimes
  getShowtimes: async () => {
    const res = await fetch(`${BASE_URL}/admin/showtimes`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  createShowtime: async (showtimeData) => {
    const res = await fetch(`${BASE_URL}/admin/showtimes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(showtimeData)
    });
    return handleResponse(res);
  },

  // Seat Availability
  getShowtimeSeats: async (showId) => {
    const res = await fetch(`${BASE_URL}/showtimes/${showId}/seats`);
    return handleResponse(res);
  },

  // Bookings
  getBookings: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/admin/bookings${q ? `?${q}` : ''}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  cancelBooking: async (id) => {
    const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // Concessions & Snacks
  getSnacks: async () => {
    const res = await fetch(`${BASE_URL}/snacks`);
    return handleResponse(res);
  },

  // Customers & Loyalty
  getCustomers: async () => {
    const res = await fetch(`${BASE_URL}/customers`);
    return handleResponse(res);
  },

  // Staff Roster
  getStaff: async () => {
    const res = await fetch(`${BASE_URL}/admin/staff`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Reports
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

