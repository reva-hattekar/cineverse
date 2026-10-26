import React from 'react';
import { LogOut, User, Activity } from 'lucide-react';

export default function AdminHeader({ activeTitle, adminUser, onLogout, systemHealth }) {
  const isDbOnline = systemHealth?.database?.connected;

  return (
    <header className="admin-header">
      <div className="header-left">
        <h2 className="page-heading">{activeTitle}</h2>
      </div>

      <div className="header-right">
        {/* System Health Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          padding: '4px 10px',
          borderRadius: '20px',
          background: isDbOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: isDbOnline ? '#34d399' : '#f87171',
          border: `1px solid ${isDbOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          <Activity size={14} />
          <span>MySQL {isDbOnline ? 'Connected' : 'Offline'}</span>
        </div>

        {/* User Identity Pill */}
        {adminUser && (
          <div className="user-badge">
            <User size={16} color="#94a3b8" />
            <span style={{ fontWeight: 600 }}>{adminUser.staff_name}</span>
            <span className="role-pill">{adminUser.role}</span>
          </div>
        )}

        {/* Logout Button */}
        <button className="btn btn-secondary btn-sm" onClick={onLogout} title="Sign Out">
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

