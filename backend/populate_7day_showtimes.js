/**
 * CINEVERSE - 7-Day Showtime Population Script
 * 
 * Target Dates: 7 calendar days starting dynamically from local today in Asia/Kolkata
 * Eligible Movies: Only released movies (IDs 1, 2, 3, 4, 5, 6, 7, 8, 10).
 * Excluded: Coming-soon titles (Movie ID 9 Avengers: Doomsday, Movie ID 13 Spider-Man: Brand New Day).
 * 
 * Idempotent: Checks for existing screenings on the screen/date/time before inserting.
 * Preserves all existing valid showtimes, bookings, payments, and seats.
 */

require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const path = require('path');
const { query } = require('./src/config/db');

function getNext7CalendarDays() {
  const dates = [];
  const now = new Date();
  // Ensure local date in Asia/Kolkata
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
  const localTodayStr = formatter.format(now);
  const [y, m, d] = localTodayStr.split('-').map(Number);
  const baseDate = new Date(y, m - 1, d);

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + i);
    const yr = nextDate.getFullYear();
    const mo = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dy = String(nextDate.getDate()).padStart(2, '0');
    dates.push(`${yr}-${mo}-${dy}`);
  }
  return dates;
}

const SHOW_SCHEDULE_SLOTS = [
  { start_time: '10:00:00', end_time: '13:00:00', standardPrice: 280.00, imaxPrice: 350.00 },
  { start_time: '14:00:00', end_time: '17:00:00', standardPrice: 320.00, imaxPrice: 400.00 },
  { start_time: '18:00:00', end_time: '21:00:00', standardPrice: 380.00, imaxPrice: 480.00 },
  { start_time: '21:45:00', end_time: '00:45:00', standardPrice: 300.00, imaxPrice: 380.00 }
];

