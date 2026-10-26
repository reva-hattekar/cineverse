# CINEVERSE — Movie Theater Ticket Engine

An enterprise-grade, full-stack Movie Theater Ticketing Engine and Cinema Management System built for academic RDBMS evaluations and modern web demonstrations.

The system features two completely separated, independent web applications:
1. **Admin Management Portal (`http://localhost:5173`)**: Premium cinema operations SaaS dashboard.
2. **Customer Ticketing Portal (`http://localhost:5174`)**: Cinematic movie discovery, realistic BookMyShow-inspired auditorium seat picker, concessions ordering, and interactive checkout.

Backed by **MySQL 8.x** with a normalized **15-table relational schema**, enforcing ACID transactions, seat conflict prevention, cancellation seat release, and SQL concepts covering **Experiments 1 through 8**.

---

## 🏛️ System Architecture

```
RDBMS/
├── backend/                         # Node.js + Express REST API (Port 5000)
│   ├── src/
│   │   ├── config/db.js             # mysql2 connection pool with transaction helper
│   │   ├── controllers/             # Movie, Theater, Showtime, Booking, Admin, TMDB controllers
│   │   ├── middleware/              # JWT RBAC authentication & centralized error handler
│   │   ├── routes/api.js            # Express router
│   │   └── server.js                # Server entry point
│   ├── .env.example                 # Environment configuration template
│   └── package.json
├── database/
│   ├── 01_create_database.sql       # Database creation (MovieTheaterDB)
│   ├── 02_create_tables.sql         # 15 normalized InnoDB tables with constraints
│   ├── 03_insert_sample_data.sql    # Realistic sample data (10 movies, 4 screens, 68 seats)
│   ├── 04_lab_queries.sql           # Experiments 1–8 viva queries (DDL, DQL, Joins, Subqueries)
│   ├── 05_verification_queries.sql  # Database audit queries & reconciliation
│   └── 06_add_movie_artwork.sql     # Additive migration for TMDB poster/backdrop artwork
├── frontend-admin/                  # Dedicated Staff/Admin Website (Port 5173)
│   ├── src/                         # React 18 + Vite 5 + Lucide icons
│   ├── vite.config.js               # Port 5173 with /api proxy to Port 5000
│   └── package.json
└── frontend-customer/               # Dedicated Customer Ticketing Website (Port 5174)
    ├── src/                         # React 18 + Vite 5 + Lucide icons
    ├── vite.config.js               # Port 5174 with /api proxy to Port 5000
    └── package.json
```

---

## 🚀 Quick Start Guide (Windows)

### 1. Database Setup
Make sure MySQL Server 8.0 is running. Execute the SQL scripts in this exact order in **MySQL Workbench** or via CLI:
```powershell
# In MySQL Workbench or MySQL CLI:
1. database/01_create_database.sql
2. database/02_create_tables.sql
3. database/03_insert_sample_data.sql
4. database/06_add_movie_artwork.sql
```

### 2. Configure & Start Backend (Port 5000)
```powershell
cd d:\Desktop\Projects\RDBMS\backend
# Edit .env with your MySQL root password:
# DB_PASSWORD=your_mysql_password
npm start
```
* Backend URL: `http://localhost:5000`
* Diagnostics Health Check: `http://localhost:5000/api/health`

### 3. Start Admin Website (Port 5173)
```powershell
cd d:\Desktop\Projects\RDBMS\frontend-admin
npm run dev
```
* Admin URL: **`http://localhost:5173`**
* **Demo Admin Login:** `admin@cinema.com` / `Admin@123`
* **Demo Manager Login:** `manager1@cinema.com` / `Admin@123`

### 4. Start Customer Website (Port 5174)
```powershell
cd d:\Desktop\Projects\RDBMS\frontend-customer
npm run dev
```
* Customer URL: **`http://localhost:5174`**
* Pre-loaded Customer: **Aarav Sharma** (Switchable to any of the 10 seeded customers in the top navigation profile pill)

---

## 🗄️ Database Relational Model (15 Tables)

