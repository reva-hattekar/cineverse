import React, { useEffect } from 'react';
import { Sparkles, X, Compass, Film, Volume2, Eye } from 'lucide-react';

/**
 * StepIntoRealityModal
 * Premium experiential modal triggered by the spider-web interaction.
 * - Black-glass & liquid-chrome visual language with subtle burgundy highlights
 * - Keyboard accessible (Escape key dismiss, focus management)
 * - Meaningful cinema technology details & direct CTA to view screenings
 */
export default function StepIntoRealityModal({ isOpen, onClose, onExploreMovies }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="cinema-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reality-modal-title"
    >
      <div
        className="cinema-modal-card reality-experience-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Sparkles size={18} color="#e11d48" />
            <h3 id="reality-modal-title">STEP INTO ANOTHER REALITY</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="reality-modal-body">
          <p className="reality-modal-intro">
            CINEVERSE pioneers cutting-edge exhibition architecture designed to transcend traditional movie-going into pure sensorial transport.
          </p>

          <div className="reality-format-grid">
            <div className="reality-format-card">
              <div className="format-icon-wrap">
                <Eye size={20} color="#e11d48" />
              </div>
              <div className="format-info">
                <h4>IMAX 70MM Dual-Laser</h4>
                <p>
                  Uncompressed 1.43:1 aspect ratio filling your complete peripheral vision with 4K laser precision and extraordinary contrast.
                </p>
              </div>
            </div>

            <div className="reality-format-card">
              <div className="format-icon-wrap">
                <Volume2 size={20} color="#fb7185" />
              </div>
              <div className="format-info">
                <h4>Dolby Atmos Spatial Sound</h4>
                <p>
                  64 discrete audio channels moving fluidly through 3D space above and around you for pinpoint acoustic realism.
                </p>
              </div>
            </div>

            <div className="reality-format-card">
              <div className="format-icon-wrap">
                <Film size={20} color="#f43f5e" />
              </div>
              <div className="format-info">
                <h4>Luxe VIP Lounges & Zero-G Recliners</h4>
                <p>
                  Motorized heated leather recliners with personal call-butler service and artisanal concession dining delivered to your seat.
                </p>
              </div>
            </div>
          </div>

          <div className="reality-modal-footer">
            <button
              className="hero-primary-btn"
              onClick={() => {
                onClose();
                if (onExploreMovies) onExploreMovies();
              }}
            >
              <Compass size={15} />
              <span>BROWSE ALL SCREENINGS</span>
            </button>
            <button className="hero-secondary-btn" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

