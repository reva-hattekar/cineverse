/**
 * CINEVERSE - Showtime & Theater Population Script
 * 
 * Safely and idempotently:
 * 1. Backs up current THEATER, SCREEN, SEAT, and SHOWTIME tables.
 * 2. Expands theaters across supported cities: Bengaluru, Jaipur, Mumbai, Delhi NCR.
 * 3. Creates 2 screens per new theater (capacity 20).
 * 4. Generates 20 seats per screen (6 VIP, 8 Premium, 6 Standard).
 * 5. Generates non-overlapping showtimes for 27 Oct 2026 and 28 Oct 2026 for catalog movies (IDs 1-10).
 *    Strictly excludes unreleased Movie 13 (Spider-Man: Brand New Day).
 */

require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const path = require('path');
const { query } = require('./src/config/db');

const TARGET_DATES = ['2026-10-27', '2026-10-28'];

const NEW_THEATERS = [
  // Bengaluru (expanding existing 2 to 4)
  { name: 'CINEVERSE Orion Mall IMAX', city: 'Bengaluru', address: 'Dr Rajkumar Road, Rajajinagar, Bengaluru' },
  { name: 'CINEVERSE Phoenix Marketcity Laser', city: 'Bengaluru', address: 'Whitefield Main Road, Mahadevapura, Bengaluru' },

  // Jaipur (3 prominent venues)
  { name: 'CINEVERSE Raj Mandir Luxe', city: 'Jaipur', address: 'Bhagwan Das Road, C-Scheme, Jaipur' },
  { name: 'CINEVERSE World Trade Park Laser', city: 'Jaipur', address: 'JLN Marg, Malviya Nagar, Jaipur' },
  { name: 'CINEVERSE Crystal Palm IMAX', city: 'Jaipur', address: 'Sardar Patel Marg, C-Scheme, Jaipur' },

  // Mumbai (3 prominent venues)
  { name: 'CINEVERSE Palladium Dolby Cinema', city: 'Mumbai', address: 'High Street Phoenix, Lower Parel, Mumbai' },
  { name: 'CINEVERSE Bandra Royale Luxe', city: 'Mumbai', address: 'Hill Road, Bandra West, Mumbai' },
  { name: 'CINEVERSE Inorbit Malad IMAX', city: 'Mumbai', address: 'Link Road, Malad West, Mumbai' },

  // Delhi NCR (3 prominent venues)
  { name: 'CINEVERSE Select Citywalk IMAX', city: 'Delhi NCR', address: 'Saket District Centre, New Delhi' },
  { name: 'CINEVERSE DLF CyberHub Laser', city: 'Delhi NCR', address: 'DLF Phase 2, Gurugram, Delhi NCR' },
  { name: 'CINEVERSE Ambience Mall Luxe', city: 'Delhi NCR', address: 'NH-8, Ambience Island, Gurugram, Delhi NCR' }
];

const SHOW_SCHEDULE_SLOTS = [
  { start_time: '10:00:00', end_time: '13:00:00', standardPrice: 280.00, imaxPrice: 350.00 },
  { start_time: '14:00:00', end_time: '17:00:00', standardPrice: 320.00, imaxPrice: 400.00 },
  { start_time: '18:00:00', end_time: '21:00:00', standardPrice: 380.00, imaxPrice: 480.00 },
  { start_time: '21:45:00', end_time: '00:45:00', standardPrice: 300.00, imaxPrice: 380.00 }
];