| # | Table Name | Cardinality | Key Columns & Integrity |
|---|---|---|---|
| 1 | `CUSTOMER` | Base Entity | `customer_id` (PK), `customer_name`, `email` (UQ), `phone` |
| 2 | `ACCOUNT` | 1:0..1 with CUSTOMER | `account_id` (PK), `customer_id` (FK, UQ), `password_hash`, `is_active` |
| 3 | `LOYALTY_ACCOUNT` | 1:0..1 with CUSTOMER | `loyalty_id` (PK), `customer_id` (FK, UQ), `total_points`, `membership_level` |
| 4 | `THEATER` | 1:M with SCREEN | `theater_id` (PK), `theater_name`, `city`, `address` |
| 5 | `ADMIN_STAFF` | M:1 with THEATER | `staff_id` (PK), `staff_name`, `role` (Admin/Manager/Cashier), `theater_id` (FK) |
| 6 | `SCREEN` | M:1 with THEATER | `screen_id` (PK), `screen_number`, `capacity`, `theater_id` (FK), UQ(`theater_id`, `screen_number`) |
| 7 | `SEAT` | M:1 with SCREEN | `seat_id` (PK), `seat_number`, `seat_type` (Standard/Premium/VIP), `screen_id` (FK) |
| 8 | `MOVIE` | 1:M with SHOWTIME | `movie_id` (PK), `title`, `genre`, `duration`, `language`, `rating`, `poster_url`, `backdrop_url` |
| 9 | `SHOWTIME` | M:1 with MOVIE, SCREEN | `show_id` (PK), `show_date`, `start_time`, `end_time`, `base_price`, `movie_id` (FK), `screen_id` (FK) |
| 10 | `BOOKING` | M:1 with CUSTOMER, SHOWTIME | `booking_id` (PK), `booking_date`, `total_amount`, `booking_status` (CONFIRMED/CANCELLED) |
| 11 | `BOOKED_SEAT` | M:N (BOOKING & SEAT) | Composite PK (`booking_id`, `seat_id`), `ticket_price` |
| 12 | `PAYMENT` | 1:0..1 with BOOKING | `payment_id` (PK), `booking_id` (FK, UQ), `amount`, `payment_method`, `payment_status` |
| 13 | `SNACK` | 1:M with ORDER_ITEM | `snack_id` (PK), `snack_name`, `price`, `stock_quantity` |
| 14 | `SNACK_ORDER` | M:1 with BOOKING | `snack_order_id` (PK), `booking_id` (FK), `total_price`, `order_status` |
| 15 | `SNACK_ORDER_ITEM` | M:N (SNACK_ORDER & SNACK) | Composite PK (`snack_order_id`, `snack_id`), `quantity`, `unit_price` |

---

## 🎨 Feature Highlights

### 1. Dedicated Admin Website (`http://localhost:5173`)
* **SaaS Design**: Fixed dark sidebar with Lucide iconography, top navigation bar with live MySQL connection pill, logged-in staff role badge, and clean table views.
* **11 Core Management Modules**:
  1. **Overview**: Real-time KPI summary cards (Gross Revenue, Bookings, Movies, Showtimes, Customers) and live transaction stream.
  2. **Movie Management**: Catalog view with official TMDB poster thumbnails, Add/Edit/Delete modals with input validation.
  3. **Theaters & Screens**: Venue directory with auditorium capacity details.
  4. **Showtime Programming**: Scheduling calendar slots with base ticket pricing.
  5. **Seat Availability**: Dynamic interactive auditorium map showing booked vs available seats for any showtime.
  6. **Bookings & Tickets**: Master booking ledger with **Cancel & Release** capability.
  7. **Payment Audit**: Financial audit trail preserving payment status (`COMPLETED` or `REFUNDED`) during cancellations.
  8. **Concessions & F&B**: Real-time stock counts and low-inventory warnings.
  9. **Customers & Loyalty**: Account directory with Bronze, Silver, Gold, Platinum loyalty tiers and reward points.
  10. **Staff & Roles**: RBAC staff management (Admin, Manager, Cashier, Supervisor).
  11. **Reports & Analytics**: Aggregation queries for gross box office revenue and movie popularity rankings.

### 2. Dedicated Customer Website (`http://localhost:5174`)
* **Cinematic Experience**: Dark backdrop visual styling, refined typography, electric red accents.
* **Now Showing & Upcoming**: Live catalog with real TMDB high-res posters and backdrops, search by title, and genre filter pills.
* **Realistic Auditorium Seat Picker (BookMyShow Style)**:
  * Arched cinema screen indicator (`SCREEN THIS WAY`).
  * Row-by-row layout (Row A: VIP, Row B: Premium, Row C: Standard) with aisle spacing.
  * Live status states: Available (interactive hover), Selected (electric red glow), Booked (dark disabled).
  * Real-time seat counter and ticket price calculation.
  * Sticky bottom action bar with selected seats summary and "Continue" button.
* **Concession Combos**: Interactive itemized food & beverage add-on selector.
* **Interactive Clickable Payment Checkout**:
  * Real clickable payment method selector (UPI, Credit/Debit Card, Net Banking).
  * Interactive inputs with demo auto-fill for frictionless evaluations.
  * Prominent clickable **"Pay ₹{GrandTotal}"** button with active state, hover, focus, loading spinner, and error handling.
  * Clear demo safety notice: Simulated transaction securely committing to MySQL.
* **Booking Confirmation & Self-Service Cancellation**:
  * Digital ticket slip with booking reference, seat numbers, showtime, and amount.
  * **"My Bookings"** view with real-time status and instant cancellation that releases seats back into the available pool.

---

## 🔒 Security & Demo Safety Notes
* **Zero Secrets in Frontend**: All credentials, database configurations, and TMDB keys are strictly confined to the backend environment (`backend/.env`).
* **Password Hashing**: Stored passwords use industry-standard **bcrypt** hashes.
* **Mock Payment Simulation**: Clearly distinguished from real transactions. No sensitive financial information or card details are collected or processed.