async function run() {
  console.log('====================================================');
  console.log('CINEVERSE - 7-Day Showtime Population Starting');
  console.log('====================================================');

  const targetDates = getNext7CalendarDays();
  console.log('Target 7 Calendar Days:', targetDates.join(', '));

  // Inspect database entities
  const theaters = await query('SELECT theater_id, theater_name, city FROM THEATER ORDER BY theater_id ASC');
  const screens = await query('SELECT screen_id, theater_id, screen_number, screen_type, capacity FROM SCREEN ORDER BY screen_id ASC');
  const existingShowtimes = await query('SELECT COUNT(*) as cnt FROM SHOWTIME');
  
  // Eligible movies check: released movies only (release_date <= local today or known catalog releases)
  const allMovies = await query('SELECT movie_id, title, genre, duration, rating FROM MOVIE ORDER BY movie_id ASC');
  const heroSettingsFile = path.join(__dirname, '../data/hero_settings.json');
  let fallbackDates = {};
  if (fs.existsSync(heroSettingsFile)) {
    try {
      const hData = JSON.parse(fs.readFileSync(heroSettingsFile, 'utf8'));
      fallbackDates = hData.movie_release_dates || {};
    } catch (e) {}
  }

  const localToday = targetDates[0];
  const eligibleMovies = allMovies.filter(m => {
    // Specifically exclude Coming Soon titles: ID 9 (Avengers: Doomsday) and ID 13 (Spider-Man: Brand New Day)
    if (m.movie_id === 9 || m.movie_id === 13) return false;
    const rDate = fallbackDates[m.movie_id];
    if (rDate && rDate > localToday) return false;
    return true;
  });

  console.log('\n--- PRE-INSERTION AUDIT REPORT ---');
  console.log(`Eligible Released Movies Found : ${eligibleMovies.length} (${eligibleMovies.map(m => `#${m.movie_id} ${m.title}`).join(', ')})`);
  console.log(`Theatres Found                 : ${theaters.length} across ${[...new Set(theaters.map(t => t.city))].join(', ')}`);
  console.log(`Screens Found                  : ${screens.length}`);
  console.log(`Existing Showtimes in DB       : ${existingShowtimes[0].cnt}`);
  console.log('----------------------------------\n');

  let showtimesInserted = 0;
  let showtimesSkipped = 0;
  const sqlInserts = [];

  for (let dayIdx = 0; dayIdx < targetDates.length; dayIdx++) {
    const date = targetDates[dayIdx];

    for (let screenIdx = 0; screenIdx < screens.length; screenIdx++) {
      const screen = screens[screenIdx];
      const isImax = (screen.screen_type || '').includes('IMAX');

      for (let slotIdx = 0; slotIdx < SHOW_SCHEDULE_SLOTS.length; slotIdx++) {
        const slot = SHOW_SCHEDULE_SLOTS[slotIdx];

        // Check if screening already exists on this screen at this date and start_time
        const existing = await query(
          'SELECT show_id FROM SHOWTIME WHERE screen_id = ? AND show_date = ? AND start_time = ?',
          [screen.screen_id, date, slot.start_time]
        );

        if (existing.length === 0) {
          // Evenly rotate movies across screens and days
          const movieOffset = (screenIdx * 2 + slotIdx + dayIdx * 3) % eligibleMovies.length;
          const selectedMovie = eligibleMovies[movieOffset];
          const price = isImax ? slot.imaxPrice : slot.standardPrice;

          await query(
            'INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id) VALUES (?, ?, ?, ?, ?, ?)',
            [date, slot.start_time, slot.end_time, price, selectedMovie.movie_id, screen.screen_id]
          );

          sqlInserts.push(`INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id) SELECT '${date}', '${slot.start_time}', '${slot.end_time}', ${price.toFixed(2)}, ${selectedMovie.movie_id}, ${screen.screen_id} WHERE NOT EXISTS (SELECT 1 FROM SHOWTIME WHERE screen_id = ${screen.screen_id} AND show_date = '${date}' AND start_time = '${slot.start_time}');`);
          showtimesInserted++;
        } else {
          showtimesSkipped++;
        }
      }
    }
  }

  console.log(`Showtimes Inserted : ${showtimesInserted}`);
  console.log(`Showtimes Skipped  : ${showtimesSkipped} (already existed)`);

  // Write safe rerunnable SQL script
  const sqlMigrationPath = path.join(__dirname, '../database/13_populate_7day_showtimes.sql');
  const sqlContent = [
    '-- CINEVERSE: 7-Day Showtime Population Migration',
    `-- Generated on ${new Date().toISOString()}`,
    `-- Target Dates: ${targetDates.join(', ')}`,
    '-- Eligible Movies: 1, 2, 3, 4, 5, 6, 7, 8, 10 (Excluded: 9, 13)',
    '',
    ...sqlInserts,
    ''
  ].join('\n');
  fs.writeFileSync(sqlMigrationPath, sqlContent, 'utf8');
  console.log(`Rerunnable SQL migration saved to: ${sqlMigrationPath}`);

  // Post-run verification
  console.log('\n--- POST-INSERTION AUDIT SUMMARY ---');
  const showtimesByDate = await query(`
    SELECT DATE_FORMAT(show_date, '%Y-%m-%d') as s_date, COUNT(*) as count 
    FROM SHOWTIME 
    WHERE show_date BETWEEN ? AND ? 
    GROUP BY s_date 
    ORDER BY s_date
  `, [targetDates[0], targetDates[targetDates.length - 1]]);

  console.log('Screenings count per target date:');
  showtimesByDate.forEach(s => {
    console.log(`  - ${s.s_date}: ${s.count} screenings`);
  });

  const totalNow = await query('SELECT COUNT(*) as cnt FROM SHOWTIME');
  console.log(`Total Showtimes now in DB: ${totalNow[0].cnt}`);

  const forbiddenShowtimes = await query(
    'SELECT COUNT(*) as count FROM SHOWTIME WHERE movie_id IN (9, 13) AND show_date >= ?',
    [targetDates[0]]
  );
  console.log(`Showtimes for Coming Soon movies (IDs 9 and 13) on or after ${targetDates[0]}: ${forbiddenShowtimes[0].count} (must be 0)`);
  console.log('====================================================\n');
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error during population:', err);
    process.exit(1);
  });

