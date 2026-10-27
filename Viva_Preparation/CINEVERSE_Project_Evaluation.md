# CINEVERSE — Comprehensive RDBMS Project Evaluation
**Academic Lab Project Assessment & Defence Audit**  
**Course:** Relational Database Management Systems Laboratory (CSE Department)  
**Institution:** Manipal University Jaipur (MUJ)  
**Evaluated Database:** MySQL 8.0 (`MovieTheaterDB` — InnoDB Engine)  
**Evaluated Architecture:** Multi-Tier Architecture (MySQL &harr; Node.js/Express &harr; React Client Applications)  
**Evaluation Date:** October 2026  

---

## Executive Summary & Marking Matrix

This evaluation assesses the CINEVERSE Movie Theatre Booking and Management System strictly against university-level RDBMS criteria. Every score is based on verified codebase artifacts, live schema introspection, SQL query profiling, and transaction traces. No marks are awarded based on user interface claims or unverified documentation.

### Evaluation Scorecard (18 Core Areas)

| Area # | Evaluated Area | Score (out of 10) | Implementation Status | Key Strength / Primary Risk |
| :---: | :--- | :---: | :---: | :--- |
| **1** | Problem Statement & Domain Relevance | **9.0 / 10** | Verified Complete | Excellent enterprise domain model with real multi-city scaling. |
| **2** | System Architecture & Tier Separation | **8.5 / 10** | Verified Complete | Clean separation of Admin (5173), Customer (5174), and API (5000). |
| **3** | Database Design & Relational Modeling | **9.0 / 10** | Verified Complete | 15 base tables cleanly separating static venue from dynamic schedules. |
| **4** | ER Diagram Correctness & Cardinality | **8.5 / 10** | Verified Complete | All cardinalities, PKs, FKs, and junction tables accurately mapped. |
| **5** | Relational Schema & Data Types | **8.5 / 10** | Verified Complete | Strict typing (DECIMAL, TIME, DATE, TIMESTAMP); no loose VARCHARs. |
| **6** | Primary, Foreign & Unique Key Design | **9.5 / 10** | Verified Complete | Exceptional composite PKs and multi-column UNIQUE constraints. |
| **7** | Relationship Cardinalities (1:1, 1:N, M:N) | **9.0 / 10** | Verified Complete | Perfect junction tables for M:N relationships; explicit 1:1 constraints. |
| **8** | Normalization & Functional Dependencies | **8.5 / 10** | Verified Complete | Strict 3NF across all core tables; zero multi-valued dependencies. |
| **9** | Referential Integrity & Constraints | **9.5 / 10** | Verified Complete | 22 CHECK constraints; explicit ON DELETE CASCADE and RESTRICT rules. |
| **10** | SQL Query Quality & Efficiency | **8.5 / 10** | Verified Complete | Multi-table INNER/LEFT JOINs, aggregate rollups, parameterized statements. |
| **11** | CRUD Operations Implementation | **8.5 / 10** | Verified Complete | Full CRUD on movies, showtimes, venues, bookings, and concessions. |
| **12** | Transaction Management & ACID Properties | **8.0 / 10** | Partial Implementation| Multi-statement ACID transaction in booking; missing lock on seat check. |
| **13** | Backend Database Driver & Integration | **8.5 / 10** | Verified Complete | Connection pooling (`mysql2/promise`), keepalive, prepared statements. |
| **14** | Admin & Customer Frontend Integration | **8.5 / 10** | Verified Complete | Real-time synchronization of bookings, seat maps, and catalog changes. |
| **15** | Booking & Seat Availability Consistency | **7.5 / 10** | Partial Implementation| Dynamic availability calculated from DB; concurrency race condition risk. |
| **16** | Payment & Financial Settlement Handling | **7.0 / 10** | Verified Simulation | Simulated ledger with 1:1 FK; lacks live external payment gateway. |
| **17** | Testing, Validation & Edge Cases | **8.0 / 10** | Verified Complete | 37 integration tests pass 100%; lacks unit tests with mock DB fixtures. |
| **18** | Documentation, Report & Demo Readiness | **9.0 / 10** | Verified Complete | 29-page IEEE/academic PDF report; running dev servers; fast response. |
| **--** | **Overall Evaluated Score** | **8.56 / 10** | **Grade: A (Distinction)** | **Highly Defensible University RDBMS Lab Project** |

