import React from 'react';
import { CreditCard, CheckCircle2, RotateCcw } from 'lucide-react';

export default function PaymentsView({ bookings = [] }) {
  return (
    <div>
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Financial Payment Audit Trail</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              One-payment-per-booking relational records. Preserves full transaction history for auditing upon cancellation.
            </p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Payment Ref</th>
                <th>Booking Link</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Transaction Status</th>
                <th>Booking State</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const status = b.payment_status || (b.booking_status === 'CANCELLED' ? 'REFUNDED' : 'COMPLETED');
                return (
                  <tr key={b.booking_id}>
                    <td><strong>PAY-#{b.payment_id || b.booking_id}</strong></td>
                    <td>Booking #{b.booking_id}</td>
                    <td>{b.customer_name}</td>
                    <td>
                      <strong style={{ color: '#10b981' }}>₹{parseFloat(b.total_amount).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-warning" style={{ gap: '4px' }}>
                        <CreditCard size={12} /> {b.payment_method || 'UPI'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>
                        {status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <RotateCcw size={12} />}
                        {status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                        {b.booking_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

