import React from 'react';

/**
 * SpiderWebTrigger
 * Delicate, spider-web interactive installation suspended from the top edge of the hero.
 * Features:
 * 1. Fine glistening suspension thread extending from the hero's top edge
 * 2. Suspended web hanging at the end of the thread with silver/chrome strands & burgundy accents
 * 3. Central interactive focal point with subtle pulsation
 * 4. Gentle natural pendulum swinging motion pivoting around the top suspension anchor
 * 5. Keyboard accessible (Enter / Space) & respects prefers-reduced-motion
 */
export default function SpiderWebTrigger({ onClick }) {
  return (
    <div
      className="suspended-spider-web-assembly"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Step Into Another Reality - Explore CINEVERSE formats"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      title="Step into another reality"
    >
      {/* 1. Top Edge Suspension Anchor */}
      <div className="web-suspension-anchor">
        <div className="anchor-pin" />
      </div>

      {/* 2. Fine Suspension Filament Thread */}
      <div className="web-suspension-filament" />

      {/* 3. Hanging Spider-Web Interactive Body */}
      <div className="suspended-web-body">
        <div className="spider-web-glow-backdrop" />
        <svg
          className="spider-web-svg"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Subtle silver-chrome thread gradient */}
            <linearGradient id="silverThreadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.85" />
            </linearGradient>

            {/* Burgundy rim filament gradient */}
            <linearGradient id="burgundyThreadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#881337" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.75" />
            </linearGradient>

            {/* Central core node glow */}
            <radialGradient id="coreGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#fb7185" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#e11d48" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#450a14" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Top connection ring attaching the web to the suspension thread */}
          <circle cx="70" cy="8" r="3" stroke="url(#silverThreadGrad)" strokeWidth="0.9" fill="none" />

          {/* Outer subtle boundary guide ring */}
          <circle cx="70" cy="70" r="64" stroke="url(#burgundyThreadGrad)" strokeWidth="0.7" strokeDasharray="3 4" opacity="0.35" />

          {/* 12 Primary Radial Strands radiating from center (70,70) */}
          <g stroke="url(#silverThreadGrad)" strokeWidth="0.85" opacity="0.65">
            <line x1="70" y1="70" x2="70" y2="8" strokeWidth="1.1" stroke="url(#silverThreadGrad)" />
            <line x1="70" y1="70" x2="101" y2="16" />
            <line x1="70" y1="70" x2="124" y2="39" />
            <line x1="70" y1="70" x2="132" y2="70" />
            <line x1="70" y1="70" x2="124" y2="101" />
            <line x1="70" y1="70" x2="101" y2="124" />
            <line x1="70" y1="70" x2="70" y2="132" />
            <line x1="70" y1="70" x2="39" y2="124" />
            <line x1="70" y1="70" x2="16" y2="101" />
            <line x1="70" y1="70" x2="8" y2="70" />
            <line x1="70" y1="70" x2="16" y2="39" />
            <line x1="70" y1="70" x2="39" y2="16" />
          </g>

          {/* Concentric Catenary Arcs / Spiral Web Strands (Tier 1: inner) */}
          <path
            d="M 70 54 Q 78 56 84 62 Q 88 66 86 70 Q 88 78 84 82 Q 78 86 70 86 Q 62 86 56 82 Q 52 78 54 70 Q 52 62 56 58 Z"
            stroke="url(#silverThreadGrad)"
            strokeWidth="0.75"
            fill="none"
            opacity="0.7"
          />

          {/* Concentric Catenary Arcs (Tier 2: middle) */}
          <path
            d="M 70 38 Q 83 41 94 50 Q 101 59 102 70 Q 101 81 94 90 Q 83 99 70 102 Q 57 99 46 90 Q 39 81 38 70 Q 39 59 46 50 Z"
            stroke="url(#silverThreadGrad)"
            strokeWidth="0.75"
            fill="none"
            opacity="0.6"
          />

          {/* Concentric Catenary Arcs (Tier 3: outer) */}
          <path
            d="M 70 20 Q 90 24 107 37 Q 119 51 120 70 Q 119 89 107 103 Q 90 116 70 120 Q 50 116 33 103 Q 21 89 20 70 Q 21 51 33 37 Z"
            stroke="url(#silverThreadGrad)"
            strokeWidth="0.75"
            fill="none"
            opacity="0.45"
          />

          {/* Delicate burgundy accent strand connecting diagonal anchors */}
          <path
            d="M 39 16 Q 70 28 101 16 M 124 39 Q 112 70 124 101 M 101 124 Q 70 112 39 124 M 16 101 Q 28 70 16 39"
            stroke="url(#burgundyThreadGrad)"
            strokeWidth="0.9"
            fill="none"
            opacity="0.75"
          />

          {/* Delicate dewdrops at radial intersection nodes */}
          <circle cx="84" cy="62" r="1.3" fill="#ffffff" opacity="0.85" />
          <circle cx="56" cy="58" r="1.3" fill="#ffffff" opacity="0.85" />
          <circle cx="94" cy="50" r="1.6" fill="#fb7185" opacity="0.9" />
          <circle cx="46" cy="90" r="1.6" fill="#fb7185" opacity="0.9" />
          <circle cx="107" cy="37" r="1.8" fill="#ffffff" opacity="0.8" />
          <circle cx="33" cy="103" r="1.8" fill="#ffffff" opacity="0.8" />

          {/* Central Luminous Chrome/Ruby Focal Node */}
          <circle cx="70" cy="70" r="9" fill="url(#coreGlowGrad)" className="spider-web-core" />
          <circle cx="70" cy="70" r="3.2" fill="#ffffff" />
        </svg>

        <div className="spider-web-caption">
          <span>STEP INTO ANOTHER REALITY</span>
        </div>
      </div>
    </div>
  );
}
