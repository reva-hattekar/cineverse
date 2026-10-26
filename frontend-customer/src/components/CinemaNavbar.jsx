import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  User,
  Ticket,
  Film,
  Sparkles,
  ChevronDown,
  Check,
  Building2,
  Star,
  Clock,
  ArrowRight
} from 'lucide-react';

/**
 * CinemaNavbar
 * Bespoke navigation bar matching the CINEVERSE visual reference.
 * Features:
 * 1. Dropdown-based search interface with keyboard navigation and instant suggestions
 * 2. City-dependent theatre listings bound directly to the database
 * 3. Customer tier switcher and modal views
 */
export default function CinemaNavbar({
  currentView,
  setCurrentView,
  currentCustomer,
  customers = [],
  onSwitchCustomer,
  searchQuery,
  setSearchQuery,
  selectedCity = 'Bengaluru',
  setSelectedCity,
  movies = [],
  theaters = [],
  onSelectMovie
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showExperiencesModal, setShowExperiencesModal] = useState(false);
  const [showTheatresModal, setShowTheatresModal] = useState(false);

  // Search Dropdown States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const cities = ['Bengaluru', 'Jaipur', 'Mumbai', 'Delhi NCR'];

  // Handle clicking outside to dismiss menus and search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search suggestions from real database movies and theatres
  const cleanQuery = (searchQuery || '').trim().toLowerCase();

  const matchingMovies = cleanQuery
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(cleanQuery) ||
          (m.genre && m.genre.toLowerCase().includes(cleanQuery)) ||
          (m.language && m.language.toLowerCase().includes(cleanQuery))
      )
    : movies.slice(0, 3); // Quick suggestions when focused

  const matchingTheatres = cleanQuery
    ? theaters
        .filter(
          (t) =>
            t.theater_name.toLowerCase().includes(cleanQuery) ||
            t.city.toLowerCase().includes(cleanQuery) ||
            t.address.toLowerCase().includes(cleanQuery)
        )
        .sort((a, b) => {
          const aInCity = a.city.toLowerCase() === selectedCity.toLowerCase();
          const bInCity = b.city.toLowerCase() === selectedCity.toLowerCase();
          if (aInCity && !bInCity) return -1;
          if (!aInCity && bInCity) return 1;
          return 0;
        })
    : theaters.filter((t) => t.city.toLowerCase() === selectedCity.toLowerCase());

  // Combined flat list for keyboard arrow navigation
  const flatSuggestions = [
    ...matchingMovies.map((m) => ({ type: 'movie', data: m })),
    ...matchingTheatres.map((t) => ({ type: 'theatre', data: t }))
  ];

  const handleKeyDown = (e) => {
    if (!isSearchOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < flatSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : flatSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && flatSuggestions[activeSuggestionIndex]) {
        executeSuggestion(flatSuggestions[activeSuggestionIndex]);
      } else if (flatSuggestions.length > 0) {
        executeSuggestion(flatSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchOpen(false);
      setActiveSuggestionIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  const executeSuggestion = (suggestion) => {
    if (suggestion.type === 'movie') {
      if (onSelectMovie) onSelectMovie(suggestion.data);
    } else if (suggestion.type === 'theatre') {
      if (setSelectedCity && suggestion.data.city) {
        setSelectedCity(suggestion.data.city);
      }
      setCurrentView('theatres');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsSearchOpen(false);
    setActiveSuggestionIndex(-1);
  };

  // Filter theatres for the selected city
  const cityTheatres = theaters.filter(
    (t) => t.city.toLowerCase() === selectedCity.toLowerCase()
  );

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') setCurrentView('home');
              }}
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
                className={`nav-link-btn ${currentView === 'theatres' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('theatres');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
            {/* Search Input with Popover Dropdown */}
            <div className="nav-search-container" ref={searchContainerRef}>
              <Search size={15} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, theatres..."
                value={searchQuery || ''}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  if (setSearchQuery) setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setActiveSuggestionIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="nav-search-input"
                aria-label="Search movies and theatres"
                aria-expanded={isSearchOpen}
                aria-autocomplete="list"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    if (setSearchQuery) setSearchQuery('');
                    setActiveSuggestionIndex(-1);
                  }}
                  aria-label="Clear search text"
                >
                  ×
                </button>
              )}

              {/* SEARCH SUGGESTIONS DROPDOWN INTERFACE */}
              {isSearchOpen && (
                <div className="nav-search-dropdown-menu" role="listbox">
                  {flatSuggestions.length > 0 ? (
                    <>
                      {/* Section 1: Matching Movies */}
                      {matchingMovies.length > 0 && (
                        <div className="search-results-section">
                          <div className="search-section-label">
                            {cleanQuery ? 'MOVIES' : 'FEATURED NOW'}
                          </div>
                          {matchingMovies.map((movie) => {
                            const itemIndex = flatSuggestions.findIndex(
                              (s) => s.type === 'movie' && s.data.movie_id === movie.movie_id
                            );
                            const isFocused = itemIndex === activeSuggestionIndex;

                            return (
                              <div
                                key={`movie-${movie.movie_id}`}
                                className={`search-suggestion-item movie-suggestion ${
                                  isFocused ? 'keyboard-active' : ''
                                }`}
                                onClick={() => executeSuggestion({ type: 'movie', data: movie })}
                                onMouseEnter={() => setActiveSuggestionIndex(itemIndex)}
                                role="option"
                                aria-selected={isFocused}
                              >
                                <div className="suggestion-poster-wrap">
                                  <img
                                    src={
                                      movie.poster_url ||
                                      'https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
                                    }
                                    alt={movie.title}
                                    className="suggestion-poster-img"
                                  />
                                </div>
                                <div className="suggestion-details">
                                  <div className="suggestion-title">{movie.title}</div>
                                  <div className="suggestion-subtext">
                                    <span>{movie.genre}</span>
                                    {movie.duration && (
                                      <>
                                        <span className="dot-sep">•</span>
                                        <span>{movie.duration}m</span>
                                      </>
                                    )}
                                    {movie.rating && (
                                      <>
                                        <span className="dot-sep">•</span>
                                        <span className="rating-tag">⭐ {movie.rating}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <span className="suggestion-action-btn">
                                  Book <ArrowRight size={12} />
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Section 2: Matching Theatres */}
                      {matchingTheatres.length > 0 && (
                        <div className="search-results-section">
                          <div className="search-section-label">
                            {cleanQuery ? 'THEATRES' : `THEATRES IN ${selectedCity.toUpperCase()}`}
                          </div>
                          {matchingTheatres.map((theatre) => {
                            const itemIndex = flatSuggestions.findIndex(
                              (s) => s.type === 'theatre' && s.data.theater_id === theatre.theater_id
                            );
                            const isFocused = itemIndex === activeSuggestionIndex;

                            return (
                              <div
                                key={`theatre-${theatre.theater_id}`}
                                className={`search-suggestion-item theatre-suggestion ${
                                  isFocused ? 'keyboard-active' : ''
                                }`}
                                onClick={() => executeSuggestion({ type: 'theatre', data: theatre })}
                                onMouseEnter={() => setActiveSuggestionIndex(itemIndex)}
                                role="option"
                                aria-selected={isFocused}
                              >
                                <div className="theatre-icon-wrap">
                                  <Building2 size={16} color="#fb7185" />
                                </div>
                                <div className="suggestion-details">
                                  <div className="suggestion-title">{theatre.theater_name}</div>
                                  <div className="suggestion-subtext">
                                    <span className="theatre-city-pill">{theatre.city}</span>
                                    <span className="dot-sep">•</span>
                                    <span className="theatre-address-text">{theatre.address}</span>
                                  </div>
                                </div>
                                <span className="suggestion-action-btn view-theatre">
                                  View <ArrowRight size={12} />
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="search-empty-state">
                      <div className="empty-state-title">No matches found</div>
                      <p className="empty-state-desc">
                        We could not find any titles or theatres matching &ldquo;
                        <strong>{searchQuery}</strong>&rdquo;.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* City Selector */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
                className="nav-city-btn"
                onClick={() => setShowCityMenu(!showCityMenu)}
                aria-expanded={showCityMenu}
                aria-label="Select City"
              >
                <MapPin size={14} className="city-pin-icon" />
                <span>{selectedCity}</span>
                <ChevronDown size={13} />
              </button>

              {showCityMenu && (
                <div className="nav-popover-menu city-menu">
                  <div className="menu-header-label">Select City</div>
                  {cities.map((city) => {
                    const count = theaters.filter(
                      (t) => t.city.toLowerCase() === city.toLowerCase()
                    ).length;

                    return (
                      <button
                        type="button"
                        key={city}
                        className={`menu-option-item ${selectedCity === city ? 'selected' : ''}`}
                        onClick={() => {
                          if (setSelectedCity) setSelectedCity(city);
                          setShowCityMenu(false);
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span>{city}</span>
                          <span style={{ fontSize: '0.68rem', color: count > 0 ? '#10b981' : '#64748b' }}>
                            {count > 0 ? `${count} Active ${count === 1 ? 'Venue' : 'Venues'}` : 'Expanding Soon'}
                          </span>
                        </div>
                        {selectedCity === city && <Check size={14} color="#e11d48" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Profile Pill & Switcher */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
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
                        type="button"
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
                    type="button"
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
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowExperiencesModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="experience-item">
                <div className="exp-badge">IMAX 70MM DUAL-LASER</div>
                <p>The pinnacle of visual immersion with massive 1.43:1 aspect ratio dual-laser projection and 12-channel spatial audio.</p>
              </div>
              <div className="experience-item">
                <div className="exp-badge">CINEVERSE LUXE VIP</div>
                <p>Ultra-plush zero-gravity motorized recliners, at-seat butler service, and artisanal gourmet dining.</p>
              </div>
              <div className="experience-item">
                <div className="exp-badge">DOLBY ATMOS LASER</div>
                <p>Full 360-degree spatial acoustic precision and high-contrast dynamic range laser projection.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theatres Modal (City-Dependent & Bound to Database) */}
      {showTheatresModal && (
        <div className="cinema-modal-backdrop" onClick={() => setShowTheatresModal(false)}>
          <div className="cinema-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Film size={18} color="#e11d48" />
                <h3>CINEVERSE Theatres in {selectedCity}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowTheatresModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {cityTheatres.length > 0 ? (
                cityTheatres.map((th) => (
                  <div key={th.theater_id} className="experience-item theatre-card-item">
                    <div className="theatre-card-header">
                      <div className="exp-badge">{th.theater_name}</div>
                      <span className="theatre-city-tag">{th.city}</span>
                    </div>
                    <p style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                      📍 {th.address}
                    </p>
                    {th.screens && th.screens.length > 0 && (
                      <div className="theatre-screens-summary">
                        {th.screens.map((sc) => (
                          <span key={sc.screen_id} className="theatre-screen-pill">
                            Screen {sc.screen_number} ({sc.capacity} Seats)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="theatre-empty-city-state">
                  <div className="empty-city-icon">
                    <MapPin size={28} color="#94a3b8" />
                  </div>
                  <h4>No Theatres Currently in {selectedCity}</h4>
                  <p>
                    CINEVERSE venues are currently operational in <strong>Bengaluru</strong> with 2 state-of-the-art complexes. Expansion to {selectedCity} is underway!
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '14px' }}
                    onClick={() => setSelectedCity && setSelectedCity('Bengaluru')}
                  >
                    Switch to Bengaluru (2 Venues Available)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
