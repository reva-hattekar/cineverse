const { query } = require('../config/db');

/**
 * Public: Get concessions inventory
 */
async function getAllSnacks(req, res, next) {
  try {
    const snacks = await query('SELECT * FROM SNACK ORDER BY price ASC');
    res.json({ success: true, count: snacks.length, data: snacks });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllSnacks
};