---

## Detailed Evaluation by Area

### 1. Problem Statement and Objectives
* **Score:** 9.0 / 10
* **What is Implemented:** CINEVERSE solves the challenge of centralizing multiplex theater management, scheduling conflicting screenings across physical auditoriums, calculating live seat availability without denormalization, and reconciling ticket and snack revenue.
* **Evidence:**
  - `database/01_create_database.sql` to `database/11_add_movie_trailer_and_hero_settings.sql`
  - `backend/src/controllers/showtimeController.js` (Lines 176–260: scheduling conflict engine)
  - `backend/src/controllers/bookingController.js` (Lines 136–350: atomic multi-seat booking)
* **Design Strengths:** Does not treat cinema booking as a toy single-theater model. Accurately maps 8 multiplexes across 5 Indian cities (Bengaluru, Mumbai, Delhi, Hyderabad, Chennai) with 32 auditoriums and 4,544 physical seats.
* **Potential Weaknesses:** Does not incorporate dynamic pricing algorithms based on time-until-showtime or historical demand, though tiered base pricing by seat category (`VIP`, `Premium`, `Standard`) is fully operational.
* **Examiner Challenge:** *"Why build a bespoke system when commercial SaaS platforms like BookMyShow exist?"*
  - **Defense:** Commercial aggregators charge heavy convenience fees and lock theaters out of their raw operational data. CINEVERSE gives theater circuits internal control over auditorium hardware mapping, physical inventory, turnover buffers, and concession margins.
* **Concrete Improvement:** Implement a loyalty point redemption engine during checkout to complete the customer retention loop.

---

### 2. System Architecture
* **Score:** 8.5 / 10
* **What is Implemented:** Three-tier client-server architecture with completely decoupled presentation, application, and persistence layers.
* **Evidence:**
  - Presentation (Admin): `frontend-admin/` running on Vite / React 18 at `http://localhost:5173`
  - Presentation (Customer): `frontend-customer/` running on Vite / React 18 at `http://localhost:5174`
  - Application Layer: `backend/src/server.js` running Node.js v20 / Express 4.19 at `http://localhost:5000`
  - Database Layer: MySQL 8.0 `MovieTheaterDB` on port 3306 managed by InnoDB engine
* **Design Strengths:** Complete separation between the public consumer browsing portal and the administrative back-office control room. The frontends communicate exclusively via JSON over REST; no direct database credentials or queries reside in client code.
* **Potential Weaknesses:** The backend serves as a monolithic REST API. While ideal for a laboratory project, a distributed enterprise deployment would decouple the booking transaction engine from catalog reporting.
* **Examiner Challenge:** *"Why run two separate React frontends on different ports instead of role-based route guards in a single app?"*
  - **Defense:** Strict security boundary separation. The admin bundle includes staff authentication, inventory control, and scheduling collision interfaces that should never be sent over the wire to retail customer browsers.
* **Concrete Improvement:** Add an API Gateway (or Nginx reverse proxy) to expose a unified domain on port 80/443 with path-based routing (`/api`, `/admin`, `/`).

---

### 3. Database Design
* **Score:** 9.0 / 10
* **What is Implemented:** 15 base relational tables organized into three distinct architectural domains:
  1. *Infrastructure Domain:* `THEATER`, `SCREEN`, `SEAT`, `ADMIN_STAFF`
  2. *Theatrical Programming Domain:* `MOVIE`, `SHOWTIME`
  3. *Transactional Commercial Domain:* `CUSTOMER`, `ACCOUNT`, `LOYALTY_ACCOUNT`, `BOOKING`, `BOOKED_SEAT`, `PAYMENT`, `SNACK`, `SNACK_ORDER`, `SNACK_ORDER_ITEM`
* **Evidence:**
  - Live table count verified via `SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`
  - Total physical database rows: 5,699 records across 15 tables.
* **Design Strengths:** Clean separation between static venue assets and dynamic show schedules. A physical seat is modeled once in `SEAT` and never modified or flagged with a text state during booking; availability is determined relationally through `BOOKED_SEAT`.
* **Potential Weaknesses:** Absence of database views (`VIEW`) or stored procedures (`PROCEDURE`), as business logic is currently encapsulated in backend controllers.
* **Examiner Challenge:** *"Why isn't seat availability stored as a boolean column `is_available` directly inside the `SEAT` table?"*
  - **Defense:** Storing `is_available` on `SEAT` violates relational principles. A physical seat is available or booked relative to a specific *showtime*, not in perpetuity. Storing status in `SEAT` would prevent scheduling concurrent or future screenings in that auditorium.
