# CINEVERSE — Academic Project Report & Verification Log

**Generated on:** 27 October 2026  
**Institution:** Manipal University Jaipur — Department of Computer Science and Engineering  
**Database:** MySQL `MovieTheaterDB`  
**Project Location:** `d:\Desktop\Projects\RDBMS`

---

## 1. Executive Summary & Deliverables

This audit and report generation was performed in accordance with the academic guidelines specified in `Sample RDBMS Lab Project Report.pdf`. The resulting deliverables are:

1. **`CINEVERSE_RDBMS_Project_Report.pdf`**: Complete, publication-quality academic report in PDF format matching the reference's layout, Computer Modern / Times Roman typography, page budgets, numbered headings, and 29 numbered academic pages (30 physical pages with unnumbered cover page).
2. **`CINEVERSE_RDBMS_Project_Report.docx`**: Fully editable Microsoft Word document matching the complete report structure, headings, tables, and academic citations.
3. **`CINEVERSE_ER_Diagram.mmd`**: Reproducible Mermaid ER diagram source code capturing all 15 relational tables, primary keys, foreign keys, and cardinalities.
4. **`report_assets/cineverse_er_diagram.svg`** and **`report_assets/fig_3_1_er_diagram.png`**: Ultra-high-resolution vector and raster renderings of the database blueprint.
5. **`report_source.html`**: Semantic HTML source used to compile the PDF via Chrome headless rendering.

---

## 2. Verified Project Facts & Database Audit

The database schema was audited directly against the live running MySQL database `MovieTheaterDB` using `information_schema`:

| Table Name | Physical Rows | Primary Key | Foreign Key References | Normal Form | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **THEATER** | 8 | `theater_id` | None | 3NF | Multi-city cinema complexes (Bengaluru, Mumbai, Delhi, etc.) |
| **SCREEN** | 32 | `screen_id` | `theater_id` &rarr; THEATER | 3NF | Multiplex auditoriums (Standard, Laser IMAX, 4DX, VIP) |
| **SEAT** | 4,544 | `seat_id` | `screen_id` &rarr; SCREEN | 3NF | Granular physical seats with tier classifications (A1..K16) |
| **MOVIE** | 13 | `movie_id` | None | 3NF | Movie catalog with runtimes, genres, ratings, artwork, trailers |
| **SHOWTIME** | 1,008 | `show_id` | `movie_id`, `screen_id` | 3NF | Programmed screening schedules with collision checks |
| **CUSTOMER** | 10 | `customer_id` | None | 3NF | Customer profiles and contact directory |
| **ACCOUNT** | 8 | `account_id` | `customer_id` &rarr; CUSTOMER (1:1) | 3NF | Salted bcrypt credentials for customer web portal |
| **LOYALTY_ACCOUNT** | 7 | `loyalty_id` | `customer_id` &rarr; CUSTOMER (1:1) | 3NF | Customer rewards points and membership tiers |
| **BOOKING** | 18 | `booking_id` | `customer_id`, `show_id` | 3NF | Ticket reservation ledger with status tracking |
| **BOOKED_SEAT** | 32 | `(`booking_id, seat_id`)` | BOOKING, SEAT | 3NF | Junction table isolating individual seat allocations |
| **PAYMENT** | 18 | `payment_id` | `booking_id` &rarr; BOOKING (1:1) | 3NF | Financial settlement reconciliation audit ledger |
| **ADMIN_STAFF** | 4 | `staff_id` | `theater_id` &rarr; THEATER | 3NF | Cinema personnel and manager roles with JWT auth |
| **SNACK** | 10 | `snack_id` | None | 3NF | Concessions inventory and pricing catalog |
| **SNACK_ORDER** | 10 | `snack_order_id` | `booking_id` &rarr; BOOKING | 3NF | Concession orders tied to movie bookings |
| **SNACK_ORDER_ITEM** | 14 | `(`snack_order_id, snack_id`)`| SNACK_ORDER, SNACK | 3NF | Junction table for concession line items |

