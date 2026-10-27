# CINEVERSE — Live Demonstration Script
**5–7 Minute Examiner Presentation & Walkthrough Plan**  
**Course:** Relational Database Management Systems Laboratory  
**Institution:** Manipal University Jaipur (MUJ)  
**System Services:**  
- Admin Frontend: `http://localhost:5173`
- Customer Frontend: `http://localhost:5174`
- Backend API: `http://localhost:5000`
- Database: MySQL 8.0 `MovieTheaterDB`

---

## Pre-Demonstration Setup Checklist
Before the examiner calls your name:
1. Ensure the MySQL service is running on port 3306.
2. Verify all three development servers are running:
   - Backend: `cd backend && node src/server.js` (Listening on 5000)
   - Admin: `cd frontend-admin && npm run dev` (Listening on 5173)
   - Customer: `cd frontend-customer && npm run dev` (Listening on 5174)
3. Open two browser windows side by side:
   - Left Window: Customer Portal (`http://localhost:5174`)
   - Right Window: Admin Portal (`http://localhost:5173`)
4. Open a terminal or MySQL Workbench connected to `MovieTheaterDB`.

---

## Step-by-Step 5–7 Minute Walkthrough

### Phase 1: High-Level Architecture & Database Blueprint (Minute 0:00 – 1:00)
* **What to Show:**
  1. Open the project report or ER diagram file `report_assets/cineverse_er_diagram.svg`.
  2. Point to the separation between Venue Infrastructure (`THEATER`, `SCREEN`, `SEAT`), Temporal Scheduling (`SHOWTIME`), and Commercial Ledger (`BOOKING`, `BOOKED_SEAT`, `PAYMENT`).
* **What to Say to Examiner:**
  *"Good morning, Examiners. Today I am presenting CINEVERSE, a multi-city multiplex movie theater booking and management system. Our database, `MovieTheaterDB`, is designed strictly in Third Normal Form across 15 relational tables with 22 check constraints. The system manages 8 cinema complexes across 5 Indian cities, 32 screens, 4,544 physical seats, and over 1,000 scheduled screenings."*
* **Database Concept Demonstrated:**
  Three-Tier Client-Server Architecture, Conceptual ER Modeling, and 3NF Normalization.

---

### Phase 2: Live Database Introspection (Minute 1:00 – 2:00)
* **What to Show:**
  Switch to MySQL terminal or Workbench and execute a safe read query showing table counts.
* **SQL Query to Execute:**
  ```sql
  SELECT 
      table_name, table_rows 
  FROM information_schema.tables 
  WHERE table_schema = 'MovieTheaterDB';
  ```
* **What to Say to Examiner:**
  *"Before demonstrating the web applications, here is the live MySQL database running under InnoDB. Notice the exact row distribution: 8 theaters, 32 screens, 4,544 individual seats, and 13 movies. Every table enforces primary keys, foreign keys, and explicit ON DELETE CASCADE or RESTRICT rules."*
* **Database Concept Demonstrated:**
  Physical storage engine compliance, metadata querying via `information_schema`, and entity integrity.

---

### Phase 3: Theatrical Scheduling & Collision Engine (Minute 2:00 – 3:30)
* **What to Show:**
  1. Navigate to the Admin Portal at `http://localhost:5173`.
  2. Log in using `admin@cinema.com` / `Admin@123`.
  3. Navigate to **Showtimes** (`/showtimes`).
  4. Click **Schedule Showtime**.
  5. Select **CINEVERSE Nexus IMAX, Bengaluru**, select **Auditorium 1 (IMAX)**, select date `2026-10-27`.
  6. Attempt to schedule a screening at an overlapping time (e.g., 18:30 when a screening is already scheduled from 18:00 to 21:00).
  7. Observe the red conflict alert banner: *"Scheduling Conflict: Auditorium 1 already has..."*
* **What to Say to Examiner:**
  *"In our admin portal, showtime scheduling is protected by a mathematical collision engine. In `showtimeController.js`, before inserting into `SHOWTIME`, the system checks for overlapping screenings using the interval condition: $A_{start} < B_{end} \land A_{end} > B_{start}$, while adding a mandatory 15-minute turnaround buffer. The database prevents duplicate bookings of the same auditorium space."*
* **Database Concept Demonstrated:**
  Domain constraints, temporal range integrity, and application-level pre-flight validation.

---