* **Concrete Improvement:** Create a MySQL View `vw_live_seat_availability` joining `SHOWTIME`, `SEAT`, and `BOOKED_SEAT`.

---

### 4. ER Diagram Correctness
* **Score:** 8.5 / 10
* **What is Implemented:** Entity-Relationship diagram completely captures all 15 entities, primary keys, foreign key lines, and Crow's Foot cardinality notations.
* **Evidence:**
  - `CINEVERSE_ER_Diagram.mmd` (Mermaid code)
  - `report_assets/cineverse_er_diagram.svg` and `report_assets/fig_3_1_er_diagram.png`
  - Verified relationship lines: 15 explicit foreign key relationships.
* **Design Strengths:** Accurate modeling of associative entities (junction tables) `BOOKED_SEAT` and `SNACK_ORDER_ITEM` resolving Many-to-Many relationships.
* **Potential Weaknesses:** The Mermaid ER diagram models `CUSTOMER` &harr; `ACCOUNT` as a 1:1 relationship, but the ER notation in standard Chen notation could distinguish the total vs partial participation.
* **Examiner Challenge:** *"Which entities in your ER diagram are strong entities and which are weak entities?"*
  - **Defense:** `THEATER`, `MOVIE`, `CUSTOMER`, and `SNACK` are strong entities (exist independently). `SCREEN` and `SEAT` can be considered structurally dependent on `THEATER` and `SCREEN` respectively (existence dependency). `BOOKED_SEAT` is an associative entity whose identity depends on `BOOKING` and `SEAT`.
* **Concrete Improvement:** Add Chen ER diagram notation side-by-side with Crow's Foot to demonstrate dual theoretical mastery.

---

### 5. Relational Schema and Data Types
* **Score:** 8.5 / 10
* **What is Implemented:** Explicit data typing utilizing appropriate relational primitives:
  - Monetary values: `DECIMAL(10,2)` for zero round-off error
  - Time tracking: `TIME` for start/end, `DATE` for show date, `TIMESTAMP` with `CURRENT_TIMESTAMP` for audit logging
  - Text fields: Bounded `VARCHAR(100)` to `VARCHAR(150)`; no unbounded `TEXT` fields
  - Numerical counts: `INT` with `capacity > 0` and `duration > 0`
* **Evidence:**
  - Verified via `INFORMATION_SCHEMA.COLUMNS` across all 15 tables.
* **Design Strengths:** Zero use of floating-point types (`FLOAT` or `DOUBLE`) for financial data, preventing binary floating-point rounding anomalies during revenue aggregation.
* **Potential Weaknesses:** Movie ratings use `DECIMAL(3,1)` allowing values up to 99.9 if unchecked, though constrained to $\le 10.0$ by check constraint `chk_movie_rating`.
* **Examiner Challenge:** *"Why use `DECIMAL(10,2)` instead of `FLOAT` or `DOUBLE` for ticket prices?"*
  - **Defense:** `FLOAT` and `DOUBLE` use IEEE 754 binary floating-point representation, which cannot precisely represent fractional decimal powers (e.g., $0.10$). In financial ledgers, accumulating rounding discrepancies violates accounting standards. `DECIMAL` stores numbers as fixed-point exact integers.
* **Concrete Improvement:** Standardize currency ISO codes by adding a `currency_code CHAR(3) DEFAULT 'INR'` column to `THEATER`.

---

### 6. Primary and Foreign Keys
* **Score:** 9.5 / 10
* **What is Implemented:** Every table possesses a declared Primary Key. All 15 foreign key constraints are enforced by the InnoDB engine with explicit constraint names.
* **Evidence:**
  - Verified via `INFORMATION_SCHEMA.KEY_COLUMN_USAGE`
  - Composite Primary Keys:
    * `BOOKED_SEAT`: `PRIMARY KEY (booking_id, seat_id)`
    * `SNACK_ORDER_ITEM`: `PRIMARY KEY (snack_order_id, snack_id)`
  - Composite Unique Constraints:
    * `SCREEN`: `UNIQUE KEY uq_theater_screen (theater_id, screen_number)`
    * `SEAT`: `UNIQUE KEY uq_screen_seat (screen_id, seat_number)`
