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
        backgroundColor: '#121622',
        border: '1px solid #1f2736',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#94a3b8' }}>
            Select Screening Showtime:
          </label>
          <select
            value={selectedShowId}
            onChange={(e) => handleSelectShow(e.target.value)}
            style={{ width: 'auto', minWidth: '340px', backgroundColor: '#0e121a' }}
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700 }}>
              <CheckCircle2 size={15} /> Available: {seatsData.available_seats}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700 }}>
              <XCircle size={15} /> Booked: {seatsData.booked_seats}
            </span>
            <span style={{ color: '#94a3b8' }}>
              Capacity: {seatsData.total_seats} Seats
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ color: '#94a3b8', padding: '24px', textAlign: 'center' }}>
          Loading auditorium seating matrix...
        </div>
      )}

      {seatsData && !loading && (
        <div className="table-card" style={{ padding: '28px', maxWidth: '920px', margin: '0 auto' }}>
          {/* Header Info */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#f59e0b', fontWeight: 700 }}>
              Auditorium Occupancy Inspection
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', color: '#f1f5f9' }}>
              {seatsData.showtime.movie_title}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
              {seatsData.showtime.theater_name} • Screen {seatsData.showtime.screen_number} • Base Price: ₹{seatsData.showtime.base_price}
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
