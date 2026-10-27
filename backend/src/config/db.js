const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'MovieTheaterDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true,
  timezone: '+05:30'
};

// Create the connection pool
const pool = mysql.createPool(poolConfig);

/**
 * Executes a parameterized query using the pool
 */
async function query(sql, params = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Gets a dedicated connection from the pool for transactions
 */
async function getConnection() {
  return await pool.getConnection();
}

/**
 * Tests the database connection and returns diagnostic status
 */
async function checkDbConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 AS ping, VERSION() AS version, DATABASE() as db');
    connection.release();
    return {
      connected: true,
      version: rows[0].version,
      database: rows[0].db,
      message: 'Successfully connected to MySQL database.'
    };
  } catch (err) {
    return {
      connected: false,
      error: err.code || err.message,
      message: `Failed to connect to MySQL: ${err.message}. Please configure DB_PASSWORD in backend/.env.`
    };
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  checkDbConnection
};