* **Design Strengths:** Composite unique keys prevent real-world duplication: Screen 1 cannot exist twice within the same theater; Seat A1 cannot exist twice within the same auditorium screen.
* **Potential Weaknesses:** None found. Primary and foreign key architecture is exemplary.
* **Examiner Challenge:** *"What is the difference between a Primary Key and a Unique Constraint?"*
  - **Defense:** A table can have only one Primary Key, which strictly forbids `NULL` values. A table can possess multiple `UNIQUE` constraints. In CINEVERSE, `seat_id` is the surrogate PK, while `(screen_id, seat_number)` is an alternate/candidate key enforced via a `UNIQUE` constraint.
* **Concrete Improvement:** None required.

---

### 7. Relationship Cardinalities
* **Score:** 9.0 / 10
* **What is Implemented:**
  - **One-to-One (1:1):** `CUSTOMER` &harr; `ACCOUNT` (enforced by `UNIQUE (customer_id)` on `ACCOUNT`), `CUSTOMER` &harr; `LOYALTY_ACCOUNT` (enforced by `UNIQUE (customer_id)` on `LOYALTY_ACCOUNT`), `BOOKING` &harr; `PAYMENT` (enforced by `UNIQUE (booking_id)` on `PAYMENT`).
  - **One-to-Many (1:N):** `THEATER` &rarr; `SCREEN`, `SCREEN` &rarr; `SEAT`, `MOVIE` &rarr; `SHOWTIME`, `SCREEN` &rarr; `SHOWTIME`, `CUSTOMER` &rarr; `BOOKING`, `SHOWTIME` &rarr; `BOOKING`, `BOOKING` &rarr; `SNACK_ORDER`.
  - **Many-to-Many (M:N):** `BOOKING` &harr; `SEAT` (via `BOOKED_SEAT`), `SNACK_ORDER` &harr; `SNACK` (via `SNACK_ORDER_ITEM`).
* **Evidence:**
  - Live constraint definitions inspected in `INFORMATION_SCHEMA.STATISTICS` and `KEY_COLUMN_USAGE`.
* **Design Strengths:** Realizes 1:1 relationships using unique foreign keys rather than merging attributes into a bloated mega-table, preserving separation of concerns (patron demographics vs salted password credentials).
* **Potential Weaknesses:** None. Cardinalities faithfully mirror the business rules of cinema multiplex operations.
* **Examiner Challenge:** *"Why is the relationship between BOOKING and SEAT Many-to-Many if a seat can only be booked once for a showtime?"*
  - **Defense:** A physical seat (e.g., Seat 101) can be booked across *hundreds* of different showtimes over the year. Simultaneously, a single booking reservation can encompass *multiple* seats (e.g., a family booking 4 seats). Therefore, the relationship between the `BOOKING` entity and the physical `SEAT` entity is Many-to-Many ($M:N$), necessitating the `BOOKED_SEAT` junction table.
* **Concrete Improvement:** None required.

---

### 8. Normalization and Functional Dependencies
* **Score:** 8.5 / 10
* **What is Implemented:** The schema satisfies 1NF, 2NF, and 3NF across all 15 tables.
* **Evidence:**
  - **1NF:** All attributes are atomic (no comma-separated seats or array types).
  - **2NF:** In tables with composite keys (`BOOKED_SEAT` and `SNACK_ORDER_ITEM`), non-key attributes (`ticket_price`, `quantity`, `unit_price`) depend on the *entire* composite key, not a proper subset.
  - **3NF:** No non-key attribute is transitively dependent on the primary key via another non-key attribute. For example, `SCREEN` contains `theater_id`, while theater address and city remain strictly in `THEATER`.
* **Design Strengths:** High structural integrity. Modifying a theater's street address requires updating exactly one row in `THEATER`, eliminating update anomalies across screens and showtimes.
* **Potential Weaknesses:** Controlled denormalization: `BOOKED_SEAT` stores `ticket_price` at the moment of reservation. This is an intentional historical financial snapshot, not an unnormalized redundancy anomaly.
* **Examiner Challenge:** *"Does `BOOKED_SEAT.ticket_price` violate 3NF since base price is already stored in `SHOWTIME`?"*
  - **Defense:** No. In transactional accounting, recording the executed ticket price is mandatory. If ticket base prices in `SHOWTIME` or tier multipliers change in the future, historical accounting records must reflect the exact price paid by the customer at the time of purchase. Storing this value preserves immutable financial history.
