import React from 'react';
import { Building2, MapPin, Monitor, Film } from 'lucide-react';

function getBadgeClass(screenType = '') {
  const lower = screenType.toLowerCase();
  if (lower.includes('imax')) return 'badge-imax';
  if (lower.includes('dolby')) return 'badge-dolby';
  if (lower.includes('4dx')) return 'badge-4dx';
  if (lower.includes('vip') || lower.includes('recliner')) return 'badge-vip';
  return 'badge-info';
}

export default function TheatersView({ theaters = [] }) {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: '#ffffff' }}>
          Multiplex Cinemas & Screening Auditoriums
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Physical cinema complexes, auditorium hierarchy, and format capabilities
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
        {theaters.map(t => (
          <div key={t.theater_id} className="kpi-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building2 size={20} color="#fb7185" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {t.theater_name}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.82rem' }}>
                  <MapPin size={13} /> {t.city} • {t.address}
                </div>
              </div>
              <span className="badge badge-info">Multiplex #{t.theater_id}</span>
            </div>

            <div style={{ marginTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
              <div style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                color: '#64748b',
                fontWeight: 800,
                letterSpacing: '0.08em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Installed Auditoriums:</span>
                <span style={{ color: '#94a3b8' }}>{t.screens?.length || 4} Screens</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {t.screens?.map(s => (
                  <div key={s.screen_id} style={{
                    background: '#0e1017',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Monitor size={16} color="#38bdf8" />
                      <div>
                        <strong style={{ color: '#f1f5f9', fontSize: '0.88rem' }}>
                          {s.screen_name || `Screen ${s.screen_number}`}
                        </strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Screen ID #{s.screen_id}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {s.screen_type && (
                        <span className={`badge ${getBadgeClass(s.screen_type)}`}>
                          {s.screen_type}
                        </span>
                      )}
                      <span className="badge badge-warning" style={{ color: '#f59e0b' }}>
                        {s.capacity || 142} Seats
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