async function run() {
  console.log('====================================================');
  console.log('CINEVERSE - Showtime & Theater Population Starting');
  console.log('====================================================');

  // STEP 1: Backup Existing Tables
  console.log('\n[1/5] Backing up existing tables...');
  const existingTheaters = await query('SELECT * FROM THEATER');
  const existingScreens = await query('SELECT * FROM SCREEN');
  const existingSeats = await query('SELECT * FROM SEAT');
  const existingShowtimes = await query('SELECT * FROM SHOWTIME');

  const backupData = {
    timestamp: new Date().toISOString(),
    theaters: existingTheaters,
    screens: existingScreens,
    seats: existingSeats,
    showtimes: existingShowtimes
  };

  const backupPath = path.join(__dirname, '../database/backup_before_showtimes_20261027.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`Backup saved to ${backupPath}`);
  console.log(`Existing state: ${existingTheaters.length} theaters, ${existingScreens.length} screens, ${existingSeats.length} seats, ${existingShowtimes.length} showtimes.`);

  // STEP 2: Expand Theaters Idempotently
  console.log('\n[2/5] Expanding theaters across supported cities...');
  let theatersAdded = 0;
  for (const t of NEW_THEATERS) {
    const existing = await query('SELECT theater_id FROM THEATER WHERE theater_name = ?', [t.name]);
    if (existing.length === 0) {
      await query(
        'INSERT INTO THEATER (theater_name, city, address) VALUES (?, ?, ?)',
        [t.name, t.city, t.address]
      );
      theatersAdded++;
      console.log(`  + Added theater: ${t.name} (${t.city})`);
    } else {
      console.log(`  = Already exists: ${t.name} (${t.city}) [ID: ${existing[0].theater_id}]`);
    }
  }
  console.log(`Theaters added: ${theatersAdded}`);

  // Fetch all current theaters
  const allTheaters = await query('SELECT * FROM THEATER ORDER BY theater_id ASC');
  console.log(`Total active theaters in DB: ${allTheaters.length}`);

  // STEP 3: Expand Screens (2 screens per new theater)
  console.log('\n[3/5] Ensuring 2 screens per theater with capacity 20...');
  let screensAdded = 0;
  for (const t of allTheaters) {
    // Check screen 1
    const s1 = await query('SELECT screen_id FROM SCREEN WHERE theater_id = ? AND screen_number = 1', [t.theater_id]);
    if (s1.length === 0) {
      await query(
        'INSERT INTO SCREEN (screen_number, screen_name, screen_type, capacity, theater_id) VALUES (1, ?, ?, 20, ?)',
        [`${t.theater_name} - Screen 1`, 'IMAX Laser', t.theater_id]
      );
      screensAdded++;
    }

    // Check screen 2
    const s2 = await query('SELECT screen_id FROM SCREEN WHERE theater_id = ? AND screen_number = 2', [t.theater_id]);
    if (s2.length === 0) {
      await query(
        'INSERT INTO SCREEN (screen_number, screen_name, screen_type, capacity, theater_id) VALUES (2, ?, ?, 20, ?)',
        [`${t.theater_name} - Screen 2`, 'Dolby Atmos', t.theater_id]
      );
      screensAdded++;
    }
  }
  console.log(`Screens added: ${screensAdded}`);

  // Fetch all current screens
  const allScreens = await query('SELECT * FROM SCREEN ORDER BY screen_id ASC');
  console.log(`Total active screens in DB: ${allScreens.length}`);

  // STEP 4: Populate Seats (20 seats per screen: 6 VIP, 8 Premium, 6 Standard)
  console.log('\n[4/5] Ensuring 20 seats per screen (6 VIP, 8 Premium, 6 Standard)...');
  let seatsAdded = 0;
  for (const screen of allScreens) {
    const existingSeatsForScreen = await query('SELECT seat_id, seat_number FROM SEAT WHERE screen_id = ?', [screen.screen_id]);
    if (existingSeatsForScreen.length === 0) {
      const seatsToInsert = [
        // Row A: VIP (6 seats)
        ['A1', 'VIP'], ['A2', 'VIP'], ['A3', 'VIP'], ['A4', 'VIP'], ['A5', 'VIP'], ['A6', 'VIP'],
        // Row B: Premium (8 seats)
        ['B1', 'Premium'], ['B2', 'Premium'], ['B3', 'Premium'], ['B4', 'Premium'],
        ['B5', 'Premium'], ['B6', 'Premium'], ['B7', 'Premium'], ['B8', 'Premium'],
        // Row C: Standard (6 seats)
        ['C1', 'Standard'], ['C2', 'Standard'], ['C3', 'Standard'], ['C4', 'Standard'],
        ['C5', 'Standard'], ['C6', 'Standard']
      ];

      for (const [sNum, sType] of seatsToInsert) {
        await query(
          'INSERT INTO SEAT (seat_number, seat_type, screen_id) VALUES (?, ?, ?)',
          [sNum, sType, screen.screen_id]
        );
        seatsAdded++;
      }
    }
  }
  console.log(`Seats added: ${seatsAdded}`);

  // STEP 5: Populate Showtimes for 27 Oct 2026 and 28 Oct 2026
  console.log('\n[5/5] Generating non-overlapping showtimes for 27 Oct and 28 Oct 2026...');

  // Catalog movies eligible for showtimes (IDs 1-10; strictly excluding ID 13 Spider-Man: Brand New Day)
  const eligibleMovies = await query(
    'SELECT movie_id, title FROM MOVIE WHERE movie_id != 13 ORDER BY movie_id ASC'
  );
  console.log(`Eligible released movies for scheduling: ${eligibleMovies.length} movies (IDs ${eligibleMovies.map(m => m.movie_id).join(', ')})`);

  let showtimesAdded = 0;
  let showtimesExisted = 0;

  for (const date of TARGET_DATES) {
    for (let screenIdx = 0; screenIdx < allScreens.length; screenIdx++) {
      const screen = allScreens[screenIdx];
      const isImax = (screen.screen_type || '').includes('IMAX');

      for (let slotIdx = 0; slotIdx < SHOW_SCHEDULE_SLOTS.length; slotIdx++) {
        const slot = SHOW_SCHEDULE_SLOTS[slotIdx];

        // Check if a showtime already exists on this screen at this date and start_time
        const existing = await query(
          'SELECT show_id FROM SHOWTIME WHERE screen_id = ? AND show_date = ? AND start_time = ?',
          [screen.screen_id, date, slot.start_time]
        );

        if (existing.length === 0) {
          // Select movie in rotating pattern so all movies are showcased evenly
          const movieOffset = (screenIdx * 2 + slotIdx + (date === '2026-10-28' ? 3 : 0)) % eligibleMovies.length;
          const selectedMovie = eligibleMovies[movieOffset];
          const price = isImax ? slot.imaxPrice : slot.standardPrice;

          await query(
            'INSERT INTO SHOWTIME (show_date, start_time, end_time, base_price, movie_id, screen_id) VALUES (?, ?, ?, ?, ?, ?)',
            [date, slot.start_time, slot.end_time, price, selectedMovie.movie_id, screen.screen_id]
          );
          showtimesAdded++;
        } else {
          showtimesExisted++;
        }
      }
    }
  }

  console.log(`Showtimes added: ${showtimesAdded}`);
  console.log(`Showtimes already existed: ${showtimesExisted}`);

  // STEP 6: Verification Summary
  console.log('\n====================================================');
  console.log('POPULATION VERIFICATION SUMMARY');
  console.log('====================================================');

  const theaterSummary = await query('SELECT city, COUNT(*) as theaters FROM THEATER GROUP BY city ORDER BY city');
  console.log('Theaters by City:');
  theaterSummary.forEach(t => console.log(`  - ${t.city}: ${t.theaters} theaters`));

  const totalScreens = await query('SELECT COUNT(*) as count FROM SCREEN');
  console.log(`Total Screens: ${totalScreens[0].count}`);

  const totalSeats = await query('SELECT COUNT(*) as count FROM SEAT');
  console.log(`Total Seats: ${totalSeats[0].count}`);

  const showtimesByDate = await query(
    'SELECT show_date, COUNT(*) as count FROM SHOWTIME WHERE show_date IN (?, ?) GROUP BY show_date ORDER BY show_date',
    TARGET_DATES
  );
  console.log('Showtimes for Target Dates:');
  showtimesByDate.forEach(s => {
    const dStr = typeof s.show_date === 'string' ? s.show_date : new Date(s.show_date).toISOString().split('T')[0];
    console.log(`  - ${dStr}: ${s.count} screenings`);
  });

  const spidermanShowtimes = await query(
    'SELECT COUNT(*) as count FROM SHOWTIME WHERE movie_id = 13'
  );
  console.log(`Spider-Man: Brand New Day (Movie 13) Showtimes: ${spidermanShowtimes[0].count} (must be 0)`);

  console.log('====================================================\n');
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error during population:', err);
    process.exit(1);
  });