* **Concrete Improvement:** Formally document this design decision in the project report as intentional temporal snapshot denormalization.

---

### 9. Referential Integrity and Constraints
* **Score:** 9.5 / 10
* **What is Implemented:** Comprehensive integrity protection at both schema and database engine levels:
  - **22 Active CHECK Constraints:** Validating email formatting, rating bounds ($0.0 \le rating \le 10.0$), positive quantities, and allowed ENUM-like sets (`membership_level`, `payment_method`, `booking_status`, `seat_type`).
  - **Cascading Deletions:** `ON DELETE CASCADE` on `account`, `loyalty_account`, `screen`, `seat`, `booked_seat`, `payment`, `snack_order`, `snack_order_item`.
  - **Restrictive Deletions:** `ON DELETE RESTRICT` on `booking -> customer`, `booking -> showtime`, `showtime -> movie`, `showtime -> screen`, preventing catastrophic accidental deletion of commercial records.
* **Evidence:**
  - Audited directly via `INFORMATION_SCHEMA.CHECK_CONSTRAINTS` and `INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS`.
* **Design Strengths:** Industry-grade referential integrity. Deleting a Movie that has scheduled showtimes or bookings is rejected outright by the MySQL engine.
* **Potential Weaknesses:** None found.
* **Examiner Challenge:** *"What happens if an admin tries to delete a Movie that has active ticket bookings?"*
  - **Defense:** The operation fails at two levels: First, `backend/src/controllers/movieController.js` performs a pre-flight query checking `SELECT show_id FROM SHOWTIME WHERE movie_id = ?` and returns HTTP 409 Conflict. Second, even if bypassed, MySQL's foreign key constraint `fk_showtime_movie` enforces `ON DELETE RESTRICT` and aborts the query with Error 1451.
* **Concrete Improvement:** None required.

---

### 10. SQL Query Quality
* **Score:** 8.5 / 10
* **What is Implemented:** SQL queries demonstrate high proficiency in relational operations:
  - Multi-table INNER JOINs spanning up to 6 tables (`BOOKING`, `CUSTOMER`, `SHOWTIME`, `MOVIE`, `SCREEN`, `THEATER`)
  - Aggregations: `SUM`, `AVG`, `COUNT(DISTINCT ...)`, `COALESCE`
  - Grouping and Filtering: `GROUP BY` with `HAVING`, `WHERE 1=1` dynamic filtering
  - String manipulation: `GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ')`
  - 100% Parameterized query execution using `?` placeholders preventing SQL injection.
* **Evidence:**
  - `backend/src/controllers/bookingController.js` (Lines 9–51, 65–125)
  - `backend/src/controllers/reportController.js` (Lines 9–40: revenue rollups)
* **Design Strengths:** Prepared statements (`pool.execute()`) leverage the MySQL binary protocol for query plan caching and injection immunity.
* **Potential Weaknesses:** Subqueries could be leveraged more heavily in place of multiple sequential round trips in certain controller functions.
* **Examiner Challenge:** *"What is the performance drawback of `GROUP_CONCAT` in your `getAllBookings` query?"*
  - **Defense:** `GROUP_CONCAT` is subject to MySQL's `group_concat_max_len` system variable (default 1024 bytes). For bookings with an unusually high number of seats, seat strings exceeding this limit would be silently truncated. In production, this can be mitigated by adjusting `group_concat_max_len` or querying seat allocations in a dedicated child query.
* **Concrete Improvement:** Add query indexing on `SHOWTIME(show_date, start_time)` to optimize screening range lookups.

---

### 11. CRUD Implementation
* **Score:** 8.5 / 10
* **What is Implemented:** Full Create, Read, Update, Delete capabilities exposed through REST endpoints:
  - **Movies:** Create (`POST /api/admin/movies`), Read (`GET /api/movies`), Update (`PUT /api/admin/movies/:id`), Delete (`DELETE /api/admin/movies/:id`)
  - **Showtimes:** Create with collision check (`POST /api/admin/showtimes`), Read (`GET /api/showtimes`), Delete (`DELETE /api/admin/showtimes/:id`)
  - **Bookings:** Create (`POST /api/bookings`), Read (`GET /api/bookings`), Cancel/Update (`PUT /api/bookings/:id/cancel`)
