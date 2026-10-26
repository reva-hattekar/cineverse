import React, { useState } from 'react';
import { Search, MapPin, User, Ticket, Film, Sparkles, ChevronDown, Check } from 'lucide-react';

/**
 * CinemaNavbar
 * Bespoke navigation bar matching the CINEVERSE visual reference.
 * Includes spaced editorial brand mark, live search, city selector,
 * customer tier profile switcher, and persistent views.
 */
export default function CinemaNavbar({
  currentView,
  setCurrentView,
  currentCustomer,
  customers = [],
  onSwitchCustomer,
  searchQuery,
  setSearchQuery,
  selectedCity = 'Jaipur',
  setSelectedCity
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showExperiencesModal, setShowExperiencesModal] = useState(false);
  const [showTheatresModal, setShowTheatresModal] = useState(false);

  const cities = ['Jaipur', 'Mumbai', 'Delhi NCR', 'Bengaluru'];

  return (
    <>
      <header className="cineverse-nav-header">
        <div className="cineverse-nav-inner">
          {/* Left: Brand & Main Navigation */}
          <div className="nav-brand-section">
            <div
              className="cineverse-wordmark"
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              role="button"
              tabIndex={0}
            >
              CINEVERSE
            </div>

            <div className="nav-divider" />

            <nav className="nav-menu-links">
              <button
                className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Now Showing
              </button>
              <button
                className={`nav-link-btn ${currentView === 'upcoming' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('upcoming');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Coming Soon
              </button>
              <button
                className="nav-link-btn"
                onClick={() => setShowExperiencesModal(true)}
              >
                Experiences
              </button>
              <button
                className="nav-link-btn"
                onClick={() => setShowTheatresModal(true)}
              >
                Theatres
              </button>
              <button
                className={`nav-link-btn nav-link-bookings ${currentView === 'bookings' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('bookings');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Ticket size={14} style={{ marginRight: 5 }} /> My Bookings
              </button>
            </nav>
          </div>

          {/* Right: Search, City, & Profile */}
          <div className="nav-actions-section">
            {/* Search Input */}
            <div className="nav-search-container">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search movies, theatres..."
                value={searchQuery || ''}
                onChange={(e) => {
                  if (currentView !== 'home') setCurrentView('home');
                  if (setSearchQuery) setSearchQuery(e.target.value);
                }}
                className="nav-search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery && setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>

            {/* City Selector */}
            <div className="nav-dropdown-wrapper">
              <button
                className="nav-city-btn"
                onClick={() => setShowCityMenu(!showCityMenu)}
                aria-expanded={showCityMenu}
              >
                <MapPin size={14} className="city-pin-icon" />
                <span>{selectedCity}</span>
                <ChevronDown size={13} />
              </button>

              {showCityMenu && (
                <div className="nav-popover-menu city-menu">
                  <div className="menu-header-label">Select City</div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      className={`menu-option-item ${selectedCity === city ? 'selected' : ''}`}
                      onClick={() => {
                        if (setSelectedCity) setSelectedCity(city);
                        setShowCityMenu(false);
                      }}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <Check size={14} color="#e11d48" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Profile Pill & Switcher */}
            <div className="nav-dropdown-wrapper">
              <button
                className="nav-profile-pill"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-expanded={showProfileMenu}
                title="Customer Profile Switcher"
              >
                <div className="nav-avatar-circle">
                  {currentCustomer?.customer_name ? (
                    currentCustomer.customer_name.charAt(0).toUpperCase()
                  ) : (
                    <User size={14} />
                  )}
                </div>
                <span className="profile-name-text">
                  {currentCustomer?.customer_name?.split(' ')[0] || 'Guest'}
                </span>
                <ChevronDown size={13} className="profile-chevron" />
              </button>

              {showProfileMenu && (
                <div className="nav-popover-menu profile-menu">
                  <div className="menu-header-label">Switch Active Demo Customer</div>
                  <div className="profile-options-list">
                    {customers.map((c) => (
                      <button
                        key={c.customer_id}
                        className={`profile-option-row ${
                          currentCustomer?.customer_id === c.customer_id ? 'active-profile' : ''
                        }`}
                        onClick={() => {
                          onSwitchCustomer(c.customer_id);
                          setShowProfileMenu(false);
                        }}
                      >
                        <div className="profile-row-info">
                          <span className="profile-row-name">{c.customer_name}</span>
                          <span className="profile-row-tier">{c.membership_level || 'Bronze'} Tier</span>
                        </div>
                        {currentCustomer?.customer_id === c.customer_id && (
                          <Check size={14} color="#e11d48" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="menu-divider" />

                  <button
                    className="menu-action-link"
                    onClick={() => {
                      setCurrentView('bookings');
                      setShowProfileMenu(false);
                    }}
                  >
                    <Ticket size={14} /> View Confirmed Tickets
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Experiences Modal */}
      {showExperiencesModal && (
        <div className="cinema-modal-backdrop" onClick={() => setShowExperiencesModal(false)}>
          <div className="cinema-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Sparkles size={18} color="#e11d48" />
                <h3>CINEVERSE Premium Formats</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowExperiencesModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="experience-item">
                <div className="exp-badge">IMAX 70MM</div>
                <p>The pinnacle of visual immersion with massive 1.43:1 dual-laser projection and 12-channel audio.</p>
              </div>
              <div className="experience-item">
                <div className="exp-badge">CINEVERSE LUXE</div>
                <p>Ultra-plush zero-gravity motorized recliners, personal butler service, and artisanal dining.</p>
              </div>
              <div className="experience-item">
                <div className="exp-badge">DOLBY ATMOS LASER</div>
                <p>Full 360-degree spatial acoustic precision and high-dynamic-range laser projection.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theatres Modal */}
      {showTheatresModal && (
        <div className="cinema-modal-backdrop" onClick={() => setShowTheatresModal(false)}>
          <div className="cinema-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Film size={18} color="#e11d48" />
                <h3>Our Theatres in {selectedCity}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowTheatresModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="experience-item">
                <div className="exp-badge">CINEVERSE Grand Zenith — Mall of Jaipur</div>
                <p>Screens: Audi 1 (IMAX Laser), Audi 2 (Luxe VIP), Audi 3 (Dolby Atmos). 450 luxury seats.</p>
              </div>
              <div className="experience-item">
                <div className="exp-badge">CINEVERSE Crystal Palm — C-Scheme</div>
                <p>Boutique 4-screen multiplex with premium recliner auditoriums and gourmet lounge.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
