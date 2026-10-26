import React from 'react';

/**
 * SpiderWebTrigger
 * Delicate, spider-web-inspired interactive element replacing the rotating circular badge.
 * - Fine silver/chrome radial threads and concentric catenary loops
 * - Restrained burgundy accents and a central interactive luminous node
 * - Interactive hover & keyboard trigger opening the "STEP INTO ANOTHER REALITY" modal
 */
export default function SpiderWebTrigger({ onClick }) {
  return (
    <div
      className="spider-web-interactive-container"
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
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
          </linearGradient>

          {/* Burgundy rim filament gradient */}
          <linearGradient id="burgundyThreadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#881337" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.65" />
          </linearGradient>

          {/* Central core node glow */}
          <radialGradient id="coreGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#fb7185" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#e11d48" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#450a14" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer subtle boundary glow ring */}
        <circle cx="70" cy="70" r="64" stroke="url(#burgundyThreadGrad)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.4" />

        {/* 12 Primary Radial Strands radiating from center (70,70) */}
        <g stroke="url(#silverThreadGrad)" strokeWidth="0.85" opacity="0.6">
          <line x1="70" y1="70" x2="70" y2="8" />
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
  );
}

