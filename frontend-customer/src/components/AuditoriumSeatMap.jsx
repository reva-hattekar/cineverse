import React from 'react';

/**
 * ReferenceCinemaSeat
 * Exact cinema armchair SVG matching the supplied visual reference (Image 2).
 * - Rounded backrest with centered seat number
 * - Rounded wider base cushion
 * - Color-coded:
 *   - Available: Slate/Charcoal grey (#4a5568 / #374151)
 *   - Occupied: Vibrant Royal Blue (#2563eb / #1d4ed8) — unselectable
 *   - Selected: Radiant Warm Amber (#f59e0b / #d97706) with golden glow
 */
export function ReferenceCinemaSeat({
  seat,
  seatNumberDisplay,
  isBooked = false,
  isSelected = false,
  onClick,
  interactive = true
}) {
  const seatId = seat?.seat_id;
  const displayNumber = seatNumberDisplay || (seat ? seat.seat_number.replace(/\D/g, '') : '');

  let stateClass = 'seat-state-available';
  if (isBooked) stateClass = 'seat-state-occupied';
  else if (isSelected) stateClass = 'seat-state-selected';

  return (
    <button
      type="button"
      className={`cinema-seat-unit ${stateClass} ${interactive && !isBooked ? 'interactive' : 'disabled'}`}
      onClick={interactive && !isBooked && onClick ? onClick : undefined}
      disabled={isBooked}
      aria-label={`Seat ${seat?.seat_number || displayNumber} — ${
        isBooked ? 'Occupied' : isSelected ? 'Selected' : 'Available'
      } — ₹${seat?.price || 250}`}
      title={`Seat ${seat?.seat_number || displayNumber} (${seat?.seat_type || 'Standard'}) — ${
        isBooked ? 'Occupied' : isSelected ? 'Selected' : 'Available'
      } — ₹${seat?.price || 250}`}
    >
      <svg
        width="28"
        height="24"
        viewBox="0 0 28 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="seat-armchair-svg"
      >
        {/* Upper Backrest Tab */}
        <path
          d="M 5 2 C 5 0.9 5.9 0 7 0 L 21 0 C 22.1 0 23 0.9 23 2 L 23 11 L 5 11 Z"
          className="seat-svg-backrest"
        />
        {/* Lower Seat Cushion with armrests */}
        <path
          d="M 2 12 C 2 10.9 2.9 10 4 10 L 24 10 C 25.1 10 26 10.9 26 12 L 26 18.5 C 26 21 24 23 21.5 23 L 6.5 23 C 4 23 2 21 2 18.5 Z"
          className="seat-svg-cushion"
        />
        {/* Seat number inside upper tab */}
        <text
          x="14"
          y="8.2"
          textAnchor="middle"
          className="seat-svg-number"
        >
          {displayNumber}
        </text>
      </svg>
    </button>
  );
}

/**
 * AuditoriumSeatMap
 * Reproduces the exact cinema auditorium layout from the supplied visual reference (Image 2):
 * 1. Curved "SCREEN" arch at the top with downward atmospheric light glow
 * 2. Tiers in warm amber/gold serif typography:
 *    - "REGULER" (Rows G, F / Standard tier)
 *    - "GOLD" (Rows E, D, C, B / Premium tier with left, center, and right blocks)
 *    - "PREMIUM" (Row A / VIP tier)
 * 3. Exact seat shape, row labels, aisle gaps, and bottom legend (Available, Occupied, Selected)
 * 4. Binds directly to database seat IDs and showtime availability.
 */
