import React, { useState, useEffect } from 'react';
import { LogOut, User, Activity, Calendar, ShieldCheck } from 'lucide-react';

export default function AdminHeader({ activeTitle, adminUser, onLogout, systemHealth }) {
  const isDbOnline = systemHealth?.database?.connected;
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setCurrentDateStr(formatted);
    };
    updateDate();
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="admin-header">
      <div className="header-left">
        <div>
          <div className="page-breadcrumb">Control Room › Management</div>
          <h1 className="page-heading" style={{ margin: 0 }}>{activeTitle}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Optional Current Date Display */}
        <div className="header-clock-pill">
          <Calendar size={13} color="#94a3b8" />
          <span>{currentDateStr || '27 Oct 2026'}</span>
        </div>

        {/* Database System Health Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.76rem',
          padding: '5px 11px',
          borderRadius: '20px',
          background: isDbOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(225, 29, 72, 0.12)',
          color: isDbOnline ? '#34d399' : '#fda4af',
          border: `1px solid ${isDbOnline ? 'rgba(16, 185, 129, 0.28)' : 'rgba(225, 29, 72, 0.28)'}`
        }}>
          <Activity size={13} className={isDbOnline ? 'system-pulse' : ''} />
          <span style={{ fontWeight: 600 }}>MySQL {isDbOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* User Identity Pill */}
        {adminUser && (
          <div className="user-badge">
            <User size={15} color="#94a3b8" />
            <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{adminUser.staff_name}</span>
            <span className="role-pill">{adminUser.role || 'Staff'}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onLogout}
          title="Sign Out of Control Room"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
