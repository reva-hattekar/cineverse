import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  CalendarDays,
  Armchair,
  Ticket,
  CreditCard,
  Popcorn,
  Users,
  ShieldCheck,
  BarChart3,
  Clapperboard,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';

export default function AdminSidebar({ collapsed, onToggleCollapse }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(prev => !prev));

  const menuItems = [
    { path: '/overview', label: 'Operations Overview', icon: LayoutDashboard },
    { path: '/movies', label: 'Movie Catalog', icon: Film },
    { path: '/theaters', label: 'Theaters & Screens', icon: Building2 },
    { path: '/showtimes', label: 'Showtime Programming', icon: CalendarDays },
    { path: '/seats', label: 'Seat Availability Map', icon: Armchair },
    { path: '/bookings', label: 'Bookings & Reservations', icon: Ticket },
    { path: '/payments', label: 'Payment Audit', icon: CreditCard },
    { path: '/snacks', label: 'Concessions & F&B', icon: Popcorn },
    { path: '/customers', label: 'Customers & Loyalty', icon: Users },
    { path: '/staff', label: 'Staff Access Control', icon: ShieldCheck },
    { path: '/reports', label: 'Revenue Analytics', icon: BarChart3 }
  ];

  return (
    <aside
      className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? '78px' : '260px',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          className="brand-header"
          style={{
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '8px 0 16px' : '4px 8px 18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-icon" title="CINEVERSE Multiplex Operations">
              <Clapperboard size={18} />
            </div>
            {!isCollapsed && (
              <div>
                <div className="brand-title">
                  CINEVERSE
                  <span className="brand-dot" />
                </div>
                <div className="brand-sub">Operations Control</div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{
              padding: '4px',
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              display: isCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle navigation drawer"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Collapsed expander icon */}
        {isCollapsed && (
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{
                padding: '4px',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={toggleCollapse}
              title="Expand Sidebar"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Nav Links */}
        <nav className="sidebar-nav-container">
          <ul className="sidebar-nav">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    style={{
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      padding: isCollapsed ? '10px 0' : '9px 12px'
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={17} className="nav-icon" />
                    {!isCollapsed && <span className="nav-text">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer System Status */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="footer-meta-row">
            <span className="footer-meta-label">
              <Database size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Database
            </span>
            <span className="footer-meta-val">MovieTheaterDB</span>
          </div>
          <div className="footer-meta-row">
            <span className="footer-meta-label">
              <Cpu size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Engine
            </span>
            <span className="footer-meta-val" style={{ color: '#10b981' }}>InnoDB 8.x</span>
          </div>
          <div className="footer-meta-row">
            <span className="footer-meta-label">Integrity</span>
            <span className="footer-meta-val" style={{ color: '#fb7185' }}>ACID Strict</span>
          </div>
        </div>
      )}
    </aside>
  );
}
