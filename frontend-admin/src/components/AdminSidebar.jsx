import React from 'react';
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
  Clapperboard
} from 'lucide-react';

export default function AdminSidebar() {
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
    <aside className="admin-sidebar">
      <div>
        <div className="brand-header">
          <div className="brand-icon">
            <Clapperboard size={20} />
          </div>
          <div>
            <div className="brand-title">CINEVERSE</div>
            <div className="brand-sub">Cinema Operations</div>
          </div>
        </div>

        <nav className="sidebar-nav-container">
          <ul className="sidebar-nav">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon size={17} className="nav-icon" />
                    <span className="nav-text">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="footer-meta-row">
          <span className="footer-meta-label">Database</span>
          <span className="footer-meta-val">MovieTheaterDB</span>
        </div>
        <div className="footer-meta-row">
          <span className="footer-meta-label">Storage Engine</span>
          <span className="footer-meta-val" style={{ color: '#10b981' }}>InnoDB 8.x</span>
        </div>
        <div className="footer-meta-row">
          <span className="footer-meta-label">Relational Status</span>
          <span className="footer-meta-val" style={{ color: '#f59e0b' }}>ACID Strict</span>
        </div>
      </div>
    </aside>
  );
}
