import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, Clock, MapPin, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function MyBookingsView({ currentCustomer, onBookNew }) {
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
        setBookings(res.data);
      }
    } catch (err) {
      setNotification({ msg: 'Failed to load booking history.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (b) => {
    if (!window.confirm(`Cancel Booking #${b.booking_id} for "${b.movie_title}"? Your reserved seats will be released.`)) return;
    try {
      const res = await api.cancelBooking(b.booking_id);
      setNotification({ msg: res.message, type: 'success' });
      loadBookings();
    } catch (err) {
      setNotification({ msg: err.message || 'Cancellation failed.', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>My Booking History</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Reservations and active tickets for {currentCustomer?.customer_name}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onBookNew}>
          <Ticket size={16} /> Book More Tickets
        </button>
      </div>

      {notification && (
        <div style={{
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: notification.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', color: 'inherit' }}>✕</button>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div style={{
          background: '#121829',
          border: '1px solid #1c2438',
          borderRadius: '14px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Ticket size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>No Active Bookings</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '8px 0 20px' }}>
            You haven't booked any movie tickets yet. Explore now showing titles to reserve your seat!
          </p>
          <button className="btn btn-primary" onClick={onBookNew}>
            Browse Movies
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {bookings.map(b => {
            const isConfirmed = b.booking_status === 'CONFIRMED';
            return (
              <div
                key={b.booking_id}
                style={{
                  background: '#121829',
                  border: '1px solid #1c2438',
                  borderRadius: '14px',
                  padding: '22px 26px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '18px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{b.movie_title}</h3>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      background: isConfirmed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isConfirmed ? '#34d399' : '#f87171',
                      border: `1px solid ${isConfirmed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      {b.booking_status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {b.show_date}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {b.start_time}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {b.theater_name} (Screen {b.screen_number})
                    </span>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Reserved Seats: </span>
                    <strong style={{ color: '#f59e0b' }}>{b.seats || 'Assigned'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Paid</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 850, color: '#10b981' }}>
                      ₹{parseFloat(b.total_amount).toFixed(2)}
                    </div>
                  </div>

                  {isConfirmed ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelBooking(b)}
                    >
                      <XCircle size={14} /> Cancel Ticket
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Seats Released & Refunded</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