* **Evidence:**
  - `backend/src/routes/api.js`
  - `backend/src/controllers/movieController.js`
  - `backend/src/controllers/showtimeController.js`
  - `backend/src/controllers/bookingController.js`
* **Design Strengths:** Input sanitization and conflict validation precede all DML execution.
* **Potential Weaknesses:** Customer profile updates are not fully exposed in the retail frontend (customers cannot edit phone/email in the UI).
* **Examiner Challenge:** *"How does your system handle booking deletion?"*
  - **Defense:** We do not physically execute `DELETE FROM BOOKING`. Deleting financial transactions destroys audit trails. Instead, we perform a logical/soft cancellation: `UPDATE BOOKING SET booking_status = 'CANCELLED'` and `UPDATE PAYMENT SET payment_status = 'REFUNDED'`. This immediately releases the seats for re-booking while preserving financial history.
* **Concrete Improvement:** Implement customer profile self-service editing endpoints.

---

### 12. Transaction Management and Concurrency
* **Score:** 8.0 / 10
* **What is Implemented:** Multi-statement ACID transactions implemented via `conn.beginTransaction()`, `conn.commit()`, and `conn.rollback()` in `bookingController.js` and `showtimeController.js`.
* **Evidence:**
  - `backend/src/controllers/bookingController.js` (Lines 154–351: `createBooking`)
  - `backend/src/controllers/bookingController.js` (Lines 363–407: `cancelBooking`)
* **Design Strengths:** Atomicity is strictly respected. If snack inventory deduction fails after seat reservation, or payment fails, the entire transaction rolls back completely, leaving zero orphan rows.
* **Potential Weaknesses:** Concurrency race condition on seat selection! Step 5 of `createBooking` queries `BOOKED_SEAT` without an explicit row lock (`FOR UPDATE`) or serializable isolation. Two simultaneous requests checking the same seat could both see it as available before either commits.
* **Examiner Challenge:** *"What happens if two users click 'Confirm Booking' for the exact same seat at the exact same millisecond?"*
  - **Defense (Honest & Defensible):** In the current implementation, because the seat conflict query in Step 5 does not execute `SELECT ... FOR UPDATE`, and MySQL's default isolation level is `REPEATABLE READ`, both transactions could pass the conflict check and attempt insertion. While the application checks conflicts, under high concurrency a race condition is theoretically possible. To make this 100% concurrency-proof at the database engine level, we must either add `FOR UPDATE` to the seat validation query, or enforce an engine-level unique key constraint on `(show_id, seat_id)`.
* **Concrete Improvement:** Add `FOR UPDATE` to the seat conflict check query or create a reservation lock table.

---

### 13. Backend Database Driver and Integration
* **Score:** 8.5 / 10
* **What is Implemented:** Connection pooling implemented via `mysql2/promise` with configuration parameters loaded from environment variables (`.env`).
* **Evidence:**
  - `backend/src/config/db.js`
  - Connection Pool Config: `connectionLimit: 10`, `queueLimit: 0`, `waitForConnections: true`, `enableKeepAlive: true`.
* **Design Strengths:** Asynchronous non-blocking I/O using native ES6 `async/await`. Connection pooling prevents socket exhaustion under bursts of HTTP requests.
* **Potential Weaknesses:** Connection pool size is fixed at 10; could be tuned dynamically based on production CPU cores.
* **Examiner Challenge:** *"Why use connection pooling instead of opening a new `mysql.createConnection()` for each incoming HTTP request?"*
  - **Defense:** Establishing a new TCP handshake and MySQL authentication session takes 20–50ms per request. Under 100 concurrent requests, creating individual connections exhausts server sockets and crashes MySQL. A connection pool keeps a pool of authenticated, ready-to-use connections alive, drastically reducing query latency to sub-2ms.
* **Concrete Improvement:** Implement pool health monitoring and alert logging if queue wait time exceeds 200ms.

---

