import React from 'react';

export default function Navbar({ mode, setMode, systemStatus, adminUser, onLogout }) {
  const isOnline = systemStatus?.database?.connected;

  return (
    <header className="app-header">
      <div className="logo-area">
        <div className="brand-badge">
          🎬 CineTicket Engine
        </div>
        <span className="brand-tag">RDBMS Lab Project (Exp 1–8)</span>
      </div>

      <div className="header-actions">
        {/* System Health Indicator */}
        <div 
          className={`health-pill ${isOnline ? 'online' : 'offline'}`}
          title={systemStatus?.database?.message || 'Connecting to backend...'}
        >
          <span className="status-dot"></span>
          <span>MySQL: {isOnline ? 'Connected' : 'Offline / Check .env'}</span>
        </div>

        {/* Portal Mode Switcher */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'admin' ? 'active' : ''}`}
            onClick={() => setMode('admin')}
          >
            🛡️ Admin Dashboard
          </button>
          <button
            className={`mode-btn ${mode === 'customer' ? 'active' : ''}`}
            onClick={() => setMode('customer')}
          >
            🎟️ Customer Portal
          </button>
        </div>

        {/* Admin logged in indicator / logout */}
        {mode === 'admin' && adminUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              👤 {adminUser.staff_name} ({adminUser.role})
            </span>
            <button className="btn btn-secondary btn-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

