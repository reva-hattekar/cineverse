const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');
const { normalizeTrailerUrl, getYouTubeEmbedUrl, isValidTrailerUrl } = require('../utils/trailerUtils');

const SETTINGS_FILE = path.join(__dirname, '../../data/hero_settings.json');

function loadFallbackSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('[Hero Controller] Could not load hero_settings.json:', err.message);
  }
  return { manual_overrides: {}, movie_trailers: {}, movie_release_dates: {} };
}

function saveFallbackSettings(settings) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Hero Controller] Could not save hero_settings.json:', err.message);
  }
}

/**
 * Check which hero and trailer schema elements exist in MySQL
 */
async function inspectHeroSchema() {
  try {
    const cols = await query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'MOVIE' 
        AND COLUMN_NAME IN ('trailer_url', 'release_date', 'release_status')
    `);
    const foundCols = cols.map(c => c.COLUMN_NAME);

    const tables = await query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'HERO_TRAILER_SLOT'
    `);

    return {
      hasTrailerUrl: foundCols.includes('trailer_url'),
      hasReleaseDate: foundCols.includes('release_date'),
      hasReleaseStatus: foundCols.includes('release_status'),
      hasSlotTable: tables.length > 0
    };
  } catch (err) {
    return { hasTrailerUrl: false, hasReleaseDate: false, hasReleaseStatus: false, hasSlotTable: false };
  }
}

/**
 * Get all movies from MySQL with enriched metadata
 */
async function getAllCatalogMovies(schema) {
  let sql;
  if (schema.hasReleaseDate && schema.hasTrailerUrl) {
    sql = `
      SELECT 
        m.movie_id,
        m.title,
        m.genre,
        m.duration,
        m.language,
        m.rating,
        m.poster_url,
        m.backdrop_url,
        DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
        m.release_status,
        m.trailer_url,
        COUNT(s.show_id) AS scheduled_showtimes_count
      FROM MOVIE m
      LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
      GROUP BY m.movie_id
      ORDER BY m.rating DESC, m.title ASC
    `;
  } else if (schema.hasReleaseDate) {
    sql = `
      SELECT 
        m.movie_id,
        m.title,
        m.genre,
        m.duration,
        m.language,
        m.rating,
        m.poster_url,
        m.backdrop_url,
        DATE_FORMAT(m.release_date, '%Y-%m-%d') AS release_date,
        m.release_status,
        NULL AS trailer_url,
        COUNT(s.show_id) AS scheduled_showtimes_count
      FROM MOVIE m
      LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
      GROUP BY m.movie_id
      ORDER BY m.rating DESC, m.title ASC
    `;
  } else {
    sql = `
      SELECT 
        m.movie_id,
        m.title,
        m.genre,
        m.duration,
        m.language,
        m.rating,
        m.poster_url,
        m.backdrop_url,
        NULL AS release_date,
        NULL AS release_status,
        NULL AS trailer_url,
        COUNT(s.show_id) AS scheduled_showtimes_count
      FROM MOVIE m
      LEFT JOIN SHOWTIME s ON m.movie_id = s.movie_id
      GROUP BY m.movie_id
      ORDER BY m.rating DESC, m.title ASC
    `;
  }

  const movies = await query(sql);
  const fallback = loadFallbackSettings();

  return movies.map(m => {
    const fallbackTrailer = fallback.movie_trailers[m.movie_id];
    const fallbackDate = fallback.movie_release_dates[m.movie_id];
    const finalTrailer = schema.trailer_url
      ? normalizeTrailerUrl(m.trailer_url)
      : (fallbackTrailer !== undefined ? normalizeTrailerUrl(fallbackTrailer) : null);
    const finalReleaseDate = m.release_date || fallbackDate || null;

    return {
      ...m,
      release_date: finalReleaseDate,
      trailer_url: finalTrailer,
      embed_url: finalTrailer ? getYouTubeEmbedUrl(finalTrailer) : null,
      has_trailer: Boolean(finalTrailer && isValidTrailerUrl(finalTrailer)),
      rating: m.rating ? parseFloat(m.rating) : 8.0
    };
  });
}