export default function AuditoriumSeatMap({
  showtime,
  seats = [],
  selectedSeatIds = [],
  onToggleSeat,
  interactive = true
}) {
  // Map seats by seat_number for O(1) lookup
  const seatMapByNumber = {};
  seats.forEach((s) => {
    seatMapByNumber[s.seat_number.toUpperCase()] = s;
  });

  // Group database seats by row letter (e.g. 'A', 'B', 'C')
  const dbRows = {};
  seats.forEach((s) => {
    const rowLetter = s.seat_number.charAt(0).toUpperCase();
    if (!dbRows[rowLetter]) dbRows[rowLetter] = [];
    dbRows[rowLetter].push(s);
  });

  // Sort each row's seats by seat number numeric index
  Object.keys(dbRows).forEach((row) => {
    dbRows[row].sort((a, b) => {
      const numA = parseInt(a.seat_number.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.seat_number.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  });

  // Render a block of seats bound to real database records
  const renderSeatBlock = (rowLetter, seatIndices) => {
    return seatIndices.map((idx) => {
      const seatKey = `${rowLetter}${idx}`;
      const realSeat = seatMapByNumber[seatKey];

      if (!realSeat) {
        // If this specific seat number is not in this screen's database,
        // render a subtle unavailable space placeholder or skip
        return (
          <div key={seatKey} className="cinema-seat-unit seat-state-empty" aria-hidden="true">
            <div className="seat-empty-spacer" />
          </div>
        );
      }

      return (
        <ReferenceCinemaSeat
          key={realSeat.seat_id}
          seat={realSeat}
          seatNumberDisplay={idx}
          isBooked={Boolean(realSeat.is_booked)}
          isSelected={selectedSeatIds.includes(realSeat.seat_id)}
          onClick={() => onToggleSeat && onToggleSeat(realSeat)}
          interactive={interactive}
        />
      );
    });
  };

  // Helper to render a full row based on Image 2 reference structure
  const renderRow = (rowLetter, leftCount, centerCount, rightCount, centerStart = 1) => {
    const hasSeatsInDB = Boolean(dbRows[rowLetter] && dbRows[rowLetter].length > 0);

    // If database has seats for this row, ensure we render them
    if (!hasSeatsInDB) {
      // If the database has only A, B, C, we only render rows with actual data
      // to avoid phantom non-existent seats
      return null;
    }

    const rowSeats = dbRows[rowLetter];
    const totalCount = rowSeats.length;

    // If row has standard left/center/right aisles (like B, C, D in Image 2)
    if (leftCount > 0 && rightCount > 0 && totalCount > 4) {
      const leftSeats = rowSeats.slice(0, Math.min(leftCount, 3));
      const rightSeats = rowSeats.slice(Math.max(0, totalCount - Math.min(rightCount, 3)));
      const centerSeats = rowSeats.slice(leftSeats.length, totalCount - rightSeats.length);

      return (
        <div key={rowLetter} className="auditorium-row-container">
          <span className="row-label-tag left">{rowLetter}</span>

          <div className="seat-group-left">
            {leftSeats.map((s) => (
              <ReferenceCinemaSeat
                key={s.seat_id}
                seat={s}
                seatNumberDisplay={s.seat_number.replace(/\D/g, '')}
                isBooked={Boolean(s.is_booked)}
                isSelected={selectedSeatIds.includes(s.seat_id)}
                onClick={() => onToggleSeat && onToggleSeat(s)}
                interactive={interactive}
              />
            ))}
          </div>

          <div className="auditorium-aisle-gap" />

          <div className="seat-group-center">
            {centerSeats.map((s) => (
              <ReferenceCinemaSeat
                key={s.seat_id}
                seat={s}
                seatNumberDisplay={s.seat_number.replace(/\D/g, '')}
                isBooked={Boolean(s.is_booked)}
                isSelected={selectedSeatIds.includes(s.seat_id)}
                onClick={() => onToggleSeat && onToggleSeat(s)}
                interactive={interactive}
              />
            ))}
          </div>

          <div className="auditorium-aisle-gap" />

          <div className="seat-group-right">
            {rightSeats.map((s) => (
              <ReferenceCinemaSeat
                key={s.seat_id}
                seat={s}
                seatNumberDisplay={s.seat_number.replace(/\D/g, '')}
                isBooked={Boolean(s.is_booked)}
                isSelected={selectedSeatIds.includes(s.seat_id)}
                onClick={() => onToggleSeat && onToggleSeat(s)}
                interactive={interactive}
              />
            ))}
          </div>

          <span className="row-label-tag right">{rowLetter}</span>
        </div>
      );
    }

    // Single contiguous center row (like Row A, Row E, Row F, Row G in Image 2)
    return (
      <div key={rowLetter} className="auditorium-row-container">
        <span className="row-label-tag left">{rowLetter}</span>

        <div className="seat-group-center continuous">
          {rowSeats.map((s) => (
            <ReferenceCinemaSeat
              key={s.seat_id}
              seat={s}
              seatNumberDisplay={s.seat_number.replace(/\D/g, '')}
              isBooked={Boolean(s.is_booked)}
              isSelected={selectedSeatIds.includes(s.seat_id)}
              onClick={() => onToggleSeat && onToggleSeat(s)}
              interactive={interactive}
            />
          ))}
        </div>

        <span className="row-label-tag right">{rowLetter}</span>
      </div>
    );
  };

  return (
    <div className="auditorium-seat-map-wrapper">
      {/* 1. Curved Screen at top (Image 2) */}
      <div className="cinema-screen-arch-container">
        <div className="screen-light-beam" />
        <svg viewBox="0 0 600 44" className="cinema-screen-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="screenBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#d4af37" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </linearGradient>
            <filter id="screenGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path d="M 40 40 Q 300 6 560 40" stroke="#f1f5f9" strokeWidth="4.5" strokeLinecap="round" fill="none" filter="url(#screenGlow)" />
        </svg>
        <h2 className="screen-gold-title">SCREEN</h2>
      </div>

      {/* 2. Seating Grid divided by Tier (matching Image 2) */}
      <div className="auditorium-seating-body">
        {/* TIER 1: REGULER */}
        {(dbRows['G'] || dbRows['F'] || dbRows['C']) && (
          <div className="seat-tier-section">
            <h3 className="reference-tier-header">REGULER</h3>
            {renderRow('G', 0, 16, 0, 1)}
            {renderRow('F', 0, 17, 0, 1)}
            {/* If DB standard row is C, render under REGULER */}
            {!dbRows['G'] && !dbRows['F'] && renderRow('C', 0, 20, 0, 1)}
          </div>
        )}

        {/* TIER 2: GOLD */}
        {(dbRows['E'] || dbRows['D'] || dbRows['B'] || (dbRows['C'] && (dbRows['G'] || dbRows['F']))) && (
          <div className="seat-tier-section">
            <h3 className="reference-tier-header">GOLD</h3>
            {renderRow('E', 0, 19, 0, 1)}
            {renderRow('D', 3, 17, 3, 4)}
            {(dbRows['G'] || dbRows['F']) && renderRow('C', 3, 17, 3, 4)}
            {renderRow('B', 3, 17, 3, 4)}
          </div>
        )}

        {/* TIER 3: PREMIUM */}
        {dbRows['A'] && (
          <div className="seat-tier-section">
            <h3 className="reference-tier-header">PREMIUM</h3>
            {renderRow('A', 0, 21, 0, 1)}
          </div>
        )}
      </div>

      {/* 3. Seating Legend (Image 2: Available, Occupied, Selected) */}
      <div className="reference-seating-legend">
        <div className="legend-entry">
          <ReferenceCinemaSeat seatNumberDisplay="1" isBooked={false} isSelected={false} interactive={false} />
          <span>Available</span>
        </div>
        <div className="legend-entry">
          <ReferenceCinemaSeat seatNumberDisplay="2" isBooked={true} isSelected={false} interactive={false} />
          <span>Occupied</span>
        </div>
        <div className="legend-entry">
          <ReferenceCinemaSeat seatNumberDisplay="3" isBooked={false} isSelected={true} interactive={false} />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
