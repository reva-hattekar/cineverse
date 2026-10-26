import React from 'react';
import { Clapperboard, Ticket, Film, Calendar, User, Award } from 'lucide-react';

export default function CinemaNavbar({
  currentView,
  setCurrentView,
  currentCustomer,
  customers,
  onSwitchCustomer
}) {
  return (
    <nav className="cinema-nav">
      <div className="brand-logo" onClick={() => setCurrentView('home')}>
        <span className="brand-badge">
          <Clapperboard size={20} color="#fff" />
        </span>
        <span>CINEVERSE</span>
      </div>

      <ul className="nav-links">
        <li>
          <button
            className={`nav-item-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            <Film size={16} /> Now Showing
          </button>
        </li>
        <li>
          <button
            className={`nav-item-btn ${currentView === 'upcoming' ? 'active' : ''}`}
            onClick={() => setCurrentView('upcoming')}
          >
            <Calendar size={16} /> Upcoming
          </button>
        </li>
        <li>
          <button
            className={`nav-item-btn ${currentView === 'bookings' ? 'active' : ''}`}
            onClick={() => setCurrentView('bookings')}
          >
            <Ticket size={16} /> My Bookings
          </button>
        </li>
      </ul>

      {/* Demo Customer Profile Switcher */}
      <div className="customer-profile-pill">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={15} color="#e11d48" />
          <select
            value={currentCustomer?.customer_id || 1}
            onChange={(e) => onSwitchCustomer(parseInt(e.target.value, 10))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontWeight: 700,
              fontSize: '0.84rem',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            {customers.map(c => (
              <option key={c.customer_id} value={c.customer_id} style={{ background: '#121829', color: '#fff' }}>
                {c.customer_name} ({c.membership_level || 'Bronze'} Tier)
              </option>
            ))}
          </select>
        </div>
        {currentCustomer?.membership_level && (
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(225, 29, 72, 0.15)',
            color: '#fb7185',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Award size={12} /> {currentCustomer.membership_level}
          </span>
        )}
      </div>
    </nav>
  );
}

