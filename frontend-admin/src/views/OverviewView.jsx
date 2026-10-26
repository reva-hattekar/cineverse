import React from 'react';
import {
  DollarSign,
  Ticket,
  Film,
  Calendar,
  Users,
  ArrowUpRight,
  Clock,
  Building2,
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function OverviewView({ metrics, loading, onNavigate }) {
  if (loading && !metrics) {
    return <div style={{ color: '#94a3b8', padding: '24px' }}>Loading cinema operational analytics...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Operations KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Gross Box Office</span>
            <DollarSign className="kpi-icon" size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            ₹{metrics?.total_revenue || '0.00'}
          </div>
          <div className="kpi-sub">Audited from confirmed transactions</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Reservations</span>
            <Ticket className="kpi-icon" size={18} />
          </div>
          <div className="kpi-value">{metrics?.total_bookings || 0}</div>
          <div className="kpi-sub">Committed in BOOKING table</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Scheduled Screenings</span>
            <Calendar className="kpi-icon" size={18} />
          </div>
          <div className="kpi-value">{metrics?.total_showtimes || 0}</div>
          <div className="kpi-sub">Across {metrics?.total_screens || 4} auditoriums</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Catalog Movies</span>
            <Film className="kpi-icon" size={18} />
          </div>
          <div className="kpi-value">{metrics?.total_movies || 0}</div>
          <div className="kpi-sub">Active theatrical motion pictures</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Customer Profiles</span>
            <Users className="kpi-icon" size={18} />
          </div>
          <div className="kpi-value">{metrics?.total_customers || 0}</div>
          <div className="kpi-sub">Registered accounts & loyalty</div>
        </div>
      </div>

      {/* Screenings Programming & Live Bookings 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px' }}>
        {/* Screenings Stream */}
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Showtime Programming</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Active screenings across multiplex auditoriums</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/showtimes')}>
              Manage <ArrowUpRight size={13} />
            </button>
          </div>

          <div style={{ padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {metrics?.today_screenings?.length > 0 ? (
              metrics.today_screenings.map(s => (
                <div
                  key={s.show_id}
                  style={{
                    background: '#0e121a',
                    border: '1px solid #1f2736',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>
                      {s.movie_title}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={12} /> {s.theater_name} (Screen {s.screen_number})
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                        <Clock size={12} /> {s.show_date} @ {s.start_time}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#f1f5f9' }}>₹{s.base_price}</div>
                    <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      Show #{s.show_id}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '16px', textAlign: 'center' }}>
                No immediate screenings scheduled.
              </div>
            )}
          </div>
        </div>

        {/* System Operations Status & Quick Actions */}
        <div className="table-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="table-toolbar">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Operations Status</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Infrastructure & inventory diagnostics</p>
              </div>
              <span className="badge badge-success">Online</span>
            </div>

            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: '#0e121a',
                border: '1px solid #1f2736',
                borderRadius: '6px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Transaction Reversals / Cancellations</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed via seat release procedure</div>
                </div>
                <span className="badge badge-danger">{metrics?.cancelled_bookings || 0} Tickets</span>
              </div>

              <div style={{
                background: '#0e121a',
                border: '1px solid #1f2736',
                borderRadius: '6px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Auditorium Seating Matrix</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time seat state verification</div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('/seats')}
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  Inspect Seat Map →
                </button>
              </div>

              <div style={{
                background: '#0e121a',
                border: '1px solid #1f2736',
                borderRadius: '6px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Financial Payment Audit</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Payment reconciliation & subqueries</div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('/reports')}
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  View Reports →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Reservations Transaction Stream */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Recent Ticket Transactions</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Live stream from BOOKING, PAYMENT, and SHOWTIME tables</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/bookings')}>
            View All Reservations <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Movie Title</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.recent_bookings?.map(b => (
                <tr key={b.booking_id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{b.booking_id}</td>
                  <td>{b.customer_name}</td>
                  <td><strong>{b.movie_title}</strong></td>
                  <td style={{ fontWeight: 700 }}>₹{parseFloat(b.total_amount).toFixed(2)}</td>
                  <td>
                    <span className="badge badge-warning">{b.payment_method || 'UPI'}</span>
                  </td>
                  <td>
                    <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                    {new Date(b.booking_date).toLocaleString()}
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
