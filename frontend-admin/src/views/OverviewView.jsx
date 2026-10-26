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
  CheckCircle2,
  Monitor,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function OverviewView({ metrics, loading, onNavigate }) {
  if (loading && !metrics) {
    return (
      <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>
        <Activity size={24} className="system-pulse" style={{ display: 'inline-block', marginBottom: '10px' }} />
        <div>Connecting to operational database and compiling cinema metrics...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Welcome Header (Multiplex Operations Command) */}
      <div className="overview-welcome-card">
        <div className="overview-welcome-eyebrow">
          <Sparkles size={13} />
          <span>CINEVERSE OPERATIONS COMMAND</span>
        </div>
        <h1 className="overview-welcome-title">Cinema Operations</h1>
        <p className="overview-welcome-sub">
          Centralized multiplex management dashboard for live box office monitoring, multi-screen programming, and auditorium transactions.
        </p>
      </div>

      {/* 2. Operational KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Gross Box Office</span>
            <div className="kpi-icon-wrap" style={{ color: '#10b981' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>
            ₹{metrics?.total_revenue || '0.00'}
          </div>
          <div className="kpi-sub">Audited from confirmed transactions</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Reservations</span>
            <div className="kpi-icon-wrap" style={{ color: '#fb7185' }}>
              <Ticket size={16} />
            </div>
          </div>
          <div className="kpi-value">{metrics?.total_bookings || 0}</div>
          <div className="kpi-sub">Committed in BOOKING table</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Scheduled Screenings</span>
            <div className="kpi-icon-wrap" style={{ color: '#38bdf8' }}>
              <Calendar size={16} />
            </div>
          </div>
          <div className="kpi-value">{metrics?.total_showtimes || 0}</div>
          <div className="kpi-sub">Across {metrics?.total_screens || 32} multiplex auditoriums</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Catalog Titles</span>
            <div className="kpi-icon-wrap" style={{ color: '#c084fc' }}>
              <Film size={16} />
            </div>
          </div>
          <div className="kpi-value">{metrics?.total_movies || 0}</div>
          <div className="kpi-sub">Active theatrical motion pictures</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Active Multiplexes</span>
            <div className="kpi-icon-wrap" style={{ color: '#f59e0b' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div className="kpi-value">{metrics?.total_theaters || 8}</div>
          <div className="kpi-sub">Venues across 4 metro territories</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Customer Accounts</span>
            <div className="kpi-icon-wrap" style={{ color: '#e2e8f0' }}>
              <Users size={16} />
            </div>
          </div>
          <div className="kpi-value">{metrics?.total_customers || 0}</div>
          <div className="kpi-sub">Registered accounts & loyalty</div>
        </div>
      </div>

      {/* 3. Screenings Stream & Operational Diagnostics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px' }}>
        {/* Screenings Programming Stream */}
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <h3>Showtime Programming</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Active multiplex slot schedules</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/showtimes')}>
              Manage <ArrowUpRight size={13} />
            </button>
          </div>

          <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metrics?.today_screenings?.length > 0 ? (
              metrics.today_screenings.slice(0, 5).map(s => (
                <div
                  key={s.show_id}
                  style={{
                    background: '#0e1017',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>
                      {s.movie_title}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={12} color="#fb7185" /> {s.theater_name}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
                        <Monitor size={12} /> Audi {s.screen_number}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                        <Clock size={12} /> {s.show_date} @ {s.start_time}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10b981' }}>₹{s.base_price}</div>
                    <span className="badge badge-info" style={{ fontSize: '0.66rem', padding: '2px 6px', marginTop: '2px' }}>
                      Slot #{s.show_id}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '24px', textAlign: 'center' }}>
                No immediate screenings scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* System Operations Status & Diagnostics */}
        <div className="table-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="table-toolbar">
              <div>
                <h3>Operational Diagnostics</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Infrastructure, seating & financial state</p>
              </div>
              <span className="badge badge-success">✓ System Online</span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: '#0e1017',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9' }}>Auditorium Seating Matrix</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time seat verification & layout checks</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('/seats')}
                >
                  Inspect Matrix →
                </button>
              </div>

              <div style={{
                background: '#0e1017',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9' }}>Financial Payment Audit</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Transaction reconciliation & subqueries</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('/payments')}
                >
                  Audit Ledger →
                </button>
              </div>

              <div style={{
                background: '#0e1017',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9' }}>Cancellations & Seat Releases</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed via strict transactional rollback</div>
                </div>
                <span className="badge badge-danger">
                  {metrics?.cancelled_bookings || 0} Cancelled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Reservations Transaction Stream */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>Recent Ticket Transactions</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Live transaction stream from BOOKING, PAYMENT, and SHOWTIME tables</p>
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
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.recent_bookings?.length > 0 ? (
                metrics.recent_bookings.map(b => (
                  <tr key={b.booking_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f59e0b' }}>#{b.booking_id}</td>
                    <td style={{ color: '#f1f5f9', fontWeight: 600 }}>{b.customer_name}</td>
                    <td><strong style={{ color: '#ffffff' }}>{b.movie_title}</strong></td>
                    <td style={{ fontWeight: 800, color: '#10b981' }}>₹{parseFloat(b.total_amount).toFixed(2)}</td>
                    <td>
                      <span className="badge badge-warning">{b.payment_method || 'UPI'}</span>
                    </td>
                    <td>
                      <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      {new Date(b.booking_date).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No recent booking transactions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