### 14. Admin and Customer Frontend Integration
* **Score:** 8.5 / 10
* **What is Implemented:** Two dedicated Single-Page Applications (SPAs) built with React 18, utilizing modern hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) and Axios API service abstraction.
* **Evidence:**
  - `frontend-admin/src/views/` (`MoviesView.jsx`, `ShowtimesView.jsx`, `TheatersView.jsx`, `HeroTrailersView.jsx`)
  - `frontend-customer/src/views/` (`HomeView.jsx`, `TheatresView.jsx`, `BookingFlowView.jsx`, `MyBookingsView.jsx`)
* **Design Strengths:** Rich interactive experiences: dynamic 3D WebGL canvas (`Three.js`), interactive theater seat picker with tier colors, and instant feedback.
* **Potential Weaknesses:** State management uses prop-drilling and local component state rather than a global Redux/Zustand store.
* **Examiner Challenge:** *"How does the customer seat map update when an admin schedules a new showtime or cancels a screening?"*
  - **Defense:** The customer frontend fetches showtime seats dynamically upon navigating to `/booking-flow` by issuing `GET /api/showtimes/:id/seats`. This hits the database directly, returning the up-to-the-second seat map.
* **Concrete Improvement:** Introduce WebSockets (`Socket.io`) for real-time live seat holding across multiple active user browsers.

---

### 15. Booking and Seat Availability Consistency
* **Score:** 7.5 / 10
* **What is Implemented:** Dynamic seat calculation:
  - `total_seats = seats.length`
  - `booked_seats = bookedSeatIds.size` (from active bookings `booking_status != 'CANCELLED'`)
  - `available_seats = total_seats - booked_seats`
* **Evidence:**
  - `backend/src/controllers/showtimeController.js` (Lines 48–94: `getShowtimeSeats`)
* **Design Strengths:** Does not rely on stale counters or cached seat states. Seat availability is dynamically derived from the relational ledger.
* **Potential Weaknesses:** No temporary "Seat Holding / Cart Reservation" mechanism. If a user selects a seat, it is not held while they fill in payment details; it is only secured upon final booking submission.
* **Examiner Challenge:** *"What prevents a user from holding 10 seats indefinitely without paying?"*
  - **Defense:** In CINEVERSE, seats are not locked during selection; they are committed to the database only when the transaction succeeds. This guarantees that seats are never locked up by abandoned carts. However, in high-volume ticketing, an industry improvement is to implement an ephemeral 5-minute Redis TTL seat lock.
* **Concrete Improvement:** Implement an expiring seat-reservation token with a 5-minute timeout.

---

### 16. Payment Data Handling
* **Score:** 7.0 / 10
* **What is Implemented:** Simulated payment settlement engine. When a booking request is submitted, a `PAYMENT` row is inserted with `payment_status = 'COMPLETED'`, `payment_method` (`UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Cash`), and amount matching the booking total.
* **Evidence:**
  - `backend/src/controllers/bookingController.js` (Lines 305–311)
  - `database/02_create_tables.sql` (`PAYMENT` table definition with `uq_payment_booking`)
* **Design Strengths:** Relational integrity is strictly enforced via `uq_payment_booking UNIQUE (booking_id)` ensuring a 1:1 relationship between ticket invoices and payment receipts.
* **Potential Weaknesses:** Does not communicate with a real banking payment gateway (e.g., Razorpay or Stripe) over webhook callbacks.
* **Examiner Challenge:** *"Is your payment gateway real or simulated? What PCI-DSS risks would exist if this went live?"*
  - **Defense:** It is an internal academic simulation. If deployed commercially, storing raw credit card details or handling payments without PCI-DSS compliance is illegal. A production deployment would use hosted checkout sessions (e.g., Stripe/Razorpay) where credit card numbers never touch our servers, and our database only stores the gateway's tokenized transaction ID.
* **Concrete Improvement:** Integrate Razorpay Test Sandbox with webhook-verified signature validation.

---

### 17. Testing and Validation
* **Score:** 8.0 / 10
* **What is Implemented:** 37 automated integration tests verifying database release status queries, conflict-free scheduling, admin trailer CRUD, URL normalization, and seat isolation. 100% pass rate.
* **Evidence:**
  - `REPORT_VERIFICATION.md` (Section 4: Test Execution)
  - `scratch/comprehensive_test.js` (37 passed, 0 failed)
  - Production build verifications: `npm run build` succeeds with 0 errors across both React frontends.
