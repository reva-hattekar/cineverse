# CINEVERSE — Last-Minute Rapid-Fire Revision & Cheat Sheet
**High-Yield Viva Revision Guide (Read 10 Minutes Before Viva)**  
**Course:** Relational Database Management Systems Laboratory (CSE Department)  
**Institution:** Manipal University Jaipur (MUJ)  

---

## Part 1: Project Facts & Credentials Cheat Sheet

| Parameter | Exact Value | Where Verified |
| :--- | :--- | :--- |
| **Database Name** | `MovieTheaterDB` | MySQL Server / `backend/.env` |
| **Storage Engine** | InnoDB (ACID Compliant) | `SHOW TABLE STATUS` |
| **Total Base Tables** | 15 Tables | `information_schema.tables` |
| **Total Database Records**| 5,699 Rows | Live Database Audit |
| **Total Theaters** | 8 Multiplex Complexes | `THEATER` table (Bengaluru, Mumbai, Delhi, Hyd, Chennai) |
| **Total Screens** | 32 Auditoriums | `SCREEN` table (4 screens per theater) |
| **Total Physical Seats** | 4,544 Seats | `SEAT` table (A1..K16 per screen) |
| **Total Movies** | 13 Theatrical Titles | `MOVIE` table |
| **Total Scheduled Shows** | 1,008 Screenings | `SHOWTIME` table |
| **Backend API URL / Port**| `http://localhost:5000` | Node.js v20 / Express 4.19 |
| **Admin Frontend Port** | `http://localhost:5173` | React 18 / Vite 5 (`frontend-admin`) |
| **Customer Frontend Port**| `http://localhost:5174` | React 18 / Vite 5 (`frontend-customer`) |
| **Admin Login Email** | `admin@cinema.com` | `ADMIN_STAFF` table |
| **Admin Login Password** | `Admin@123` | Bcrypt Hash / Lab Demo Fallback |
| **Database Driver** | `mysql2/promise` (Pool: 10) | `backend/src/config/db.js` |
| **Security Mechanism** | JWT (8h expiry) + Bcrypt (10 salt rounds) | `backend/src/middleware/auth.js` |

---

## Part 2: 30 Rapid-Fire Viva Q&As

#### 1. What is the database name?
`MovieTheaterDB`.

#### 2. What storage engine does MySQL use, and why?
InnoDB, because it supports ACID transactions, foreign keys, and row-level locking.

#### 3. How many tables are in your database?
Exactly 15 base tables.

#### 4. Name the two junction tables in your schema.
`BOOKED_SEAT` (resolves Booking &harr; Seat) and `SNACK_ORDER_ITEM` (resolves Snack Order &harr; Snack).

#### 5. What are the composite primary keys in your project?
`BOOKED_SEAT(booking_id, seat_id)` and `SNACK_ORDER_ITEM(snack_order_id, snack_id)`.

#### 6. What normal form does the database satisfy?
Third Normal Form (3NF) across all tables, with single-attribute PK tables satisfying BCNF.

#### 7. Why isn't seat availability a boolean column in the SEAT table?
Because a physical seat is available or booked relative to a specific *showtime*, not permanently.

#### 8. How is live seat availability calculated?
Available Seats = Total Screen Seats $-$ Booked Seats for that specific `show_id` in `BOOKED_SEAT`.

#### 9. What is the mathematical condition for scheduling conflict detection?
$A_{start} < B_{end} \land A_{end} > B_{start}$ on the same screen and date.

#### 10. How much turnaround buffer is added between movie screenings?
15 minutes (`turnaroundMins = 15`), automatically calculated in `showtimeController.js`.

#### 11. What happens if an admin tries to delete a movie with active showtimes?
MySQL blocks the deletion with an Error 1451 foreign key constraint violation (`ON DELETE RESTRICT`).

#### 12. What happens to child seats if a screen is deleted?
All physical seats belonging to that screen are automatically cascade-deleted (`ON DELETE CASCADE`).

#### 13. What data type is used for financial amounts?
`DECIMAL(10,2)` to prevent binary floating-point roundoff errors.

#### 14. What data type is used for movie ratings?
`DECIMAL(3,1)` constrained between 0.0 and 10.0 via check constraint `chk_movie_rating`.

#### 15. How many check constraints are active in your database?
22 active CHECK constraints.

#### 16. What happens when a booking is cancelled?
`BOOKING.booking_status` is updated to `'CANCELLED'` and `PAYMENT.payment_status` is set to `'REFUNDED'`.

#### 17. Why aren't rows deleted from BOOKED_SEAT upon cancellation?
To preserve historical transaction audit trails while immediately releasing seat availability relationally.

#### 18. How do you prevent SQL injection in your Node.js backend?
By strictly using parameterized queries (`?` placeholders) executed via `pool.execute()`.

#### 19. What is a 1:1 relationship in your schema? Give two examples.
`CUSTOMER` &harr; `ACCOUNT` (enforced by unique `customer_id`) and `BOOKING` &harr; `PAYMENT` (enforced by unique `booking_id`).

#### 20. Does your database have Triggers or Stored Procedures?
No; validations and transaction boundaries are handled in Express controllers for portability and testability.

#### 21. What is the difference between WHERE and HAVING?
`WHERE` filters individual rows *before* grouping; `HAVING` filters aggregated groups *after* `GROUP BY`.

#### 22. What is an intentional denormalization in your schema?
`BOOKED_SEAT.ticket_price`, which records the historical price snapshot at the moment of purchase.

#### 23. What are the four levels of transaction isolation?
Read Uncommitted, Read Committed, Repeatable Read (MySQL default), and Serializable.

#### 24. What does `SELECT ... FOR UPDATE` do?
Acquires exclusive row-level locks on read rows, blocking concurrent transactions until commit or rollback.

#### 25. Where is `FOR UPDATE` used in CINEVERSE?
In `bookingController.js` for deducting `SNACK` inventory and locking the `BOOKING` row during cancellation.

#### 26. How are seat categories priced?
Standard is base price, Premium is $+20\%$ (`base_price * 1.2`), and VIP Recliner is $+40\%$ (`base_price * 1.4`).

#### 27. How are admin staff passwords protected?
Salted and hashed using `bcryptjs` with 10 salt rounds (`$2a$10$...`).

#### 28. What token standard is used for session authentication?
JSON Web Tokens (JWT) signed with `JWT_SECRET` and expiring in 8 hours.

#### 29. What is a candidate key? Give an example from CINEVERSE.
Any minimal superkey. In `CUSTOMER`, both `customer_id` and `email` are candidate keys.

#### 30. How many automated tests were executed, and what was the pass rate?
37 integration tests executed with a 100% pass rate (37 passed, 0 failed).

---

## Part 3: Golden Rules for Defending Your Viva

1. **Be Honest About Concurrency:** If asked about race conditions on seat booking, acknowledge that adding `SELECT ... FOR UPDATE` or an engine-level unique key on `(show_id, seat_id)` is the recommended production enhancement.
2. **Never Guess Table or Column Names:** Keep the cheat sheet above in mind: `SHOWTIME` uses `show_id`, `SCREEN` uses `screen_id`, and `BOOKED_SEAT` has composite PK `(booking_id, seat_id)`.
3. **Anchor on Relational Theory:** When asked why you designed a table a certain way, always use theoretical terms: *"To eliminate transitive dependencies (3NF)"*, *"To resolve Many-to-Many cardinality"*, or *"To prevent update anomalies"*.

