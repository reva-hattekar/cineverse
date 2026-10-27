import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Film,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  X,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { getYouTubeEmbedUrl, isValidTrailerUrl, normalizeTrailerUrl } from '../utils/trailerUtils';
import { Play } from 'lucide-react';

/**
 * Format date & time into localized readable string: e.g. "16 Oct 2026 · 7:00 PM"
 */
function formatLocalDateTime(dateStr, timeStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    let timeFormatted = '';
    if (timeStr) {
      const parts = timeStr.split(':');
      const hour = parseInt(parts[0], 10);
      const min = parts[1] || '00';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      timeFormatted = ` · ${hour12}:${min} ${ampm}`;
    }
    return `${dateFormatted}${timeFormatted}`;
  } catch {
    return `${dateStr} ${timeStr || ''}`;
  }
}

export default function MoviesView({ movies = [], onRefresh, showNotification }) {
  const navigate = useNavigate();

  // Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConflictData, setDeleteConflictData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    duration: 150,
    language: 'Hindi',
    rating: 8.5,
    poster_url: '',
    backdrop_url: '',
    release_date: '',
    release_status: 'Now Showing',
    trailer_url: ''
  });

  // Accessible keyboard ESC listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deleteModalOpen) setDeleteModalOpen(false);
        if (editModalOpen) setEditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteModalOpen, editModalOpen]);

  const handleOpenAdd = () => {
    setSelectedMovie(null);
    setFormData({
      title: '',
      genre: 'Action',
      duration: 150,
      language: 'Hindi',
      rating: 8.5,
      poster_url: '',
      backdrop_url: '',
      release_date: '',
      release_status: 'Now Showing',
      trailer_url: ''
    });
    setEditModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setSelectedMovie(m);
    setFormData({
      title: m.title,
      genre: m.genre,
      duration: m.duration,
      language: m.language,
      rating: m.rating,
      poster_url: m.poster_url || '',
      backdrop_url: m.backdrop_url || '',
      release_date: m.release_date || '',
      release_status: m.release_status || (m.scheduled_showtimes_count > 0 ? 'Now Showing' : 'Coming Soon'),
      trailer_url: m.trailer_url || ''
    });
    setEditModalOpen(true);
  };

  const handleOpenDelete = async (m) => {
    setSelectedMovie(m);
    setDeleteConflictData(null);
    setDeleteModalOpen(true);

    // If the movie has active showtimes, pre-fetch relational conflict diagnostics
    if (m.scheduled_showtimes_count > 0) {
      setSubmitting(true);
      try {
        await api.deleteMovie(m.movie_id);
      } catch (err) {
        if (err.status === 409 || err.data?.conflict) {
          setDeleteConflictData({
            message: err.data?.message || err.message,
            dependentShowtimes: err.data?.dependentShowtimes || [],
            totalBookings: err.data?.totalBookings ?? 0
          });
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    const trimmedTrailer = (formData.trailer_url || '').trim();
    if (trimmedTrailer && !isValidTrailerUrl(trimmedTrailer)) {
      showNotification('Please enter a valid YouTube trailer URL or clear the field.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        trailer_url: trimmedTrailer
      };
      if (selectedMovie) {
        await api.updateMovie(selectedMovie.movie_id, payload);
        showNotification(`Movie "${formData.title}" updated successfully.`);
      } else {
        await api.createMovie(payload);
        showNotification(`Movie "${formData.title}" added to catalog.`);
      }
      setEditModalOpen(false);
      onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!selectedMovie) return;
    setSubmitting(true);
    try {
      const res = await api.deleteMovie(selectedMovie.movie_id);
      if (res.success) {
        showNotification(`Movie "${selectedMovie.title}" (ID #${selectedMovie.movie_id}) deleted permanently.`);
        setDeleteModalOpen(false);
        setSelectedMovie(null);
        onRefresh();
      }
    } catch (err) {
      if (err.status === 409 || err.data?.conflict) {
        setDeleteConflictData({
          message: err.data?.message || err.message,
          dependentShowtimes: err.data?.dependentShowtimes || [],
          totalBookings: err.data?.totalBookings ?? 0
        });
      } else {
        showNotification(err.message, 'error');
        setDeleteModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const nowShowingCount = movies.filter(m => (m.release_status === 'Now Showing' || (!m.release_status && m.scheduled_showtimes_count > 0))).length;
  const comingSoonCount = movies.filter(m => (m.release_status === 'Coming Soon' || (!m.release_status && (!m.scheduled_showtimes_count || m.scheduled_showtimes_count === 0)))).length;
  const endedCount = movies.filter(m => m.release_status === 'Ended').length;

  const filteredMovies = movies.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.language.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const status = m.release_status || (m.scheduled_showtimes_count > 0 ? 'Now Showing' : 'Coming Soon');
    if (statusFilter === 'now_showing') return status === 'Now Showing';
    if (statusFilter === 'coming_soon') return status === 'Coming Soon';
    if (statusFilter === 'ended') return status === 'Ended';
    return true;
  });

  return (
    <div>
      <div className="table-card">
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Theatrical Movie Catalog</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Manage screening films, release lifecycles, and relational database integrity
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                style={{
                  background: statusFilter === 'all' ? 'var(--primary-crimson)' : 'transparent',
                  color: statusFilter === 'all' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                All ({movies.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('now_showing')}
                style={{
                  background: statusFilter === 'now_showing' ? 'var(--status-success)' : 'transparent',
                  color: statusFilter === 'now_showing' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Now Showing ({nowShowingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('coming_soon')}
                style={{
                  background: statusFilter === 'coming_soon' ? 'var(--status-warning)' : 'transparent',
                  color: statusFilter === 'coming_soon' ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Coming Soon ({comingSoonCount})
              </button>
              {endedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('ended')}
                  style={{
                    background: statusFilter === 'ended' ? 'var(--text-muted)' : 'transparent',
                    color: statusFilter === 'ended' ? '#fff' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Ended ({endedCount})
                </button>
              )}
            </div>

            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={15} /> Add Movie
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '56px' }}>Poster</th>
                <th>Title & ID</th>
                <th>Genre</th>
                <th>Duration</th>
                <th>Language</th>
                <th>Rating</th>
                <th>Release Status</th>
                <th>Release Date</th>
                <th>Active Showtimes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map(m => {
                const showtimesCount = m.scheduled_showtimes_count !== undefined
                  ? m.scheduled_showtimes_count
                  : 0;
                const status = m.release_status || (showtimesCount > 0 ? 'Now Showing' : 'Coming Soon');

                return (
                  <tr key={m.movie_id}>
                    <td>
                      <div style={{
                        width: '40px',
                        height: '56px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        background: 'var(--bg-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {m.poster_url ? (
                          <img
                            src={m.poster_url}
                            alt={m.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Film size={18} color="#64748b" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f1f5f9' }}>{m.title}</div>
                      <div style={{ color: '#64748b', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
                        MOVIE #{m.movie_id}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{m.genre}</span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.82rem' }}>
                        <Clock size={13} /> {m.duration} min
                      </span>
                    </td>
                    <td>{m.language}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#f59e0b' }}>
                        <Star size={13} fill="#f59e0b" /> {m.rating}
                      </span>
                    </td>
                    <td>
                      {status === 'Now Showing' && (
                        <span className="badge badge-success" title="Currently actively screening in theaters">Now Showing</span>
                      )}
                      {status === 'Coming Soon' && (
                        <span className="badge badge-warning" title="Upcoming theatrical premiere">Coming Soon</span>
                      )}
                      {status === 'Ended' && (
                        <span className="badge badge-secondary" title="Theatrical distribution concluded">Ended</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: m.release_date ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {m.release_date || '—'}
                      </span>
                    </td>
                    <td>
                      {showtimesCount > 0 ? (
                        <span className="badge badge-warning" title={`${showtimesCount} active showtimes`}>
                          {showtimesCount} Scheduled
                        </span>
                      ) : (
                        <span className="badge badge-secondary">
                          0 Shows (Unscheduled)
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/showtimes?movie_id=${m.movie_id}`)}
                          title={`Schedule Screenings for "${m.title}"`}
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        >
                          <Calendar size={13} /> Schedule
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(m)}
                          title="Edit Movie"
                          style={{ padding: '4px 8px' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(m)}
                          title="Delete Movie"
                          style={{ padding: '4px 8px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT / CREATE MOVIE MODAL */}
      {editModalOpen && (
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {selectedMovie ? `Edit "${selectedMovie.title}"` : 'Add New Movie Title'}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Movie Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Inception"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  >
                    <option value="Action">Action</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Drama">Drama</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Romance">Romance</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Animation">Animation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Kannada">Kannada</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) })}
                  />
                </div>

                <div className="form-group">
                  <label>Rating (0.0 - 10.0) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {/* Release Management Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Release Status *</label>
                  <select
                    value={formData.release_status}
                    onChange={(e) => setFormData({ ...formData, release_status: e.target.value })}
                  >
                    <option value="Now Showing">Now Showing (Theatrical Screenings)</option>
                    <option value="Coming Soon">Coming Soon (Upcoming Premiere)</option>
                    <option value="Ended">Ended (Run Concluded)</option>
                  </select>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    Categorizes title on customer portal
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Theatrical Release Date</label>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    Official premiere / release date
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Poster URL (Artwork link)</label>
                <input
                  type="url"
                  value={formData.poster_url}
                  onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                  placeholder="https://image.tmdb.org/t/p/w500/..."
                />
              </div>

              <div className="form-group">
                <label>Backdrop Banner URL</label>
                <input
                  type="url"
                  value={formData.backdrop_url}
                  onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                  placeholder="https://image.tmdb.org/t/p/original/..."
                />
              </div>

              {/* Trailer Video URL */}
              <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
                    Trailer Video URL (YouTube)
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Optional • watch, youtu.be, or embed
                  </span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="url"
                    value={formData.trailer_url || ''}
                    onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    style={{ paddingRight: formData.trailer_url ? '36px' : '12px' }}
                  />
                  {formData.trailer_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, trailer_url: '' })}
                      title="Clear trailer URL"
                      style={{
                        position: 'absolute',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {formData.trailer_url && (
                  <div style={{ marginTop: '8px' }}>
                    {isValidTrailerUrl(formData.trailer_url) ? (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000' }}>
                        <div style={{ fontSize: '0.75rem', padding: '6px 10px', background: 'rgba(0,0,0,0.6)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Play size={12} fill="#e11d48" color="#e11d48" /> Live Trailer Preview
                        </div>
                        <iframe
                          src={getYouTubeEmbedUrl(formData.trailer_url, { autoplay: 0, controls: 1, mute: 0 })}
                          title="Trailer Preview"
                          style={{ width: '100%', height: '180px', border: 'none', display: 'block' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        ⚠️ Invalid YouTube link. Supported: youtube.com/watch?v=..., youtu.be/..., or embed/...
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving to Database...' : 'Save Movie Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POLISHED DELETE CONFIRMATION & RELATIONAL DIAGNOSTIC MODAL */}
      {deleteModalOpen && selectedMovie && (
        <div className="modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={22} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>
                    Movie Deletion Diagnostic
                  </h3>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                    Target: <strong style={{ color: '#f1f5f9' }}>{selectedMovie.title}</strong> (Movie ID #{selectedMovie.movie_id})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                aria-label="Close dialog (Escape)"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* When Foreign Key Constraints or Dependencies Exist */}
            {deleteConflictData ? (
              <div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.88rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={16} />
                    <span>Referential Integrity Protection: Cannot Delete</span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.45' }}>
                    This movie cannot be deleted because it is actively referenced by {deleteConflictData.dependentShowtimes?.length || 0} scheduled screening(s) and {deleteConflictData.totalBookings || 0} customer booking(s). Foreign key constraint <code style={{ color: '#f59e0b' }}>fk_showtime_movie</code> protects audit and historical ledger integrity.
                  </p>
                </div>

                {deleteConflictData.dependentShowtimes?.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <span>Dependent Screenings in SHOWTIME ({deleteConflictData.dependentShowtimes.length}):</span>
                    </div>

                    <div style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)'
                    }}>
                      <table style={{ width: '100%', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-elevated)', textAlign: 'left' }}>
                            <th style={{ padding: '8px 12px' }}>Show ID</th>
                            <th style={{ padding: '8px 12px' }}>Venue & Auditorium</th>
                            <th style={{ padding: '8px 12px' }}>Screening Schedule</th>
                            <th style={{ padding: '8px 12px' }}>Bookings Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deleteConflictData.dependentShowtimes.map(st => {
                            const bookingsCount = parseInt(st.booking_count, 10) || 0;
                            const hasBookings = bookingsCount > 0;
                            return (
                              <tr key={st.show_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                  #{st.show_id}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st.theater_name}</div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Screen {st.screen_number}</div>
                                </td>
                                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                                  {formatLocalDateTime(st.show_date, st.start_time)}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  {hasBookings ? (
                                    <span
                                      className="badge badge-warning"
                                      title={`${bookingsCount} customer reservation(s) exist`}
                                    >
                                      {bookingsCount} Booking{bookingsCount > 1 ? 's' : ''} (Locked)
                                    </span>
                                  ) : (
                                    <span
                                      className="badge badge-secondary"
                                      title="No customer bookings made yet"
                                    >
                                      0 Bookings (Unsold Slot)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.45', marginBottom: '18px' }}>
                  <strong>How to resolve:</strong> To delete this movie title, first navigate to <em>Showtime Programming</em> and reassign or delete the associated screening slots.
                </p>

                {/* Modal Footer with Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    Close (Esc)
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setDeleteModalOpen(false);
                      navigate('/showtimes');
                    }}
                    style={{ gap: '8px' }}
                  >
                    <Calendar size={15} />
                    <span>View in Showtime Programming</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* When confirming deletion for an unlinked movie */}
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px' }}>
                  Are you sure you want to permanently delete <strong>"{selectedMovie.title}"</strong> (ID #{selectedMovie.movie_id}) from the theatrical catalog?
                </p>

                {selectedMovie.scheduled_showtimes_count > 0 ? (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.84rem' }}>
                      Notice: Movie has {selectedMovie.scheduled_showtimes_count} scheduled showtime(s)
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '2px' }}>
                      Verifying database relational dependencies...
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span style={{ color: '#34d399', fontSize: '0.82rem' }}>
                      Zero showtimes attached. Safe to remove immediately from the MOVIE table.
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleExecuteDelete}
                    disabled={submitting}
                  >
                    {submitting ? 'Checking Constraints...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
