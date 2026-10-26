import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Clock,
  Film,
  Building2,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Search,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';

function getBadgeClass(screenType = '') {
  const lower = (screenType || '').toLowerCase();
  if (lower.includes('imax')) return 'badge-imax';
  if (lower.includes('dolby')) return 'badge-dolby';
  if (lower.includes('4dx')) return 'badge-4dx';
  if (lower.includes('vip') || lower.includes('recliner')) return 'badge-vip';
  return 'badge-info';
}

/**
 * Format 24-hr time string ('HH:MM:SS') into friendly 12-hr display ('10:00 AM')
 */
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Calculate expected end time based on start_time ('HH:MM'), movie duration (mins), and 15m turnaround buffer
 */
function calculateEndTime(startTimeStr, durationMins = 120, turnaroundMins = 15) {
  if (!startTimeStr) return '21:00';
  const parts = startTimeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;

  const totalMins = h * 60 + m + (parseInt(durationMins, 10) || 120) + turnaroundMins;
  const endHours = Math.floor(totalMins / 60) % 24;
  const endMins = totalMins % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
}

export default function ShowtimesView({
  showtimes = [],
  movies = [],
  theaters = [],
  onRefresh,
  showNotification
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedMovieId = searchParams.get('movie_id');

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showtimeToDelete, setShowtimeToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [theaterFilter, setTheaterFilter] = useState('all');
  const [movieFilter, setMovieFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [showDate, setShowDate] = useState('2026-10-28');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:04');
  const [basePrice, setBasePrice] = useState(250);

  // Auto-open modal if navigated with ?movie_id=X from Movie Catalog
  useEffect(() => {
    if (preselectedMovieId && movies.length > 0 && theaters.length > 0) {
      const match = movies.find(m => String(m.movie_id) === String(preselectedMovieId));
      if (match) {
        handleOpenAdd(match.movie_id);
      }
    }
  }, [preselectedMovieId, movies, theaters]);

  // Find selected entities for preview & calculations
  const selectedMovie = useMemo(() => {
    return movies.find(m => String(m.movie_id) === String(selectedMovieId)) || movies[0] || null;
  }, [selectedMovieId, movies]);

  const selectedTheater = useMemo(() => {
    return theaters.find(t => String(t.theater_id) === String(selectedTheaterId)) || theaters[0] || null;
  }, [selectedTheaterId, theaters]);

  const availableScreensForTheater = useMemo(() => {
    if (!selectedTheater) return [];
    return selectedTheater.screens || [];
  }, [selectedTheater]);

  const selectedScreen = useMemo(() => {
    return availableScreensForTheater.find(s => String(s.screen_id) === String(selectedScreenId)) || availableScreensForTheater[0] || null;
  }, [selectedScreenId, availableScreensForTheater]);

  // Automatically update end_time when movie duration or start_time changes
  useEffect(() => {
    if (selectedMovie && startTime) {
      const computed = calculateEndTime(startTime, selectedMovie.duration, 15);
      setEndTime(computed);
    }
  }, [selectedMovie, startTime]);

  // Adjust default price based on screen type
  useEffect(() => {
    if (selectedScreen) {
      const type = (selectedScreen.screen_type || '').toLowerCase();
      if (type.includes('imax') || type.includes('4dx')) setBasePrice(350);
      else if (type.includes('vip') || type.includes('recliner')) setBasePrice(450);
      else if (type.includes('dolby')) setBasePrice(300);
      else setBasePrice(250);
    }
  }, [selectedScreen]);

  const handleOpenAdd = (targetMovieId = null) => {
    const movieToSelect = targetMovieId || (movies[0]?.movie_id ?? '');
    setSelectedMovieId(movieToSelect);

    const initialTheater = theaters[0] || null;
    setSelectedTheaterId(initialTheater?.theater_id ?? '');

    const initialScreen = initialTheater?.screens?.[0] || null;
    setSelectedScreenId(initialScreen?.screen_id ?? '');

    setShowDate('2026-10-28');
    setStartTime('18:00');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleTheaterChange = (tId) => {
    setSelectedTheaterId(tId);
    const th = theaters.find(t => String(t.theater_id) === String(tId));
    if (th && th.screens && th.screens.length > 0) {
      setSelectedScreenId(th.screens[0].screen_id);
    } else {
      setSelectedScreenId('');
    }
  };

  // Overlap Pre-Check on Frontend
  const potentialOverlap = useMemo(() => {
    if (!selectedScreenId || !showDate || !startTime || !endTime) return null;
    const startWithSec = startTime.length === 5 ? `${startTime}:00` : startTime;
    const endWithSec = endTime.length === 5 ? `${endTime}:00` : endTime;

    return showtimes.find(s => {
      if (String(s.screen_id) !== String(selectedScreenId)) return false;
      if (s.show_date !== showDate) return false;
      // Interval overlap test: A_start < B_end && A_end > B_start
      return s.start_time < endWithSec && s.end_time > startWithSec;
    });
  }, [selectedScreenId, showDate, startTime, endTime, showtimes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedMovieId || !selectedScreenId) {
      setErrorMessage('Please select both a movie title and an auditorium screen.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        movie_id: parseInt(selectedMovieId, 10),
        screen_id: parseInt(selectedScreenId, 10),
        show_date: showDate,
        start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
        end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
        base_price: parseFloat(basePrice)
      };

      const res = await api.createShowtime(payload);
      if (res.success) {
        showNotification(res.message || 'Showtime scheduled successfully.');
        setModalOpen(false);
        // Clear preselected query param if present
        if (preselectedMovieId) {
          setSearchParams({});
        }
        onRefresh();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Scheduling failed. Please check parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!showtimeToDelete) return;
    setSubmitting(true);
    try {
      const res = await api.deleteShowtime(showtimeToDelete.show_id);
      if (res.success) {
        showNotification(`Showtime #${showtimeToDelete.show_id} removed successfully.`);
        setDeleteModalOpen(false);
        setShowtimeToDelete(null);
        onRefresh();
      }
    } catch (err) {
      showNotification(err.message, 'error');
      setDeleteModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered showtimes table data
  const filteredShowtimes = showtimes.filter(s => {
    if (dateFilter && s.show_date !== dateFilter) return false;
    if (theaterFilter !== 'all' && String(s.theater_id) !== String(theaterFilter)) return false;
    if (movieFilter !== 'all' && String(s.movie_id) !== String(movieFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchMovie = (s.movie_title || '').toLowerCase().includes(q);
      const matchTheater = (s.theater_name || '').toLowerCase().includes(q);
      const matchScreen = (s.screen_name || '').toLowerCase().includes(q);
      if (!matchMovie && !matchTheater && !matchScreen) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="table-card">
        {/* Header Toolbar */}
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Auditorium Showtime Programming</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Multi-screen schedules, format pricing rules, and turnaround buffers
            </p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => handleOpenAdd()}>
            <Plus size={16} /> Schedule Showtime
          </button>
        </div>

        {/* Filter Controls Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Filter movie, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '34px' }}
            />
          </div>

          {/* Theater Filter */}
          <select
            value={theaterFilter}
            onChange={(e) => setTheaterFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8rem', height: '34px' }}
          >
            <option value="all">All Theatres ({theaters.length})</option>
            {theaters.map(t => (
              <option key={t.theater_id} value={t.theater_id}>
                {t.theater_name} ({t.city})
              </option>
            ))}
          </select>

          {/* Movie Filter */}
          <select
            value={movieFilter}
            onChange={(e) => setMovieFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8rem', height: '34px' }}
          >
            <option value="all">All Movies ({movies.length})</option>
            {movies.map(m => (
              <option key={m.movie_id} value={m.movie_id}>
                {m.title}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8rem', height: '34px' }}
            title="Filter by screening date"
          />

          {/* Reset Filters */}
          {(dateFilter || theaterFilter !== 'all' || movieFilter !== 'all' || searchQuery) && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', height: '34px' }}
              onClick={() => {
                setDateFilter('');
                setTheaterFilter('all');
                setMovieFilter('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Showing <strong>{filteredShowtimes.length}</strong> of {showtimes.length} scheduled screenings
          </div>
        </div>

        {/* Showtimes Table */}
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
                <th>Base Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShowtimes.map(s => (
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
                    {s.duration && (
                      <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '6px' }}>
                        ({s.duration}m)
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{s.theater_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.city}</div>
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
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/seats')}
                        title="Inspect Seating Grid & Occupancy"
                        style={{ padding: '4px 8px', fontSize: '0.76rem' }}
                      >
                        Seats
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setShowtimeToDelete(s);
                          setDeleteModalOpen(true);
                        }}
                        title="Remove Showtime"
                        style={{ padding: '4px 8px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredShowtimes.length === 0 && (
            <div style={{ padding: '42px 24px', textAlign: 'center', color: '#94a3b8' }}>
              <Film size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
                No Showtimes Match Criteria
              </h4>
              <p style={{ fontSize: '0.82rem', maxWidth: '420px', margin: '0 auto 16px' }}>
                Try adjusting your date or venue filters, or click &quot;Schedule Showtime&quot; to program new screenings.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenAdd()}>
                <Plus size={14} /> Schedule First Showtime
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          INTUITIVE STEP-BY-STEP SHOWTIME SCHEDULING MODAL
          ========================================================================= */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: '#ffffff' }}>
                  Schedule New Showtime
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  Assign screening slots with automatic runtime & turnaround buffer calculations
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div style={{
                background: 'rgba(225, 29, 72, 0.12)',
                border: '1px solid rgba(225, 29, 72, 0.35)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fb7185',
                fontSize: '0.82rem',
                marginBottom: '16px',
                lineHeight: 1.45
              }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* STEP 1: SELECT MOVIE */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>1. Select Movie Title *</span>
                  {selectedMovie && (
                    <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 700 }}>
                      Runtime: {selectedMovie.duration} mins • {selectedMovie.language}
                    </span>
                  )}
                </label>
                <select
                  required
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                >
                  {movies.map(m => (
                    <option key={m.movie_id} value={m.movie_id}>
                      {m.title} ({m.language}) — {m.duration}m [{m.release_status || 'Now Showing'}]
                    </option>
                  ))}
                </select>

                {/* Coming Soon Notice */}
                {selectedMovie && (selectedMovie.release_status === 'Coming Soon' || (!selectedMovie.release_status && (!selectedMovie.scheduled_showtimes_count || selectedMovie.scheduled_showtimes_count === 0))) && (
                  <div style={{
                    marginTop: '6px',
                    fontSize: '0.74rem',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    padding: '6px 10px',
                    borderRadius: '6px'
                  }}>
                    <Sparkles size={13} />
                    <span>Advance Screening: Scheduling an upcoming title for future premiere dates.</span>
                  </div>
                )}
              </div>

              {/* STEP 2 & 3: THEATRE & SCREEN SELECTOR (HIERARCHICAL) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>2. Cinema Multiplex *</label>
                  <select
                    required
                    value={selectedTheaterId}
                    onChange={(e) => handleTheaterChange(e.target.value)}
                  >
                    {theaters.map(t => (
                      <option key={t.theater_id} value={t.theater_id}>
                        {t.theater_name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>3. Auditorium Screen *</label>
                  <select
                    required
                    value={selectedScreenId}
                    onChange={(e) => setSelectedScreenId(e.target.value)}
                  >
                    {availableScreensForTheater.map(s => (
                      <option key={s.screen_id} value={s.screen_id}>
                        {s.screen_name || `Screen ${s.screen_number}`} ({s.screen_type || 'Standard'}, {s.capacity || 142} Seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STEP 4 & 5: DATE & START TIME */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>4. Screening Date *</label>
                  <input
                    type="date"
                    required
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>5. Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              {/* COMPUTED END TIME & BASE TICKET PRICE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Calculated End Time *</span>
                    <span style={{ fontSize: '0.72rem', color: '#10b981' }}>+15m turnaround</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    Movie ({selectedMovie?.duration || 120}m) + cleaning buffer
                  </div>
                </div>

                <div className="form-group">
                  <label>Base Ticket Price (₹) *</label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    Suggested format rate for {selectedScreen?.screen_type || 'Standard'}
                  </div>
                </div>
              </div>

              {/* OVERLAP WARNING BANNER */}
              {potentialOverlap && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fbbf24',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={18} flexShrink={0} />
                  <span>
                    <strong>Potential Overlap:</strong> {selectedScreen?.screen_name || 'This screen'} already has &quot;{potentialOverlap.movie_title}&quot; scheduled from {potentialOverlap.start_time?.slice(0, 5)} to {potentialOverlap.end_time?.slice(0, 5)}.
                  </span>
                </div>
              )}

              {/* STEP 8: REVIEW SCREENING DETAILS PREVIEW */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginTop: '4px'
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d4af37', fontWeight: 800, marginBottom: '8px' }}>
                  Screening Summary Review
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Feature Film:</span>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{selectedMovie?.title || '—'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Complex:</span>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{selectedTheater?.theater_name || '—'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Auditorium:</span>
                    <div style={{ fontWeight: 700, color: '#fff' }}>
                      {selectedScreen?.screen_name || 'Audi'} ({selectedScreen?.screen_type || 'Standard'})
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Window:</span>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>
                      {showDate} @ {formatTime12(startTime)} – {formatTime12(endTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Scheduling...' : 'Save & Publish Showtime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && showtimeToDelete && (
        <div className="modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
              Remove Showtime #{showtimeToDelete.show_id}?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to delete the scheduled screening of <strong>{showtimeToDelete.movie_title}</strong> at <strong>{showtimeToDelete.theater_name}</strong> on <strong>{showtimeToDelete.show_date}</strong> ({showtimeToDelete.start_time?.slice(0, 5)})?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