/**
 * Get current manual overrides
 */
async function getManualOverrides(schema) {
  const overrides = { 1: null, 2: null, 3: null, 4: null };

  if (schema.hasSlotTable) {
    try {
      const rows = await query('SELECT slot_id, override_movie_id, is_manual FROM HERO_TRAILER_SLOT');
      rows.forEach(r => {
        if (r.is_manual && r.override_movie_id) {
          overrides[r.slot_id] = r.override_movie_id;
        }
      });
      return overrides;
    } catch (e) {
      console.warn('[Hero Controller] Failed to read HERO_TRAILER_SLOT table:', e.message);
    }
  }

  const fallback = loadFallbackSettings();
  if (fallback.manual_overrides) {
    for (let i = 1; i <= 4; i++) {
      if (fallback.manual_overrides[i]) {
        overrides[i] = fallback.manual_overrides[i];
      }
    }
  }
  return overrides;
}

/**
 * Compute the 4 dynamic hero slots following user specifications
 */
async function computeHeroSlots() {
  const schema = await inspectHeroSchema();
  const allMovies = await getAllCatalogMovies(schema);
  const overrides = await getManualOverrides(schema);

  const todayStr = new Date().toISOString().split('T')[0];

  // Eligible Latest Releases (for Slots 1-3)
  // - Must have a known release date
  // - release_date <= todayStr
  // - Primary sort: release_date DESC
  // - Tiebreaker: rating DESC
  const eligibleLatest = allMovies
    .filter(m => m.release_date && m.release_date <= todayStr)
    .sort((a, b) => {
      if (a.release_date !== b.release_date) {
        return b.release_date.localeCompare(a.release_date);
      }
      return (b.rating || 0) - (a.rating || 0);
    });

  // Eligible Coming Soon (for Slot 4)
  // - Must have a genuine future release date
  // - release_date > todayStr
  // - Zero showtimes (not yet released / not actively screening)
  // - Primary sort: release_date ASC (earliest upcoming first)
  // - Tiebreaker: rating DESC
  const eligibleComingSoon = allMovies
    .filter(m => m.release_date && m.release_date > todayStr && (!m.scheduled_showtimes_count || m.scheduled_showtimes_count === 0))
    .sort((a, b) => {
      if (a.release_date !== b.release_date) {
        return a.release_date.localeCompare(b.release_date);
      }
      return (b.rating || 0) - (a.rating || 0);
    });

  const slots = [];
  const chosenMovieIds = new Set();

  // Helper to find movie by ID
  const getMovie = id => allMovies.find(m => m.movie_id === id);

  // Slot 1: Latest Release
  let slot1Movie = null;
  let slot1Manual = false;
  if (overrides[1]) {
    const candidate = getMovie(overrides[1]);
    if (candidate && candidate.release_date && candidate.release_date <= todayStr) {
      slot1Movie = candidate;
      slot1Manual = true;
      chosenMovieIds.add(candidate.movie_id);
    }
  }
  if (!slot1Movie) {
    const auto1 = eligibleLatest.find(m => !chosenMovieIds.has(m.movie_id));
    if (auto1) {
      slot1Movie = auto1;
      chosenMovieIds.add(auto1.movie_id);
    }
  }
  if (slot1Movie) {
    slots.push({
      slot_id: 1,
      slot_type: 'latest',
      slot_label: 'Slot 1: Latest Release',
      is_manual: slot1Manual,
      movie: slot1Movie
    });
  }

  // Slot 2: Latest Release
  let slot2Movie = null;
  let slot2Manual = false;
  if (overrides[2]) {
    const candidate = getMovie(overrides[2]);
    if (candidate && candidate.release_date && candidate.release_date <= todayStr && !chosenMovieIds.has(candidate.movie_id)) {
      slot2Movie = candidate;
      slot2Manual = true;
      chosenMovieIds.add(candidate.movie_id);
    }
  }
  if (!slot2Movie) {
    const auto2 = eligibleLatest.find(m => !chosenMovieIds.has(m.movie_id));
    if (auto2) {
      slot2Movie = auto2;
      chosenMovieIds.add(auto2.movie_id);
    }
  }
  if (slot2Movie) {
    slots.push({
      slot_id: 2,
      slot_type: 'latest',
      slot_label: 'Slot 2: Latest Release',
      is_manual: slot2Manual,
      movie: slot2Movie
    });
  }

  // Slot 3: Latest Release
  let slot3Movie = null;
  let slot3Manual = false;
  if (overrides[3]) {
    const candidate = getMovie(overrides[3]);
    if (candidate && candidate.release_date && candidate.release_date <= todayStr && !chosenMovieIds.has(candidate.movie_id)) {
      slot3Movie = candidate;
      slot3Manual = true;
      chosenMovieIds.add(candidate.movie_id);
    }
  }
  if (!slot3Movie) {
    const auto3 = eligibleLatest.find(m => !chosenMovieIds.has(m.movie_id));
    if (auto3) {
      slot3Movie = auto3;
      chosenMovieIds.add(auto3.movie_id);
    }
  }
  if (slot3Movie) {
    slots.push({
      slot_id: 3,
      slot_type: 'latest',
      slot_label: 'Slot 3: Latest Release',
      is_manual: slot3Manual,
      movie: slot3Movie
    });
  }

  // Slot 4: Coming Soon
  let slot4Movie = null;
  let slot4Manual = false;
  if (overrides[4]) {
    const candidate = getMovie(overrides[4]);
    if (
      candidate && 
      candidate.release_date && 
      candidate.release_date > todayStr && 
      !chosenMovieIds.has(candidate.movie_id)
    ) {
      slot4Movie = candidate;
      slot4Manual = true;
      chosenMovieIds.add(candidate.movie_id);
    }
  }
  if (!slot4Movie) {
    const auto4 = eligibleComingSoon.find(m => !chosenMovieIds.has(m.movie_id));
    if (auto4) {
      slot4Movie = auto4;
      chosenMovieIds.add(auto4.movie_id);
    }
  }
  if (slot4Movie) {
    slots.push({
      slot_id: 4,
      slot_type: 'coming_soon',
      slot_label: 'Slot 4: Coming Soon Spotlight',
      is_manual: slot4Manual,
      movie: slot4Movie
    });
  }

  return {
    slots,
    eligibleLatest,
    eligibleComingSoon,
    allMovies
  };
}

