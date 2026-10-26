import React, { useState, useEffect } from 'react';
import { Armchair, CheckCircle2, XCircle, Calendar, Building2, Clock, Sparkles } from 'lucide-react';
import AuditoriumSeatMap from '../components/AuditoriumSeatMap';
import { api } from '../services/api';

export default function SeatAvailabilityView({ showtimes, showNotification }) {
  const [selectedShowId, setSelectedShowId] = useState('');
  const [seatsData, setSeatsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showtimes.length > 0 && !selectedShowId) {
      setSelectedShowId(showtimes[0].show_id);
      loadSeats(showtimes[0].show_id);
    }
  }, [showtimes]);

  const loadSeats = async (showId) => {
    if (!showId) return;
    setLoading(true);
    try {
      const res = await api.getShowtimeSeats(showId);
      if (res.success) {
        setSeatsData(res.data);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShow = (showId) => {
    setSelectedShowId(showId);
    loadSeats(showId);
  };

  return (
    <div>
      {/* Control & Selector Toolbar */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '18px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Select Screening Showtime:
          </label>
          <select
            value={selectedShowId}
            onChange={(e) => handleSelectShow(e.target.value)}
            style={{ width: 'auto', minWidth: '340px' }}
          >
            {showtimes.map(s => (
              <option key={s.show_id} value={s.show_id}>
                #{s.show_id}: {s.movie_title} ({s.show_date} @ {s.start_time} - {s.theater_name})
              </option>
            ))}
          </select>
        </div>

        {seatsData && (
          <div style={{ display: 'flex', gap: '18px', fontSize: '0.84rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--status-success)', fontWeight: 700 }}>
              <CheckCircle2 size={15} /> Available: {seatsData.available_seats}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-crimson)', fontWeight: 700 }}>
              <XCircle size={15} /> Booked: {seatsData.booked_seats}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Capacity: {seatsData.total_seats} Seats
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ color: 'var(--text-secondary)', padding: '36px', textAlign: 'center' }}>
          Loading auditorium seating matrix...
        </div>
      )}

      {seatsData && !loading && (
        <div className="auditorium-container">
          {/* Header Info */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#d4af37', fontWeight: 800 }}>
              Auditorium Occupancy Live Inspection
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              {seatsData.showtime.movie_title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '4px' }}>
              {seatsData.showtime.theater_name} • Screen {seatsData.showtime.screen_number} ({seatsData.showtime.screen_type || 'Standard'}) • Base Price: ₹{seatsData.showtime.base_price}
            </p>
          </div>

          {/* Seat Map */}
          <AuditoriumSeatMap
            showtime={seatsData.showtime}
            seats={seatsData.seats}
            interactive={false}
          />
        </div>
      )}
    </div>
  );
}
