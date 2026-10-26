import React from 'react';

/**
 * Realistic Cinema Armchair SVG
 */
export function CinemaArmchair({
  seatNumber,
  seatType = 'REGULAR',
  isBooked = false,
  isSelected = false,
  onClick,
  interactive = false
}) {
  const number = seatNumber.replace(/^[A-Za-z]+/, '');

  let statusClass = 'seat-armchair-available';
  if (isBooked) statusClass = 'seat-armchair-booked';
  else if (isSelected) statusClass = 'seat-armchair-selected';
  else if (seatType === 'VIP') statusClass = 'seat-armchair-vip';

  return (
    <button
      type="button"
      className={`cinema-seat-btn ${statusClass} ${interactive ? 'clickable' : 'readonly'}`}
      onClick={interactive && !isBooked ? onClick : undefined}
      disabled={isBooked}
      title={`Seat ${seatNumber} (${seatType}) — ${isBooked ? 'SOLD OUT' : isSelected ? 'SELECTED' : 'AVAILABLE'}`}
    >
      <svg
        width="32"
        height="28"
        viewBox="0 0 34 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="seat-armchair-svg"
      >
        {/* Left Armrest */}
        <rect x="1" y="9" width="3.2" height="15" rx="1.6" className="armrest-shape" />
        {/* Right Armrest */}
        <rect x="29.8" y="9" width="3.2" height="15" rx="1.6" className="armrest-shape" />
        {/* Backrest */}
        <rect x="5.5" y="1" width="23" height="13" rx="3.5" className="backrest-shape" />
        {/* Seat Cushion */}
        <rect x="5.5" y="15" width="23" height="12" rx="2.5" className="cushion-shape" />
        {/* Seat number inside cushion */}
        <text
          x="17"
          y="23.5"
          textAnchor="middle"
          className="seat-number-text"
        >
          {number}
        </text>
      </svg>
    </button>
  );
}

/**
 * Reusable Auditorium Seat Map based on BookMyShow / District layout
 */
export default function AuditoriumSeatMap({
  showtime,
  seats = [],
  selectedSeatIds = [],
  onToggleSeat,
  interactive = false
}) {
  // Group seats by tier and row
  const tiers = {
    VIP: {},
    REGULAR: {}
  };

  seats.forEach(seat => {
    const tier = seat.seat_type === 'VIP' ? 'VIP' : 'REGULAR';
    const row = seat.seat_number.charAt(0);
    if (!tiers[tier][row]) {
      tiers[tier][row] = [];
    }
    tiers[tier][row].push(seat);
  });

  const renderTierBlock = (tierName, rowsObj, title, price) => {
    const rowKeys = Object.keys(rowsObj).sort();
    if (rowKeys.length === 0) return null;

    return (
      <div className="seat-tier-section" key={tierName}>
        <div className="seat-tier-header">
          <span className="seat-tier-title">{title}</span>
          {price && <span className="seat-tier-price">₹{price}</span>}
        </div>

        <div className="seat-tier-grid">
          {rowKeys.map(row => {
            const rowSeats = rowsObj[row].sort((a, b) => {
              const numA = parseInt(a.seat_number.replace(/\D/g, ''), 10);
              const numB = parseInt(b.seat_number.replace(/\D/g, ''), 10);
              return numA - numB;
            });

            const midpoint = Math.ceil(rowSeats.length / 2);

            return (
              <div key={row} className="auditorium-seat-row">
                <span className="row-letter left">{row}</span>

                <div className="row-seats-cluster">
                  {rowSeats.slice(0, midpoint).map(seat => (
                    <CinemaArmchair
                      key={seat.seat_id}
                      seatNumber={seat.seat_number}
                      seatType={seat.seat_type}
                      isBooked={!!seat.is_booked}
                      isSelected={selectedSeatIds.includes(seat.seat_id)}
                      onClick={() => onToggleSeat && onToggleSeat(seat)}
                      interactive={interactive}
                    />
                  ))}

                  {/* Central Aisle */}
                  <div className="central-auditorium-aisle" />

                  {rowSeats.slice(midpoint).map(seat => (
                    <CinemaArmchair
                      key={seat.seat_id}
                      seatNumber={seat.seat_number}
                      seatType={seat.seat_type}
                      isBooked={!!seat.is_booked}
                      isSelected={selectedSeatIds.includes(seat.seat_id)}
                      onClick={() => onToggleSeat && onToggleSeat(seat)}
                      interactive={interactive}
                    />
                  ))}
                </div>

                <span className="row-letter right">{row}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const vipPrice = showtime ? (parseFloat(showtime.base_price) * 1.5).toFixed(0) : null;
  const regularPrice = showtime ? parseFloat(showtime.base_price).toFixed(0) : null;

  return (
    <div className="auditorium-seat-map-wrapper">
      {/* Curved Screen Indicator */}
      <div className="cinema-screen-arch-container">
        <svg viewBox="0 0 600 48" className="cinema-screen-svg">
          <defs>
            <linearGradient id="screenBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="screenCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#384358" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#384358" />
            </linearGradient>
          </defs>
          <path d="M 40 44 Q 300 12 560 44 L 540 8 Q 300 0 60 8 Z" fill="url(#screenBeamGrad)" />
          <path d="M 40 40 Q 300 8 560 40" stroke="url(#screenCurveGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </svg>
        <div className="cinema-screen-caption">ALL EYES THIS WAY • SCREEN</div>
      </div>

      {/* Tier Blocks: VIP First, Regular Below */}
      <div className="auditorium-seating-area">
        {renderTierBlock('VIP', tiers.VIP, 'PREMIUM VIP RECLINERS', vipPrice)}
        {renderTierBlock('REGULAR', tiers.REGULAR, 'EXECUTIVE SEATING', regularPrice)}
      </div>

      {/* Seating Legend */}
      <div className="auditorium-legend-bar">
        <div className="legend-item">
          <div className="legend-indicator available" />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator selected" />
          <span>Selected (Amber)</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator booked" />
          <span>Booked (Sold)</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator vip" />
          <span>VIP Tier</span>
        </div>
      </div>
    </div>
  );
}

