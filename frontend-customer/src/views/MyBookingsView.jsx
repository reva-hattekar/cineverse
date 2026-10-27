import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Film,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

/**
 * Format date string into readable Indian theatrical date (e.g., "Tue, 27 Oct 2026")
 */
function formatScreeningDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format 24-hour time "14:00:00" into 12-hour "2:00 PM"
 */
function formatScreeningTime(timeStr) {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeStr;
  } catch {
    return timeStr;
  }
}

export default function MyBookingsView({ currentCustomer, onBookNew, movies = [] }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (currentCustomer) {
      loadBookings();
    }
  }, [currentCustomer]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomerBookings(currentCustomer.customer_id);
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      setNotification({ msg: 'Failed to load booking history.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (b) => {
    if (
      !window.confirm(
        `Cancel Booking #${b.booking_id} for "${b.movie_title}"? Your reserved seats will be released.`
      )
    ) {
      return;
    }
    try {
      const res = await api.cancelBooking(b.booking_id);
      setNotification({ msg: res.message || 'Ticket cancelled successfully.', type: 'success' });
      loadBookings();
    } catch (err) {
      setNotification({ msg: err.message || 'Cancellation failed.', type: 'error' });
    }
  };

  return (
    <div className="journal-viewport">
      {/* Ambient background wine-red glow */}
      <div className="journal-ambient-glow" aria-hidden="true" />

      {/* Page Header */}
      <header className="journal-header">
        <div className="journal-header-text">
          <div className="journal-eyebrow">
            <span className="journal-eyebrow-dot" />
            <span>Theatrical Reservations & Passes</span>
          </div>
          <h1 className="journal-title">Your Cinema Journal</h1>
          <p className="journal-subtitle">
            Active screening passes, reserved seats, and verified ticket history for{' '}
            <span className="journal-customer-pill">{currentCustomer?.customer_name || 'Guest'}</span>.
          </p>
        </div>

        <button className="journal-book-btn" onClick={onBookNew}>
          <Ticket size={16} />
          <span>Book More Tickets</span>
        </button>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`journal-banner ${
            notification.type === 'success' ? 'journal-banner-success' : 'journal-banner-error'
          }`}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notification.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{notification.msg}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="journal-banner-close"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} color="var(--accent-red)" style={{ animation: 'spin 3s linear infinite', marginBottom: '12px' }} />
          <p style={{ fontSize: '0.9rem', letterSpacing: '0.04em' }}>Retrieving your cinema passes...</p>
        </div>
      ) : bookings.length === 0 ? (
        /* Empty State */
        <div className="journal-empty-card">
          <div className="journal-empty-icon-ring">
            <Ticket size={34} />
          </div>
          <h2 className="journal-empty-title">Your Cinema Journal is Empty</h2>
          <p className="journal-empty-desc">
            You haven't reserved any cinematic experiences yet. Explore what's playing across our
            state-of-the-art IMAX and artisanal laser auditoriums.
          </p>
          <button className="journal-book-btn" onClick={onBookNew} style={{ margin: '0 auto' }}>
            <span>Explore Now Showing</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        /* Bookings Tickets List */
        <div className="journal-tickets-list">
          {bookings.map((b) => {
            const isConfirmed = b.booking_status === 'CONFIRMED';
            const matchedMovie = movies.find(
              (m) =>
                m.movie_id === b.movie_id ||
                m.title?.toLowerCase() === b.movie_title?.toLowerCase()
            );
            const posterUrl = matchedMovie?.poster_url || matchedMovie?.backdrop_url;

            const seatTokens = (b.seats || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);

            return (
              <article
                key={b.booking_id}
                className={`cinema-ticket-card ${!isConfirmed ? 'is-cancelled' : ''}`}
                aria-label={`Ticket #${b.booking_id} for ${b.movie_title}`}
              >
                {/* 1. Left Poster Thumbnail / Artwork */}
                <div className="ticket-poster-wrap">
                  {posterUrl ? (
                    <>
                      <img
                        src={posterUrl}
                        alt={b.movie_title}
                        className="ticket-poster-img"
                        loading="lazy"
                      />
                      <div className="ticket-poster-vignette" />
                    </>
                  ) : (
                    <div className="ticket-poster-fallback">
                      <Film size={26} />
                      <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 700 }}>
                        CINEVERSE
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Middle Main Ticket Body */}
                <div className="ticket-content-body">
                  {/* Top Reference & Status Row */}
                  <div className="ticket-meta-header">
                    <span className="ticket-booking-ref">
                      #BKG-{String(b.booking_id).padStart(4, '0')}
                    </span>

                    <span
                      className={`ticket-status-badge ${
                        isConfirmed ? 'badge-confirmed' : 'badge-cancelled'
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>CONFIRMED</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          <span>CANCELLED</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Movie Title & Genre */}
                  <div>
                    <h2 className="ticket-movie-title">
                      {b.movie_title}
                      {(b.genre || matchedMovie?.genre) && (
                        <span className="ticket-movie-genre">
                          • {b.genre || matchedMovie?.genre}
                        </span>
                      )}
                    </h2>
                  </div>

                  {/* Screening Schedule & Venue Metadata */}
                  <div className="ticket-screenings-grid">
                    <div className="ticket-detail-item">
                      <Calendar size={13} className="ticket-detail-icon" />
                      <span>{formatScreeningDate(b.show_date)}</span>
                    </div>

                    <div className="ticket-detail-item">
                      <Clock size={13} className="ticket-detail-icon" />
                      <span>{formatScreeningTime(b.start_time)}</span>
                    </div>

                    <div className="ticket-detail-item">
                      <MapPin size={13} className="ticket-detail-icon" />
                      <span>
                        {b.theater_name} (Screen {b.screen_number})
                      </span>
                    </div>
                  </div>

                  {/* Reserved Seat Chips */}
                  <div className="ticket-seats-row">
                    <span className="ticket-seats-label">Reserved Seats:</span>
                    {seatTokens.length > 0 ? (
                      seatTokens.map((seat) => (
                        <span key={seat} className="ticket-seat-pill">
                          {seat}
                        </span>
                      ))
                    ) : (
                      <span className="ticket-seat-pill">Assigned</span>
                    )}
                  </div>
                </div>

                {/* 3. Ticket Perforated Divider */}
                <div className="ticket-divider-wrap" aria-hidden="true">
                  <div className="ticket-notch ticket-notch-top" />
                  <div className="ticket-perforation-line" />
                  <div className="ticket-notch ticket-notch-bottom" />
                </div>

                {/* 4. Right Ticket Stub (Payment & Actions) */}
                <div className="ticket-stub-section">
                  <div className="ticket-total-box">
                    <span className="ticket-total-label">TOTAL PAID</span>
                    <div className="ticket-total-amount">
                      <span className="ticket-currency-symbol">₹</span>
                      {parseFloat(b.total_amount).toFixed(2)}
                    </div>
                    <span className="ticket-payment-meta">
                      {b.payment_method || 'UPI'} • {b.payment_status || (isConfirmed ? 'COMPLETED' : 'REFUNDED')}
                    </span>
                  </div>

                  {isConfirmed ? (
                    <button
                      className="ticket-cancel-action-btn"
                      onClick={() => handleCancelBooking(b)}
                      title={`Cancel ticket #${b.booking_id}`}
                    >
                      <XCircle size={13} />
                      <span>Cancel Ticket</span>
                    </button>
                  ) : (
                    <div className="ticket-cancelled-badge-note">
                      Seats Released • Refunded
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
