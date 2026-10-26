import React, { useState } from 'react';
import { Plus, Calendar, Clock, Film, Monitor } from 'lucide-react';
import { api } from '../services/api';

function getBadgeClass(screenType = '') {
  const lower = screenType.toLowerCase();
  if (lower.includes('imax')) return 'badge-imax';
  if (lower.includes('dolby')) return 'badge-dolby';
  if (lower.includes('4dx')) return 'badge-4dx';
  if (lower.includes('vip') || lower.includes('recliner')) return 'badge-vip';
  return 'badge-info';
}

export default function ShowtimesView({ showtimes = [], movies = [], theaters = [], onRefresh, showNotification }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    show_date: '2026-10-28',
    start_time: '18:00:00',
    end_time: '21:00:00',
    base_price: 350,
    movie_id: '',
    screen_id: ''
  });

  const handleOpenAdd = () => {
    if (movies.length > 0) formData.movie_id = movies[0].movie_id;
    const allScreens = theaters.flatMap(t => t.screens || []);
    if (allScreens.length > 0) formData.screen_id = allScreens[0].screen_id;
    setFormData({ ...formData });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createShowtime(formData);
      showNotification('Showtime scheduled successfully.');
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const screensList = theaters.flatMap(t => (t.screens || []).map(s => ({
    ...s,
    theater_name: t.theater_name
  })));

  return (
    <div>
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800 }}>Showtime Programming</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Schedules, pricing rules, and auditorium slot allocations</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Schedule Showtime
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Show ID</th>
                <th>Screening Date</th>
                <th>Time Window</th>
                <th>Movie Title</th>
                <th>Cinema Multiplex</th>
                <th>Auditorium</th>
                <th>Format</th>
                <th>Base Ticket Price</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map(s => (
                <tr key={s.show_id}>
                  <td><strong style={{ color: '#f59e0b' }}>#{s.show_id}</strong></td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#f1f5f9' }}>
                      <Calendar size={13} color="#fb7185" /> {s.show_date}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      <Clock size={13} color="#38bdf8" /> {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#ffffff' }}>{s.movie_title}</strong>
                  </td>
                  <td>
                    {s.theater_name}
                  </td>
                  <td>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                      {s.screen_name || `Screen ${s.screen_number}`}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(s.screen_type)}`}>
                      {s.screen_type || 'Standard'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#10b981', fontSize: '0.88rem' }}>
                      ₹{parseFloat(s.base_price).toFixed(2)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: '#ffffff', marginBottom: '18px' }}>
              Schedule New Showtime
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Movie Title *</label>
                <select
                  required
                  value={formData.movie_id}
                  onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                >
                  {movies.map(m => (
                    <option key={m.movie_id} value={m.movie_id}>
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Auditorium Screen *</label>
                <select
                  required
                  value={formData.screen_id}
                  onChange={(e) => setFormData({ ...formData, screen_id: e.target.value })}
                >
                  {screensList.map(s => (
                    <option key={s.screen_id} value={s.screen_id}>
                      {s.theater_name} — {s.screen_name || `Screen ${s.screen_number}`} ({s.screen_type || 'Standard'}, {s.capacity || 142} Seats)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Show Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.show_date}
                    onChange={(e) => setFormData({ ...formData, show_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Base Price (₹) *</label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Schedule Showtime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
