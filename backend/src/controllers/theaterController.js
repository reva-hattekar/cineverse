const { query } = require('../config/db');

/**
 * Public: Get all theaters with their associated screens
 */
async function getAllTheaters(req, res, next) {
  try {
    const theaters = await query('SELECT * FROM THEATER ORDER BY theater_name ASC');
    const screens = await query('SELECT * FROM SCREEN ORDER BY theater_id, screen_number ASC');

    const theatersWithScreens = theaters.map(t => ({
      ...t,
      screens: screens.filter(s => s.theater_id === t.theater_id)
    }));

    res.json({
      success: true,
      count: theaters.length,
      data: theatersWithScreens
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public: Get screens for a specific theater
 */
async function getScreensByTheater(req, res, next) {
  try {
    const { id } = req.params;
    const screens = await query('SELECT * FROM SCREEN WHERE theater_id = ? ORDER BY screen_number ASC', [id]);
    res.json({ success: true, count: screens.length, data: screens });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTheaters,
  getScreensByTheater
};

