import React, { useState, useEffect } from 'react';
import { 
  Film, 
  RotateCcw, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Star, 
  ExternalLink,
  Layers,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { getYouTubeEmbedUrl, isValidTrailerUrl } from '../utils/trailerUtils';

export default function HeroTrailersView({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [selectedOverrides, setSelectedOverrides] = useState({ 1: '', 2: '', 3: '', 4: '' });
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loadHeroSlotsData();
  }, []);

  const loadHeroSlotsData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getHeroSlots();
      if (res.success && Array.isArray(res.slots)) {
        setSlots(res.slots);
        setAllMovies(res.allMovies || []);

        const overridesMap = { 1: '', 2: '', 3: '', 4: '' };
        res.slots.forEach(s => {
          if (s.is_manual && s.movie?.movie_id) {
            overridesMap[s.slot_id] = s.movie.movie_id;
          }
        });
        setSelectedOverrides(overridesMap);
      }
    } catch (err) {
      console.error('Failed to load hero trailer slots:', err);
      setErrorMessage(err.message || 'Unable to connect to hero trailer configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverride = async (slotId, movieId) => {
    setSavingSlot(slotId);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const res = await api.updateHeroSlot(slotId, movieId || null);
      if (res.success) {
        setStatusMessage(res.message || `Slot ${slotId} updated successfully.`);
        await loadHeroSlotsData();
      }
    } catch (err) {
      console.error('Failed to update slot:', err);
      setErrorMessage(err.message || 'Failed to update hero slot override.');
    } finally {
      setSavingSlot(null);
    }
  };

  const handleResetAllToAuto = async () => {
    if (!window.confirm('Reset all 4 hero slots to automated algorithmic selection?')) return;
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const res = await api.resetHeroSlots();
      if (res.success) {
        setStatusMessage('All hero slots reset to algorithmic priority mode.');
        await loadHeroSlotsData();
      }
    } catch (err) {
      console.error('Failed to reset hero slots:', err);
      setErrorMessage(err.message || 'Failed to reset hero slots.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cineverse-admin-view" style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <Film size={14} /> Spotlight Programming
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '4px 0 6px', color: '#f8fafc', fontFamily: 'Cinzel, Georgia, serif' }}>
            Hero Trailer Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, maxWidth: '720px' }}>
            Configure the 4 featured hero experiences and dynamic trailers presented on the customer homepage. Supports automated priority ranking and persistent manual overrides.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleResetAllToAuto}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          title="Reset all slots to automatic release-date ranking"
        >
          <RotateCcw size={15} />
          <span>Reset All to Automatic</span>
        </button>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ background: 'rgba(225, 29, 72, 0.12)', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#fb7185', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Rules Explainer Callout */}
      <div style={{ background: 'var(--bg-secondary, #0b0d13)', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', borderRadius: '10px', padding: '16px 20px', marginBottom: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ color: '#fbbf24', marginTop: '2px' }}><Layers size={18} /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>Slots 1–3: Latest Releases</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px', lineHeight: 1.4 }}>
              Automatically select the 3 newest released titles from MySQL, sorted by release date descending, with rating tiebreaker.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ color: '#e11d48', marginTop: '2px' }}><Sparkles size={18} /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>Slot 4: Coming Soon Spotlight</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px', lineHeight: 1.4 }}>
              Selects the nearest verified upcoming premiere with a future release date and zero screenings, never duplicating Slots 1–3.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ color: '#38bdf8', marginTop: '2px' }}><Info size={18} /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>Trailer Playback & Fallback</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px', lineHeight: 1.4 }}>
              If a movie has a YouTube trailer, it streams in the customer hero with muted background playback. Otherwise, high-res backdrop poster displays.
            </div>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '22px' }}>
        {slots.map((slot) => {
          const movie = slot.movie;
          const isManual = slot.is_manual;
          const isSlot4 = slot.slot_id === 4;
          const otherAssignedIds = new Set(
            slots.filter(s => s.slot_id !== slot.slot_id && s.movie).map(s => s.movie.movie_id)
          );

          return (
            <div 
              key={slot.slot_id}
              style={{
                background: 'var(--bg-elevated, #12121a)',
                borderRadius: '12px',
                border: isManual ? '1px solid rgba(225, 29, 72, 0.4)' : '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}
            >
              {/* Slot Header */}
              <div style={{ 
                padding: '14px 18px', 
                background: isManual ? 'rgba(225, 29, 72, 0.12)' : 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: isSlot4 ? '#fbbf24' : '#94a3b8', textTransform: 'uppercase' }}>
                    EXPERIENCE 0{slot.slot_id}
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#f8fafc' }}>
                    {slot.slot_label}
                  </div>
                </div>

                <span 
                  className={`badge ${isManual ? 'badge-warning' : 'badge-info'}`}
                  style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                >
                  {isManual ? 'Manual Override' : 'Auto Selected'}
                </span>
              </div>

              {/* Video / Poster Media Preview Container */}
              <div style={{ width: '100%', height: '175px', background: '#000', position: 'relative', overflow: 'hidden' }}>
                {movie?.trailer_url && isValidTrailerUrl(movie.trailer_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(movie.trailer_url, { autoplay: 0, controls: 1, mute: 0 })}
                    title={`Trailer preview for ${movie?.title}`}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundImage: `url('${movie?.backdrop_url || movie?.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Film size={12} /> Poster Backdrop Fallback
                    </div>
                  </div>
                )}
              </div>

              {/* Movie Meta Body */}
              <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  {movie?.poster_url && (
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      style={{ width: '48px', height: '68px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie ? movie.title : 'No Eligible Movie Available'}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <span>{movie?.genre || 'N/A'}</span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}>
                        <Star size={11} fill="#f59e0b" /> {movie?.rating || '8.0'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: isSlot4 ? '#fbbf24' : '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} /> {isSlot4 ? 'Premiere:' : 'Released:'} {movie?.release_date || 'Date Unknown'}
                    </div>
                  </div>
                </div>

                {/* Trailer Warning / Link */}
                {movie && !movie.has_trailer && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#fbbf24', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>No trailer URL. Customer hero will display backdrop image.</span>
                  </div>
                )}

                {movie?.trailer_url && (
                  <div style={{ marginBottom: '14px' }}>
                    <a 
                      href={movie.trailer_url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.74rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={12} /> Open YouTube Trailer Link
                    </a>
                  </div>
                )}

                {/* Manual Override Controls */}
                <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Manual Override Selection
                  </label>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-control"
                      value={selectedOverrides[slot.slot_id] || ''}
                      onChange={(e) => setSelectedOverrides({ ...selectedOverrides, [slot.slot_id]: e.target.value })}
                      style={{
                        flex: 1,
                        background: 'var(--bg-secondary, #0b0d13)',
                        border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
                        color: '#f8fafc',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="">(Automatic Ranking Mode)</option>
                      {allMovies.map((m) => {
                        const isCurrentlyInAnotherSlot = otherAssignedIds.has(m.movie_id);
                        const isUpcoming = m.is_upcoming;
                        // For slot 4: only allow upcoming
                        // For slots 1-3: only allow latest/released
                        const isInvalidForThisSlot = isSlot4 ? !isUpcoming : isUpcoming;

                        return (
                          <option 
                            key={m.movie_id} 
                            value={m.movie_id}
                            disabled={isCurrentlyInAnotherSlot || isInvalidForThisSlot}
                          >
                            {m.title} ({m.release_date || 'No Date'})
                            {isCurrentlyInAnotherSlot ? ' [Assigned in other slot]' : ''}
                            {isInvalidForThisSlot ? (isSlot4 ? ' [Not upcoming]' : ' [Upcoming title]') : ''}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      className="btn btn-primary btn-sm"
                      disabled={savingSlot === slot.slot_id}
                      onClick={() => handleSaveOverride(slot.slot_id, selectedOverrides[slot.slot_id])}
                      style={{ padding: '6px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                      title="Apply manual selection"
                    >
                      {savingSlot === slot.slot_id ? 'Saving...' : 'Apply'}
                    </button>

                    {isManual && (
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={savingSlot === slot.slot_id}
                        onClick={() => handleSaveOverride(slot.slot_id, null)}
                        style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                        title="Reset this slot to automatic"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

