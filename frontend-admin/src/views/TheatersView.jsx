import React from 'react';
import { Building2, MapPin, Monitor } from 'lucide-react';

export default function TheatersView({ theaters = [] }) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Cinemas & Screening Auditoriums</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Physical theater locations and screen capacity hierarchy
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
        {theaters.map(t => (
          <div key={t.theater_id} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building2 size={20} color="#e11d48" />
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t.theater_name}</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.82rem' }}>
                  <MapPin size={14} /> {t.city} • {t.address}
                </div>
              </div>
              <span className="badge badge-info">Theater #{t.theater_id}</span>
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid #1e293b', paddingTop: '14px' }}>
              <div style={{
                fontSize: '0.74rem',
                textTransform: 'uppercase',
                color: '#64748b',
                fontWeight: 700,
                letterSpacing: '0.5px',
                marginBottom: '10px'
              }}>
                Installed Screening Auditoriums:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {t.screens?.map(s => (
                  <div key={s.screen_id} style={{
                    background: '#0b111e',
                    border: '1px solid #1e293b',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Monitor size={16} color="#38bdf8" />
                      <div>
                        <strong>Screen {s.screen_number}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Screen ID #{s.screen_id}</div>
                      </div>
                    </div>
                    <span className="badge badge-warning">Capacity: {s.capacity} seats</span>
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