* **Design Strengths:** Tests are executed against live running servers and live MySQL database, not mocked memory stubs.
* **Potential Weaknesses:** Lacks an automated continuous integration test runner (e.g., Jest or Vitest) configured in `backend/package.json` scripts.
* **Examiner Challenge:** *"How did you verify that your scheduling collision detection works for adjacent and overlapping time slots?"*
  - **Defense:** We validated the mathematical interval condition $(s_{start} < end_{calc} \land s_{end} > start_{form})$ against multiple test scenarios: identical start time, screening starting inside an existing screening, screening ending after another starts, and sequential screening with insufficient turnaround buffer (< 15 mins). All invalid cases were rejected with HTTP 409 Conflict.
* **Concrete Improvement:** Add Jest test scripts to `backend/package.json` with code coverage reports.

---

### 18. Documentation, Report and Demo Readiness
* **Score:** 9.0 / 10
* **What is Implemented:** Complete academic deliverables package:
  - 29-page publication-quality PDF report (`CINEVERSE_RDBMS_Project_Report.pdf`) matching Manipal University Jaipur formatting.
  - Fully editable Word document (`CINEVERSE_RDBMS_Project_Report.docx`).
  - High-resolution ER diagram vector SVG and raster PNG (`report_assets/`).
  - Live servers running locally on ports 5000, 5173, and 5174 ready for immediate inspection.
* **Evidence:**
  - Verified deliverables on disk in `d:\Desktop\Projects\RDBMS\`.
* **Design Strengths:** Report contains zero placeholder text in technical chapters, verified table row counts, and authentic screenshots.
* **Potential Weaknesses:** Cover page requires student registration details to be filled in.
* **Examiner Challenge:** *"Can you show me the exact database rows that support your admin dashboard KPIs?"*
  - **Defense:** Yes. The admin dashboard queries `SELECT COUNT(*) FROM MOVIE` (13), `SHOWTIME` (1008), `BOOKING` (19), and `CUSTOMER` (10). We can verify these numbers live in MySQL CLI during the viva.
* **Concrete Improvement:** Fill in student personal details on the cover page.

---

## Examiner Challenges & Strategic Improvement Plan

### Top 5 Examiner Vulnerabilities to Defend

1. **Seat Booking Concurrency (Race Condition):**
   - *Risk:* No `SELECT ... FOR UPDATE` on `BOOKED_SEAT` during Step 5 of `createBooking`.
   - *Defense:* Acknowledge the theoretical limitation under high concurrent volume. Explain that MySQL's InnoDB transactions and the application conflict check handle sequential and isolated requests cleanly, but an enterprise deployment requires `FOR UPDATE` row locking or an engine-level unique key constraint on `(show_id, seat_id)`.
2. **Simulated Payment Gateway:**
   - *Risk:* No real third-party payment gateway integration.
   - *Defense:* Clarify that the project's primary scope is RDBMS schema design and transactional data reconciliation. Financial reconciliation is accurately modeled via `PAYMENT` with 1:1 constraints and `COMPLETED`/`REFUNDED` status transitions.
3. **Absence of Database Triggers and Stored Procedures:**
   - *Risk:* Examiner expects stored procedures or triggers in an RDBMS lab.
   - *Defense:* Explain that modern enterprise software engineering often places business validation in the application service layer for portability, unit testability, and horizontal scaling. However, demonstrate your mastery of SQL by offering the exact DDL/SQL code for a stored procedure or trigger (provided in Section E & J of the Viva Pack).
4. **Movie Catalog Fallback Settings:**
   - *Risk:* `trailer_url` and release dates are supplemented by `backend/data/hero_settings.json` when columns are absent in the initial base migration.
   - *Defense:* Migration scripts `10_add_movie_release_management.sql` and `11_add_movie_trailer_and_hero_settings.sql` have been prepared to add these columns natively. The JSON fallback ensures backwards compatibility without executing destructive unverified migrations.
5. **No Ephemeral Seat Holding (Cart Lock):**
   - *Risk:* Seat availability is instantaneous rather than held for 5 minutes during checkout.
   - *Defense:* Explain that in an ACID RDBMS model, long-lived locks in the database reduce transaction throughput. Commercial systems use Redis in-memory caches for 5-minute cart locks, which sits outside the scope of a core relational database evaluation.

