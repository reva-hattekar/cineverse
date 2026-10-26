import React from 'react';
import { DollarSign, Popcorn, Sparkles, AlertCircle, TrendingUp, Star } from 'lucide-react';

export default function ReportsView({ revenueReport = null, popularMovies = [] }) {
  return (
    <div>
      <div style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Financial Performance & Revenue Analytics</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Aggregate SQL analytics representing revenue breakdowns, concession earnings, and ticket rankings
        </p>
      </div>

      {revenueReport && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Confirmed Ticket Earnings</span>
              <DollarSign className="kpi-icon" size={20} />
            </div>
            <div className="kpi-value" style={{ color: '#10b981' }}>
              ₹{parseFloat(revenueReport.summary.confirmed_ticket_revenue).toFixed(2)}
            </div>
            <div className="kpi-sub">{revenueReport.summary.confirmed_bookings_count} completed reservations</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">F&B Concession Revenue</span>
              <Popcorn className="kpi-icon" size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div className="kpi-value" style={{ color: '#f59e0b' }}>
              ₹{parseFloat(revenueReport.summary.total_concession_revenue).toFixed(2)}
            </div>
            <div className="kpi-sub">Snack and beverage add-ons</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Grand Total Gross</span>
              <Sparkles className="kpi-icon" size={20} style={{ color: '#e11d48' }} />
            </div>
            <div className="kpi-value">
              ₹{revenueReport.summary.grand_total_revenue}
            </div>
            <div className="kpi-sub">Combined tickets + concessions</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Refunded / Cancelled</span>
              <AlertCircle className="kpi-icon" size={20} style={{ color: '#ef4444' }} />
            </div>
            <div className="kpi-value" style={{ color: '#ef4444' }}>
              ₹{parseFloat(revenueReport.summary.cancelled_or_refunded_amount).toFixed(2)}
            </div>
            <div className="kpi-sub">{revenueReport.summary.cancelled_bookings_count} cancelled transactions</div>
          </div>
        </div>
      )}

      {/* Popular Movies Table */}
      <div className="table-card" style={{ marginTop: '28px' }}>
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#e11d48" /> Popular Titles Ranked by Ticket Sales
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>SQL grouping by movie duration, screenings, and total seat reservations</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Movie Title</th>
                <th>Genre</th>
                <th>Rating</th>
                <th>Total Screenings</th>
                <th>Tickets / Seats Sold</th>
                <th>Gross Box Office</th>
              </tr>
            </thead>
            <tbody>
              {popularMovies.map(m => (
                <tr key={m.movie_id}>
                  <td><strong>{m.title}</strong></td>
                  <td><span className="badge badge-info">{m.genre}</span></td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
                      <Star size={14} fill="#f59e0b" /> {m.rating}
                    </span>
                  </td>
                  <td>{m.total_screenings} screenings</td>
                  <td>
                    <strong style={{ color: '#f59e0b' }}>{m.total_seats_sold} seats sold</strong>
                  </td>
                  <td>
                    <strong style={{ color: '#10b981' }}>₹{parseFloat(m.gross_revenue).toFixed(2)}</strong>
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

