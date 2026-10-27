import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import OverviewView from './views/OverviewView';
import MoviesView from './views/MoviesView';
import HeroTrailersView from './views/HeroTrailersView';
import TheatersView from './views/TheatersView';
import ShowtimesView from './views/ShowtimesView';
import SeatAvailabilityView from './views/SeatAvailabilityView';
import BookingsView from './views/BookingsView';
import PaymentsView from './views/PaymentsView';
import SnacksView from './views/SnacksView';
import CustomersView from './views/CustomersView';
import StaffView from './views/StaffView';
import ReportsView from './views/ReportsView';
import NotFoundView from './views/NotFoundView';
import { api } from './services/api';

export default function App() {
  const [adminUser, setAdminUser] = useState(() => api.getStoredUser());
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [notification, setNotification] = useState(null);

  // Management Data states
  const [metrics, setMetrics] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = api.getStoredUser();
    if (user) {
      setAdminUser(user);
    }
    checkHealth();
  }, []);

  const currentPath = location.pathname;

  useEffect(() => {
    if (adminUser) {
      loadRouteData(currentPath);
    }
  }, [adminUser, currentPath]);

  const checkHealth = async () => {
    try {
      const res = await api.checkHealth();
      setSystemHealth(res);
    } catch {
      setSystemHealth({ database: { connected: false } });
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadRouteData = async (path) => {
    setLoading(true);
    try {
      if (path === '/overview' || path === '/') {
        const res = await api.getDashboard();
        if (res.success) setMetrics(res.data);
      } else if (path === '/movies') {
        const res = await api.getMovies();
        if (res.success) setMovies(res.data);
      } else if (path === '/theaters') {
        const res = await api.getTheaters();
        if (res.success) setTheaters(res.data);
      } else if (path === '/showtimes') {
        const [shows, movs, ths] = await Promise.all([
          api.getShowtimes(),
          api.getMovies(),
          api.getTheaters()
        ]);
        if (shows.success) setShowtimes(shows.data);
        if (movs.success) setMovies(movs.data);
        if (ths.success) setTheaters(ths.data);
      } else if (path === '/seats') {
        const shows = await api.getShowtimes();
        if (shows.success) setShowtimes(shows.data);
      } else if (path === '/bookings' || path === '/payments') {
        const res = await api.getBookings();
        if (res.success) setBookings(res.data);
      } else if (path === '/snacks') {
        const res = await api.getSnacks();
        if (res.success) setSnacks(res.data);
      } else if (path === '/customers') {
        const res = await api.getCustomers();
        if (res.success) setCustomers(res.data);
      } else if (path === '/staff') {
        const res = await api.getStaff();
        if (res.success) setStaff(res.data);
      } else if (path === '/reports') {
        const [rev, pop] = await Promise.all([
          api.getRevenueReport(),
          api.getPopularMoviesReport()
        ]);
        if (rev.success) setRevenueReport(rev.data);
        if (pop.success) setPopularMovies(pop.data);
      }
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        api.logout();
        setAdminUser(null);
        showNotification('Staff session expired. Please sign in again.', 'error');
      } else {
        showNotification(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    // If the user arrived at a specific route or login, preserve or restore it
    if (location.pathname === '/login' || location.pathname === '/') {
      navigate('/overview');
    }
  };

  const handleLogout = () => {
    api.logout();
    setAdminUser(null);
    navigate('/login');
  };

  const routeTitles = {
    '/overview': 'Operations Overview',
    '/movies': 'Movie Catalog Management',
    '/theaters': 'Cinemas & Auditoriums',
    '/showtimes': 'Showtime Programming',
    '/seats': 'Seat Availability Map',
    '/bookings': 'Bookings & Reservations',
    '/payments': 'Financial Payment Audit',
    '/snacks': 'Concessions & F&B Inventory',
    '/customers': 'Customer Accounts & Loyalty',
    '/staff': 'Staff Access Control',
    '/reports': 'Revenue & Performance Analytics'
  };

  if (!adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} returnPath={currentPath !== '/login' ? currentPath : '/overview'} />;
  }

  const activeTitle = routeTitles[currentPath] || 'Cinema Management';

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader
          activeTitle={activeTitle}
          adminUser={adminUser}
          onLogout={handleLogout}
          systemHealth={systemHealth}
        />

        <div className="admin-content">
          {notification && (
            <div className={`alert-banner ${notification.type}`}>
              <span>{notification.msg}</span>
              <button
                onClick={() => setNotification(null)}
                style={{ background: 'none', color: 'inherit', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/login" element={<Navigate to="/overview" replace />} />
            <Route
              path="/overview"
              element={
                <OverviewView
                  metrics={metrics}
                  loading={loading}
                  onNavigate={(path) => navigate(path)}
                />
              }
            />
            <Route
              path="/movies"
              element={
                <MoviesView
                  movies={movies}
                  onRefresh={() => loadRouteData('/movies')}
                  showNotification={showNotification}
                />
              }
            />
            <Route
              path="/hero-trailers"
              element={
                <HeroTrailersView
                  onNavigate={(path) => navigate(path)}
                />
              }
            />
            <Route
              path="/theaters"
              element={<TheatersView theaters={theaters} />}
            />
            <Route
              path="/showtimes"
              element={
                <ShowtimesView
                  showtimes={showtimes}
                  movies={movies}
                  theaters={theaters}
                  onRefresh={() => loadRouteData('/showtimes')}
                  showNotification={showNotification}
                />
              }
            />
            <Route
              path="/seats"
              element={
                <SeatAvailabilityView
                  showtimes={showtimes}
                  showNotification={showNotification}
                />
              }
            />
            <Route
              path="/bookings"
              element={
                <BookingsView
                  bookings={bookings}
                  onRefresh={() => loadRouteData('/bookings')}
                  showNotification={showNotification}
                />
              }
            />
            <Route
              path="/payments"
              element={<PaymentsView bookings={bookings} />}
            />
            <Route
              path="/snacks"
              element={<SnacksView snacks={snacks} />}
            />
            <Route
              path="/customers"
              element={<CustomersView customers={customers} />}
            />
            <Route
              path="/staff"
              element={<StaffView staff={staff} />}
            />
            <Route
              path="/reports"
              element={
                <ReportsView
                  revenueReport={revenueReport}
                  popularMovies={popularMovies}
                />
              }
            />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