### Phase 4: Dynamic Seat Map & Atomic Booking Transaction (Minute 3:30 – 5:30)
* **What to Show:**
  1. Switch to the Customer Portal at `http://localhost:5174`.
  2. Point out the dynamic hero section and click **Now Showing** &rarr; select a movie (e.g., *Oppenheimer* or *The Dark Knight*).
  3. Click **Book Seats** to enter `/booking-flow`.
  4. Choose **Bengaluru** &rarr; select an evening showtime.
  5. The interactive seat map loads: Show that available seats are selectable, tier colors are visible (Standard, Premium, VIP), and prices adjust dynamically.
  6. Select 2 seats (e.g., Row G, Seats 7 and 8).
  7. Add a snack item (e.g., Caramel Popcorn).
  8. Click **Confirm Booking & Pay**.
  9. The confirmation screen appears with the Booking ID and invoice summary.
* **What to Say to Examiner:**
  *"Notice what just occurred under the hood: The customer frontend fetched the live seat availability by relationally subtracting booked seats from total physical seats. When I clicked Confirm, the backend initiated a multi-statement ACID transaction. It verified seat ownership, inserted into `BOOKING`, looped over the two seats inserting into the junction table `BOOKED_SEAT`, generated a `PAYMENT` receipt, and decremented the `SNACK` stock quantity with row-level locking. If any step had failed, the entire transaction would have rolled back."*
* **Database Concept Demonstrated:**
  ACID Transaction boundaries (`START TRANSACTION`, `COMMIT`, `ROLLBACK`), Associative Junction Tables ($M:N$ mapping), and Server-Side Dynamic Price Calculation.

---

### Phase 5: Verification of the Committed Transaction in MySQL (Minute 5:30 – 6:30)
* **What to Show:**
  Switch back to the MySQL terminal and run a query showing the new booking that was just created.
* **SQL Query to Execute:**
  ```sql
  SELECT 
      b.booking_id,
      b.total_amount,
      b.booking_status,
      c.customer_name,
      GROUP_CONCAT(st.seat_number SEPARATOR ', ') AS seats,
      p.payment_method,
      p.payment_status
  FROM BOOKING b
  JOIN CUSTOMER c ON b.customer_id = c.customer_id
  JOIN PAYMENT p ON b.booking_id = p.booking_id
  JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
  JOIN SEAT st ON bs.seat_id = st.seat_id
  GROUP BY b.booking_id, b.total_amount, b.booking_status, c.customer_name, p.payment_method, p.payment_status
  ORDER BY b.booking_id DESC
  LIMIT 1;
  ```
* **What to Say to Examiner:**
  *"Here is our newly created booking record directly in MySQL. The booking total reflects the exact server-side calculated seat tier pricing plus concessions. The payment record is tied via a 1:1 foreign key, and the junction table `BOOKED_SEAT` holds our specific seat selections."*
* **Database Concept Demonstrated:**
  Immediate consistency, relational join queries, and financial reconciliation.

---

### Phase 6: Conclusion & Questions (Minute 6:30 – 7:00)
* **What to Say to Examiner:**
  *"To conclude, CINEVERSE demonstrates that rigorous relational database design—separating infrastructure, schedules, and reservations—eliminates data anomalies and guarantees transaction atomicity. The complete documentation and test suites are compiled in our official project report. I am now ready for your questions."*

---

## Troubleshooting & Fallback Protocol

| Scenario / Glitch | Immediate Cause | Fallback Action to Take During Demo |
| :--- | :--- | :--- |
| **Customer page shows black / blank screen** | Stale Vite HMR cache in browser tab | Press **`Ctrl + Shift + R`** or **`Ctrl + F5`** immediately to hard reload the fresh bundle. |
| **Admin login fails with "Invalid credentials"** | Incorrect email or password entered | Use verified demo credentials: `email: admin@cinema.com`, `password: Admin@123`. |
| **MySQL returns "Access Denied for user root"** | Password mismatch in `.env` | Check `backend/.env`. If local MySQL uses a password, ensure `DB_PASSWORD` matches. |
| **Port 5000 is already in use** | Stale background Node process | In PowerShell run: `Get-Process node \| Stop-Process -Force` and restart `node src/server.js`. |
| **Examiner asks to show a table that has 0 rows** | Non-seeded edge case | Explain that all 15 tables are populated, and run `SELECT COUNT(*) FROM <table>` to prove data exists. |

