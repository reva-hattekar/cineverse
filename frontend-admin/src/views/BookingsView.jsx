import React from 'react';
import { Ticket, XCircle } from 'lucide-react';
import { api } from '../services/api';

export default function BookingsView({ bookings = [], onRefresh, showNotification }) {
  const handleCancel = async (b) => {
    if (!window.confirm(`Cancel Booking #${b.booking_id} for customer ${b.customer_name}? Seats will be released immediately.`)) return;
    try {
      const res = await api.cancelBooking(b.booking_id);
      showNotification(res.message);
      onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Master Booking Roster</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Customer transactions with seat allocations and cancellation release controls</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Movie Title</th>
                <th>Showtime Slot</th>
                <th>Reserved Seats</th>
                <th>Total Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.booking_id}>
                  <td><strong>#{b.booking_id}</strong></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{b.customer_name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem' }}>{b.customer_email}</div>
                  </td>
                  <td><strong>{b.movie_title}</strong></td>
                  <td>
                    <div>{b.show_date}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{b.start_time}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{b.seats || 'Assigned'}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#10b981' }}>₹{parseFloat(b.total_amount).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td>
                    {b.booking_status === 'CONFIRMED' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(b)}
                        title="Cancel booking and release reserved seats"
                      >
                        <XCircle size={14} /> Cancel & Release
                      </button>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Released</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

