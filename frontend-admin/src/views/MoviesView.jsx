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
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    duration: 150,
    language: 'Hindi',
    rating: 8.5,
    poster_url: '',
    backdrop_url: ''
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
      backdrop_url: ''
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
      backdrop_url: m.backdrop_url || ''
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
    setSubmitting(true);
    try {
      if (selectedMovie) {
        await api.updateMovie(selectedMovie.movie_id, formData);
        showNotification(`Movie "${formData.title}" updated successfully.`);
      } else {
        await api.createMovie(formData);
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

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Theatrical Movie Catalog</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Manage screening films, metadata, and relational database integrity
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
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
                <th>Title & Relational ID</th>
                <th>Genre</th>
                <th>Duration</th>
                <th>Language</th>
                <th>Rating</th>
                <th>Active Showtimes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map(m => {
                const showtimesCount = m.scheduled_showtimes_count !== undefined
                  ? m.scheduled_showtimes_count
                  : 0;

                return (
                  <tr key={m.movie_id}>
                    <td>
                      <div style={{
                        width: '40px',
                        height: '56px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        background: '#151a26',
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
                      {showtimesCount > 0 ? (
                        <span className="badge badge-warning" title={`${showtimesCount} active showtimes`}>
                          {showtimesCount} Scheduled
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#1c2438', color: '#94a3b8' }}>
                          0 Shows (Unscheduled)
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(m)}
                          title="Edit Movie"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(m)}
                          title="Delete Movie"
                        >
                          <Trash2 size={13} /> Delete
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
                  <label>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) })}
                  />
                </div>

                <div className="form-group">
                  <label>Rating (0.0 - 10.0)</label>
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
                      border: '1px solid #1f2736',
                      borderRadius: '8px',
                      background: '#0c1018'
                    }}>
                      <table style={{ width: '100%', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: '#131826', textAlign: 'left' }}>
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
                              <tr key={st.show_id} style={{ borderBottom: '1px solid #1c2333' }}>
                                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                  #{st.show_id}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{st.theater_name}</div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Screen {st.screen_number}</div>
                                </td>
                                <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>
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
                                      className="badge"
                                      style={{ background: '#182032', color: '#94a3b8' }}
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

                <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.45', marginBottom: '18px' }}>
                  <strong>How to resolve:</strong> To delete this movie title, first navigate to <em>Showtime Programming</em> and reassign or delete the associated screening slots.
                </p>

                {/* Modal Footer with Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1f2736', paddingTop: '16px' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #1f2736', paddingTop: '16px' }}>
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
