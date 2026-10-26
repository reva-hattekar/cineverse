import React from 'react';

/**
 * ReferenceCinemaSeat
 * Exact cinema armchair SVG matching the supplied visual reference (Image 2).
 * - Rounded backrest tab with centered seat number
 * - Rounded wider base cushion with armrests
 * - Color-coded:
 *   - Available: Slate/Charcoal grey (#4a5568 / #374151)
 *   - Occupied / Reserved: Vibrant Royal Blue (#2563eb / #1d4ed8) — unselectable
 *   - Selected: Radiant Warm Amber (#f59e0b / #d97706) with golden glow
 */
export function ReferenceCinemaSeat({
  seat,
  seatNumberDisplay,
  isBooked = false,
  isSelected = false,
  onClick,
  interactive = true,
  isBlueprintOnly = false
}) {
  const displayNumber = seatNumberDisplay || (seat ? seat.seat_number.replace(/\D/g, '') : '');

  let stateClass = 'seat-state-available';
  if (isBooked || isBlueprintOnly) stateClass = 'seat-state-occupied';
  else if (isSelected) stateClass = 'seat-state-selected';

  const isClickable = interactive && !isBooked && !isBlueprintOnly && Boolean(seat);

  return (
    <button
      type="button"
      className={`cinema-seat-unit ${stateClass} ${isClickable ? 'interactive' : 'disabled'}`}
      onClick={isClickable && onClick ? onClick : undefined}
      disabled={!isClickable}
      aria-label={`Seat ${seat?.seat_number || displayNumber} — ${
        isBooked || isBlueprintOnly ? 'Occupied / Reserved' : isSelected ? 'Selected' : 'Available'
      } — ₹${seat?.price || 250}`}
      title={
        isBlueprintOnly
          ? `Seat ${displayNumber} — Reserved / Maintenance`
          : `Seat ${seat?.seat_number || displayNumber} (${seat?.seat_type || 'Standard'}) — ${
              isBooked ? 'Occupied (Sold)' : isSelected ? 'Selected' : 'Available'
            } — ₹${seat?.price || 250}`
      }
    >
      <svg
        width="26"
        height="22"
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
 * Reproduces the exact 142-seat cinema auditorium layout from the supplied visual reference (Image 2):
 * 1. Curved "SCREEN" arch at the top with downward atmospheric light glow
 * 2. Exact Tiers and Rows:
 *    - "REGULER" (Rows G [1-16], F [1-17])
 *    - "GOLD" (Rows E [1-19], D [3-17-3], C [3-17-3], B [3-17-3])
 *    - "PREMIUM" (Row A [1-21])
 * 3. 1:1 Mapping to database seat IDs and live booking state for provisioned seats
 * 4. Zero fake IDs: Blueprint seats not provisioned in current screen are shown as Reserved/Occupied
 */
export default function AuditoriumSeatMap({
  showtime,
  seats = [],
  selectedSeatIds = [],
  onToggleSeat,
  interactive = false
}) {
  // Map real database seats by seat_number (e.g. 'A1', 'B4', 'C6')
  const seatMapByNumber = {};
  seats.forEach((s) => {
    seatMapByNumber[s.seat_number.toUpperCase()] = s;
  });

  // Helper to render an individual seat block
  const renderSeats = (rowLetter, startIndex, endIndex) => {
    const seatNodes = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const seatKey = `${rowLetter}${i}`;
      const realSeat = seatMapByNumber[seatKey];
      const isBlueprintOnly = !realSeat;

      seatNodes.push(
        <ReferenceCinemaSeat
          key={seatKey}
          seat={realSeat}
          seatNumberDisplay={i}
          isBooked={Boolean(realSeat?.is_booked)}
          isSelected={realSeat ? selectedSeatIds.includes(realSeat.seat_id) : false}
          onClick={() => realSeat && onToggleSeat && onToggleSeat(realSeat)}
          interactive={interactive}
          isBlueprintOnly={isBlueprintOnly}
        />
      );
    }
    return seatNodes;
  };

  return (
    <div className="auditorium-seat-map-wrapper">
      {/* 1. Curved Screen at top (Image 2) */}
      <div className="cinema-screen-arch-container">
        <div className="screen-light-beam" />
        <svg viewBox="0 0 600 44" className="cinema-screen-svg" preserveAspectRatio="none">
          <defs>
            <filter id="screenGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M 40 40 Q 300 6 560 40"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#screenGlow)"
          />
        </svg>
        <h2 className="screen-gold-title">SCREEN</h2>
      </div>

      {/* 2. Full 142-Seat Auditorium Blueprint matching Image 2 */}
      <div className="auditorium-seating-body">
        {/* TIER 1: REGULER */}
        <div className="seat-tier-section">
          <h3 className="reference-tier-header">REGULER</h3>

          {/* Row G: seats 1 to 16 */}
          <div className="auditorium-row-container">
            <span className="row-label-tag left">G</span>
            <div className="seat-group-center continuous">
              {renderSeats('G', 1, 16)}
            </div>
            <span className="row-label-tag right">G</span>
          </div>

          {/* Row F: seats 1 to 17 */}
          <div className="auditorium-row-container">
            <span className="row-label-tag left">F</span>
            <div className="seat-group-center continuous">
              {renderSeats('F', 1, 17)}
            </div>
            <span className="row-label-tag right">F</span>
          </div>
        </div>

        {/* TIER 2: GOLD */}
        <div className="seat-tier-section">
          <h3 className="reference-tier-header">GOLD</h3>

          {/* Row E: seats 1 to 19 */}
          <div className="auditorium-row-container">
            <span className="row-label-tag left">E</span>
            <div className="seat-group-center continuous">
              {renderSeats('E', 1, 19)}
            </div>
            <span className="row-label-tag right">E</span>
          </div>

          {/* Row D: Left 1-3, Center 4-20, Right 21-23 */}
          <div className="auditorium-row-container">
            <span className="row-label-tag left">D</span>
            <div className="seat-group-left">
              {renderSeats('D', 1, 3)}
            </div>
            <div className="auditorium-aisle-gap" />
            <div className="seat-group-center">
              {renderSeats('D', 4, 20)}
            </div>
            <div className="auditorium-aisle-gap" />
            <div className="seat-group-right">
              {renderSeats('D', 21, 23)}
            </div>
            <span className="row-label-tag right">D</span>
          </div>

          {/* Row C: Left 1-3, Center 4-20, Right 21-23 */}
          <div className="auditorium-row-container">
            <span className="row-label-tag left">C</span>
            <div className="seat-group-left">
              {renderSeats('C', 1, 3)}
            </div>
            <div className="auditorium-aisle-gap" />
            <div className="seat-group-center">
              {renderSeats('C', 4, 20)}
            </div>
            <div className="auditorium-aisle-gap" />
            <div className="seat-group-right">
              {renderSeats('C', 21, 23)}
            </div>
            <span className="row-label-tag right">C</span>
          </div>

          {/* Row B: Left 1-3, Center 4-20, Right 21-23 */}
          <div className="auditorium-row-container">
            <span className="row-label-tag left">B</span>
            <div className="seat-group-left">
              {renderSeats('B', 1, 3)}
            </div>
            <div className="auditorium-aisle-gap" />
            <div className="seat-group-center">
              {renderSeats('B', 4, 20)}
            </div>
            <div className="auditorium-aisle-gap" />
            <div className="seat-group-right">
              {renderSeats('B', 21, 23)}
            </div>
            <span className="row-label-tag right">B</span>
          </div>
        </div>

        {/* TIER 3: PREMIUM */}
        <div className="seat-tier-section">
          <h3 className="reference-tier-header">PREMIUM</h3>

          {/* Row A: seats 1 to 21 */}
          <div className="auditorium-row-container">
            <span className="row-label-tag left">A</span>
            <div className="seat-group-center continuous">
              {renderSeats('A', 1, 21)}
            </div>
            <span className="row-label-tag right">A</span>
          </div>
        </div>
      </div>

      {/* 3. Seating Legend (Image 2: Available, Occupied, Selected) */}
      <div className="reference-seating-legend">
        <div className="legend-entry">
          <ReferenceCinemaSeat seatNumberDisplay="•" isBooked={false} isSelected={false} interactive={false} />
          <span>Available</span>
        </div>
        <div className="legend-entry">
          <ReferenceCinemaSeat seatNumberDisplay="•" isBooked={true} isSelected={false} interactive={false} />
          <span>Occupied</span>
        </div>
        <div className="legend-entry">
          <ReferenceCinemaSeat seatNumberDisplay="•" isBooked={false} isSelected={true} interactive={false} />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