/**
 * Public: Get computed hero trailer slots for customer homepage
 */
async function getHeroSlots(req, res, next) {
  try {
    const { slots } = await computeHeroSlots();
    res.json({
      success: true,
      count: slots.length,
      data: slots,
      slots: slots
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Get hero slots with full diagnostic metadata and eligible movie pools
 */
async function getHeroSlotsAdmin(req, res, next) {
  try {
    const { slots, eligibleLatest, eligibleComingSoon, allMovies } = await computeHeroSlots();
    res.json({
      success: true,
      slots,
      eligibleLatestCount: eligibleLatest.length,
      eligibleComingSoonCount: eligibleComingSoon.length,
      allMovies: allMovies.map(m => ({
        movie_id: m.movie_id,
        title: m.title,
        genre: m.genre,
        release_date: m.release_date,
        release_status: m.release_status,
        rating: m.rating,
        trailer_url: m.trailer_url,
        has_trailer: m.has_trailer,
        is_upcoming: Boolean(m.release_date && m.release_date > new Date().toISOString().split('T')[0]),
        is_latest_eligible: Boolean(m.release_date && m.release_date <= new Date().toISOString().split('T')[0])
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update a hero slot manual override
 */
async function updateHeroSlotOverride(req, res, next) {
  try {
    const { slot_id, override_movie_id } = req.body;
    const slotId = parseInt(slot_id, 10);

    if (![1, 2, 3, 4].includes(slotId)) {
      return res.status(400).json({ success: false, message: 'Invalid slot_id. Must be 1, 2, 3, or 4.' });
    }

    const schema = await inspectHeroSchema();
    const allMovies = await getAllCatalogMovies(schema);
    const overrides = await getManualOverrides(schema);
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if resetting slot to automatic
    if (override_movie_id === null || override_movie_id === '' || override_movie_id === undefined) {
      if (schema.hasSlotTable) {
        await query(
          'UPDATE HERO_TRAILER_SLOT SET override_movie_id = NULL, is_manual = FALSE WHERE slot_id = ?',
          [slotId]
        );
      }
      const fallback = loadFallbackSettings();
      fallback.manual_overrides[slotId] = null;
      saveFallbackSettings(fallback);

      const updated = await computeHeroSlots();
      return res.json({
        success: true,
        message: `Slot ${slotId} reset to automatic selection.`,
        slots: updated.slots
      });
    }

    const movieId = parseInt(override_movie_id, 10);
    const targetMovie = allMovies.find(m => m.movie_id === movieId);
    if (!targetMovie) {
      return res.status(404).json({ success: false, message: `Movie ID ${movieId} not found in database.` });
    }

    // Uniqueness validation: cannot assign a movie already used in another slot
    for (let s = 1; s <= 4; s++) {
      if (s !== slotId && overrides[s] === movieId) {
        return res.status(400).json({
          success: false,
          message: `"${targetMovie.title}" is already manually assigned to Slot ${s}. Each hero slot must feature a unique movie.`
        });
      }
    }

    // Slot 4 validation: must be a genuine future release
    if (slotId === 4) {
      if (!targetMovie.release_date || targetMovie.release_date <= todayStr) {
        return res.status(400).json({
          success: false,
          message: `Slot 4 is reserved for Coming Soon titles. "${targetMovie.title}" has release date ${targetMovie.release_date || 'Unknown'}, which is not in the future.`
        });
      }
    } else {
      // Slots 1-3 validation: must have known release date
      if (!targetMovie.release_date) {
        return res.status(400).json({
          success: false,
          message: `"${targetMovie.title}" has an unknown release date. Excluded from Latest Release ranking.`
        });
      }
    }

    // Persist to DB table if available
    if (schema.hasSlotTable) {
      await query(`
        INSERT INTO HERO_TRAILER_SLOT (slot_id, slot_type, slot_label, override_movie_id, is_manual)
        VALUES (?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE override_movie_id = VALUES(override_movie_id), is_manual = TRUE
      `, [slotId, slotId === 4 ? 'coming_soon' : 'latest', `Slot ${slotId}`, movieId]);
    }

    // Always update fallback settings store for redundancy
    const fallback = loadFallbackSettings();
    fallback.manual_overrides[slotId] = movieId;
    saveFallbackSettings(fallback);

    const updated = await computeHeroSlots();
    res.json({
      success: true,
      message: `Slot ${slotId} updated to feature "${targetMovie.title}".`,
      slots: updated.slots
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Reset all hero slots to automatic mode
 */
async function resetHeroSlotsToAutomatic(req, res, next) {
  try {
    const schema = await inspectHeroSchema();

    if (schema.hasSlotTable) {
      await query('UPDATE HERO_TRAILER_SLOT SET override_movie_id = NULL, is_manual = FALSE');
    }

    const fallback = loadFallbackSettings();
    fallback.manual_overrides = { 1: null, 2: null, 3: null, 4: null };
    saveFallbackSettings(fallback);

    const updated = await computeHeroSlots();
    res.json({
      success: true,
      message: 'All hero slots reset to automatic selection mode.',
      slots: updated.slots
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHeroSlots,
  getHeroSlotsAdmin,
  updateHeroSlotOverride,
  resetHeroSlotsToAutomatic,
  inspectHeroSchema,
  loadFallbackSettings,
  saveFallbackSettings
};