---

## 3. Verified Technology Stack

| Tier | Technology | Version | Verified Role |
| :--- | :--- | :--- | :--- |
| **Database** | MySQL (InnoDB) | 8.0+ | ACID transactions, foreign keys, row-level locks (`FOR UPDATE`) |
| **Database Driver** | `mysql2/promise` | ^3.12.0 | Asynchronous connection pooling and direct SQL execution |
| **Backend API** | Node.js + Express | v20.20.0 / 4.19 | REST API endpoints on port 5000 |
| **Security** | `jsonwebtoken` + `bcryptjs` | ^9.0.2 / ^2.4.3 | Role-based authentication and salted credential hashing |
| **Admin Frontend** | React.js + Vite | React 18 / Vite 5 | Multiplex control room application on port 5173 |
| **Customer Frontend**| React.js + Vite | React 18 / Vite 5 | Cinema ticketing single-page application on port 5174 |
| **Visual Elements** | Lucide React + Three.js | ^0.475 / ^0.186 | Dark-themed UI icons and 3D brand logo canvas |

---

## 4. Test Execution & Build Verification

The following empirical verification suites were executed against the live project:

1. **Comprehensive Verification Suite (`scratch/comprehensive_test.js`)**:
   - 37 Integration Tests: **37 Passed, 0 Failed**.
   - Verified strictly database-driven release statuses (no hardcoded TMDB mock arrays).
   - Verified dynamic hero trailer slot priority (Slots 1–3 latest, Slot 4 upcoming).
   - Verified manual override rejection for duplicate assignments and past-movie coming soon violations.

2. **Trailer & Movie Catalog Workflow Suite (`scratch/test_trailer_workflow.js`)**:
   - 10 End-to-End Workflow Tests: **10 Passed, 0 Failed**.
   - Verified admin login, movie editing, trailer URL normalization (watch, youtu.be, embed), clearing URL to `null`, and customer hero reflection.

3. **Frontend Production Builds**:
   - `npm --prefix frontend-admin run build`: **Built in 3.07s** (0 errors).
   - `npm --prefix frontend-customer run build`: **Built in 4.43s** (0 errors).

---

## 5. Authentic Screenshot Directory (`report_assets/`)

The following live screenshots were captured from the running applications at `http://127.0.0.1:5173` and `http://127.0.0.1:5174`:

- **Figure 3.1**: `fig_3_1_er_diagram.png` (Vector-rendered complete relational ER diagram)
- **Figure 4.1**: `fig_4_1_admin_login.png` (Admin JWT security portal)
- **Figure 4.2**: `fig_4_2_admin_dashboard.png` (Admin central control room dashboard)
- **Figure 4.3**: `fig_4_3_admin_movies.png` (Movie catalog with live YouTube trailer preview)
- **Figure 4.4**: `fig_4_4_admin_theaters.png` (Multiplex complex and screen management)
- **Figure 4.5**: `fig_4_5_admin_showtimes.png` (Showtime programming and screen conflict engine)
- **Figure 4.6**: `fig_4_6_customer_home.png` (Customer portal homepage and cinema hero)
- **Figure 4.7**: `fig_4_7_customer_theatres.png` (City-wide multiplex cinema discovery)
- **Figure 4.8**: `fig_4_8_customer_booking.png` (Interactive auditorium seat layout & screening selection)
- **Figure 4.9**: `fig_4_9_customer_bookings.png` (Customer confirmed booking ticket invoices)

---

## 6. Placeholders Awaiting Student Personal Details

As mandated by academic integrity rules, the report contains clear placeholders on the Cover Page (Page 1):
- `[STUDENT NAME]`: Student full legal name.
- `[REGISTRATION NUMBER]`: University registration number (e.g., `2427030603`).
- `[SUPERVISOR NAME]`: Faculty project supervisor / guide title and name (e.g., `Dr. Rishi Gupta`).

No other placeholders exist; all technical descriptions, schemas, test results, code architectures, and references are 100% complete.
