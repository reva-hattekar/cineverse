# CINEVERSE — Comprehensive Viva Voce Question Bank
**Official Examination Preparation Pack**  
**Course:** Relational Database Management Systems Laboratory (CSE Department)  
**Institution:** Manipal University Jaipur (MUJ)  
**Target Project:** CINEVERSE Movie Theatre Booking & Management System  
**Database:** MySQL 8.0 (`MovieTheaterDB`) | **Stack:** Node.js, Express, React, Vite  

---

## Guide for the Viva Voce
* **How to Speak:** Deliver your answers with confidence. Keep the first sentence direct and punchy, followed by the specific database concept (table name, key, constraint, or SQL clause).
* **Grounding in Code:** Always reference the actual project tables (`SHOWTIME`, `BOOKED_SEAT`, `PAYMENT`, etc.) rather than speaking abstractly.
* **Separation of Facts:** Distinguish between what is implemented in the database vs. what is handled by the application logic.

---

## Section A: Project Overview & Motivation

#### Q1. What is CINEVERSE, and what primary problem does it solve?
**Spoken Answer:**  
"CINEVERSE is an enterprise-grade multiplex theater booking and management system. It solves the operational complexity of managing multi-city cinema complexes, scheduling collision-free screenings across auditoriums, calculating live seat availability without data redundancy, and executing atomic ticket and concession purchases."

#### Q2. Why did you choose a cinema ticketing system for an RDBMS lab project?
**Spoken Answer:**  
"Because cinema ticketing exhibits classic transactional relational challenges: Many-to-Many relationships between bookings and physical seats, strict scheduling constraints to prevent auditorium overlap, inventory control for concessions, and the absolute requirement for ACID transactions to prevent double-booking and financial discrepancies."

#### Q3. What are the key functional modules in CINEVERSE?
**Spoken Answer:**  
"The project comprises four core modules:
1. **Venue Infrastructure Module:** Managing theaters, screens, and tiered physical seating.
2. **Theatrical Programming Module:** Movie cataloging and showtime scheduling with automated turnaround buffers.
3. **Customer Ticketing & Booking Engine:** Real-time seat map selection, concession add-ons, and checkout.
4. **Administrative Back-Office Control Room:** Staff authentication, catalog CRUD, scheduling conflict prevention, and revenue reporting."

#### Q4. Who are the primary target users of the system?
**Spoken Answer:**  
"There are two distinct user roles:
1. **Retail Moviegoers (Customers):** Who browse movies, select theaters by city, pick seats from an interactive auditorium layout, and receive confirmed booking invoices.
2. **Cinema Operations Staff & Managers (Admins):** Who manage the movie catalog, configure screens, schedule showtimes, and audit ticket and snack revenues."

#### Q5. Why is a Relational Database Management System (RDBMS) necessary for this project instead of a simple file system or spreadsheets?
**Spoken Answer:**  
"A file system or spreadsheet lacks concurrent multi-user access control, cannot enforce referential integrity across related tables, does not support ACID transactions, and suffers from data redundancy and update anomalies. An RDBMS enforces schema constraints, indexes data for fast retrieval, and guarantees atomicity during multi-seat reservations."

#### Q6. What is the scope of CINEVERSE, and what are its current boundaries?
**Spoken Answer:**  
"The current scope encompasses 8 multiplex venues across 5 Indian cities, 32 auditorium screens, 4,544 physical seats, and over 1,000 scheduled screenings. Its current boundaries are that payment processing is an internal ledger simulation rather than a live banking gateway, and seat holds are instantaneous upon transaction commitment rather than an ephemeral 5-minute cart timer."

#### Q7. What was your individual contribution to the project?
**Spoken Answer:**  
"I designed the 3NF relational schema in MySQL, authored the DDL scripts with 22 check constraints and foreign keys, developed the Node.js/Express backend API with connection pooling and ACID transaction rollback, created the scheduling conflict algorithm, and built the React customer and admin web applications."

#### Q8. What was the most technically challenging database problem you solved?
**Spoken Answer:**  
"Designing the seat reservation model. Instead of denormalizing an `is_available` flag onto the physical `SEAT` table—which would prevent scheduling future screenings—I implemented an associative junction table `BOOKED_SEAT` linked to `BOOKING` and `SHOWTIME`. Live seat availability is calculated dynamically by relationally subtracting booked seats from total auditorium seats for that specific screening."

#### Q9. How does CINEVERSE handle multi-city multiplex operations?
**Spoken Answer:**  
"Through the hierarchical relationship: `THEATER` &rarr; `SCREEN` &rarr; `SEAT`. The `THEATER` table stores venue city and address. Customer queries filter screens and showtimes based on the chosen city, allowing patrons in Bengaluru, Mumbai, or Delhi to view only locally scheduled screenings."

#### Q10. How does the system handle movies that have no scheduled showtimes?
**Spoken Answer:**  
"A movie can exist in the `MOVIE` catalog independently of `SHOWTIME`. If a movie has zero scheduled showtimes, the customer frontend categorizes it as 'Coming Soon' or 'Showtimes TBA'. It only becomes bookable once an administrator schedules at least one valid showtime in an auditorium."

---

## Section B: Architecture & Technology Stack

#### Q11. What is the architecture of the CINEVERSE application?
**Spoken Answer:**  
"CINEVERSE follows a decoupled Three-Tier Architecture:
- **Presentation Tier:** Two React 18 single-page applications built with Vite (Admin on port 5173, Customer on port 5174).
- **Application Tier:** Node.js v20 with Express 4.19 REST API running on port 5000.
- **Data Tier:** MySQL 8.0 running on port 3306 with the InnoDB storage engine."

#### Q12. Why did you separate the Admin and Customer frontends into two different applications?
**Spoken Answer:**  
"For security and domain separation. The admin application contains sensitive control room components—such as JWT authentication, scheduling conflict engines, and revenue reporting—that should never be delivered in the JavaScript bundle to public retail users."

#### Q13. Why did you choose MySQL over a NoSQL database like MongoDB?
**Spoken Answer:**  
"Cinema ticketing is fundamentally relational and requires strict ACID compliance. NoSQL document stores permit denormalization and eventual consistency, which creates severe risks of double-booking under concurrent reservations. MySQL provides foreign key referential integrity, multi-table joins, and InnoDB row-level locking to guarantee zero data corruption."

#### Q14. How does the Node.js backend connect to the MySQL database?
**Spoken Answer:**  
"We use the `mysql2/promise` driver with connection pooling. In `backend/src/config/db.js`, we initialize a pool with 10 connections, keepalive enabled, and queue limit zero. Queries are executed asynchronously using `async/await` and parameterized prepared statements."

#### Q15. What is the role of Express.js in this architecture?
**Spoken Answer:**  
"Express serves as the HTTP routing and middleware framework. It parses incoming JSON request payloads, manages CORS headers between ports, handles JWT authorization headers via middleware, routes requests to dedicated controllers, and catches errors in a centralized error-handling middleware."

#### Q16. Can you trace what happens from the moment a user clicks 'Book Seats' to the database?
**Spoken Answer:**  
"1. The React frontend sends an HTTP `POST` request with a JSON body (`customer_id`, `show_id`, `seat_ids`, `payment_method`, `snacks`) to `/api/bookings`.
2. Express routes this to `createBooking` in `bookingController.js`.
3. The controller obtains a dedicated connection from the pool and calls `conn.beginTransaction()`.
4. It validates the customer and showtime, checks that seats belong to the scheduled screen, and verifies no active booking already claims those seats.
5. It inserts into `BOOKING`, loops over seats inserting into `BOOKED_SEAT`, inserts a `PAYMENT` record, deducts snack inventory, and calls `conn.commit()`.
6. It releases the connection back to the pool and returns HTTP 201 Created."

#### Q17. What is a REST API, and how does CINEVERSE implement it?
**Spoken Answer:**  
"A REST API (Representational State Transfer) uses standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to perform operations on URI-identified resources. In CINEVERSE, `GET /api/movies` retrieves the catalog, `POST /api/bookings` creates a reservation, and `PUT /api/bookings/:id/cancel` performs a logical cancellation."

#### Q18. How do environment variables protect your database configuration?
**Spoken Answer:**  
"In `backend/.env`, we store `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET`. We load them using the `dotenv` package. This keeps sensitive database credentials out of version control (`.gitignore`), preventing security leaks."

#### Q19. What is Vite, and why did you use it instead of Create React App?
**Spoken Answer:**  
"Vite is a modern frontend build tool that leverages native ES modules in the browser. It provides instantaneous server startup (< 900ms) and lightning-fast Hot Module Replacement (HMR) compared to the deprecated Webpack-based Create React App."

#### Q20. What storage engine does MySQL use for CINEVERSE, and why?
**Spoken Answer:**  
"We strictly use InnoDB. InnoDB is MySQL's ACID-compliant storage engine that supports foreign key constraints, row-level locking, and crash recovery. Legacy engines like MyISAM only support table-level locking and do not enforce foreign keys."

---

## Section C: ER Diagram & Relational Model

#### Q21. What is an Entity in an ER diagram? Give examples from CINEVERSE.
**Spoken Answer:**  
"An entity is a real-world object or concept that has an independent existence and about which data is stored. In CINEVERSE, `MOVIE`, `THEATER`, `CUSTOMER`, and `SNACK` are strong entities."

#### Q22. What is the difference between an Entity and an Attribute?
**Spoken Answer:**  
"An entity is the distinct object itself (e.g., `MOVIE`), whereas an attribute is a characteristic or property that describes that entity (e.g., `title`, `duration`, `genre`, `rating`)."

#### Q23. What are Strong and Weak Entities? Are there any weak entities in your schema?
**Spoken Answer:**  
"`THEATER` and `MOVIE` are strong entities because they have independent primary keys. `SCREEN` and `SEAT` exhibit existence dependency—a screen cannot exist without a theater, and a seat cannot exist without an auditorium screen. However, because we assign surrogate primary keys (`screen_id`, `seat_id`), they are implemented as regular relational tables with foreign keys and composite unique constraints."

#### Q24. What is a Composite Key? Where is it used in CINEVERSE?
**Spoken Answer:**  
"A composite key is a primary key that consists of two or more columns combined to uniquely identify a record. In CINEVERSE:
1. `BOOKED_SEAT` uses `PRIMARY KEY (booking_id, seat_id)`.
2. `SNACK_ORDER_ITEM` uses `PRIMARY KEY (snack_order_id, snack_id)`."

#### Q25. What is a Candidate Key? Give an example from your tables.
**Spoken Answer:**  
"A candidate key is any minimal set of attributes that can uniquely identify a tuple in a relation. In our `CUSTOMER` table, both `customer_id` and `email` are candidate keys. We selected `customer_id` as the Primary Key and enforced `email` as an alternate key using a `UNIQUE` constraint."

#### Q26. What is a Surrogate Key versus a Natural Key?
**Spoken Answer:**  
"A natural key is an attribute that exists inherently in the real-world domain, like a customer's email or a movie title. A surrogate key is an artificially generated identifier, such as an `AUTO_INCREMENT INT` (`movie_id`, `booking_id`). We use surrogate keys for faster integer index joins and to isolate the database from real-world data changes."

#### Q27. What is a Junction Table (Associative Entity), and why is it necessary?
**Spoken Answer:**  
"A junction table maps a Many-to-Many relationship between two tables into two One-to-Many relationships. Relational databases cannot directly implement M:N relationships without creating repeating groups or multi-valued columns. `BOOKED_SEAT` is our junction table connecting `BOOKING` and `SEAT`."

#### Q28. How did you map the 1:1 relationship between CUSTOMER and ACCOUNT?
**Spoken Answer:**  
"We placed `customer_id` as a foreign key inside the `ACCOUNT` table and applied a `UNIQUE` constraint (`uq_account_customer`). This guarantees that each customer can have at most one login account, enforcing strict 1:1 cardinality."

#### Q29. How is the 1:1 relationship between BOOKING and PAYMENT enforced?
**Spoken Answer:**  
"In the `PAYMENT` table, `booking_id` is defined with a `UNIQUE` constraint (`uq_payment_booking`) and references `BOOKING(booking_id)`. This ensures that each booking ticket can have exactly one financial settlement record."

#### Q30. Explain the cardinality between THEATER and SCREEN.
**Spoken Answer:**  
"It is a One-to-Many ($1:N$) relationship. One theater complex contains multiple screens ($1 \dots N$), but each screen belongs to exactly one physical theater complex ($1:1$). The foreign key `theater_id` resides in `SCREEN`."

#### Q31. Explain the cardinality between SCREEN and SHOWTIME.
**Spoken Answer:**  
"It is One-to-Many ($1:N$). An auditorium screen hosts many showtimes over time ($1 \dots N$), but each specific screening event occurs in exactly one auditorium ($1:1$). The foreign key `screen_id` resides in `SHOWTIME`."

#### Q32. Explain the cardinality between MOVIE and SHOWTIME.
**Spoken Answer:**  
"It is One-to-Many ($1:N$). One movie title can be scheduled across multiple showtimes in various screens and dates, but each scheduled showtime features exactly one movie. The foreign key `movie_id` resides in `SHOWTIME`."

#### Q33. What does Crow's Foot notation represent in your ER diagram?
**Spoken Answer:**  
"Crow's Foot notation visually denotes relationship cardinality. A single vertical line represents 'one', a circle represents 'zero' (optionality), and a three-pronged fork (crow's foot) represents 'many'. For example, the line from `SCREEN` to `SEAT` ends with a crow's foot, representing that one screen has many seats."

#### Q34. What is Referential Integrity?
**Spoken Answer:**  
"Referential integrity is a database rule ensuring that a foreign key value in one table must always match an existing primary key value in the referenced table, or be null. It prevents invalid pointers and orphan records."

#### Q35. What is an Orphan Record, and how does your database prevent them?
**Spoken Answer:**  
"An orphan record is a child row whose foreign key references a parent row that no longer exists (for example, a showtime referencing a deleted movie). CINEVERSE prevents orphans using `ON DELETE RESTRICT` on critical relationships like `SHOWTIME -> MOVIE` and `BOOKING -> CUSTOMER`."

---

## Section D: Normalization & Functional Dependencies

#### Q36. What is Normalization, and what is its primary objective?
**Spoken Answer:**  
"Normalization is a systematic technique for organizing relational database tables to minimize data redundancy and eliminate update, insertion, and deletion anomalies while preserving data dependencies and lossless joins."

#### Q37. What is First Normal Form (1NF)? Does CINEVERSE satisfy 1NF?
**Spoken Answer:**  
"A relation is in 1NF if every attribute contains only atomic (indivisible) values, each column has a unique name, and there are no repeating groups. CINEVERSE satisfies 1NF because seats are never stored as comma-separated strings inside `BOOKING`; each seat is stored as an individual row in `BOOKED_SEAT`."

#### Q38. What is a Functional Dependency? Give an example from your project.
**Spoken Answer:**  
"A functional dependency $X \rightarrow Y$ means that the value of attribute $X$ uniquely determines the value of attribute $Y$. In our `CUSTOMER` table, `customer_id` $\rightarrow$ `(customer_name, phone, email)`. Knowing the `customer_id` uniquely identifies the customer's name, phone, and email."

#### Q39. What is Second Normal Form (2NF)?
**Spoken Answer:**  
"A relation is in 2NF if it is in 1NF and no non-prime attribute is partially dependent on any candidate key. That is, every non-key attribute must depend on the *entire* primary key, not a subset."

#### Q40. Demonstrate how CINEVERSE satisfies 2NF using BOOKED_SEAT.
**Spoken Answer:**  
"`BOOKED_SEAT` has a composite primary key: `(booking_id, seat_id)`. Its non-key attribute is `ticket_price`. The `ticket_price` depends on *both* the booking instance and the specific physical seat tier. It does not depend solely on `booking_id` or `seat_id` alone. Therefore, there are no partial dependencies, satisfying 2NF."

#### Q41. Demonstrate how SNACK_ORDER_ITEM satisfies 2NF.
**Spoken Answer:**  
"`SNACK_ORDER_ITEM` has a composite primary key: `(snack_order_id, snack_id)`. Non-key attributes are `quantity` and `unit_price`. Both attributes describe the line item and depend on both the specific order and the specific snack. Hence, it is fully in 2NF."

#### Q42. What is Third Normal Form (3NF)?
**Spoken Answer:**  
"A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key via another non-prime attribute ($X \rightarrow Y$ and $Y \rightarrow Z$ where $Z$ is non-key)."

#### Q43. Demonstrate how CINEVERSE satisfies 3NF using the SCREEN and THEATER tables.
**Spoken Answer:**  
"In `SCREEN`, the attributes are `screen_id`, `screen_number`, `screen_name`, `screen_type`, `capacity`, and `theater_id`. Notice that theater details—such as `theater_name`, `city`, and `address`—are *not* stored in `SCREEN`. If they were, we would have `screen_id` $\rightarrow$ `theater_id` and `theater_id` $\rightarrow$ `city`, a transitive dependency. By isolating theater attributes in `THEATER`, we eliminate transitive dependencies and satisfy 3NF."

#### Q44. What is Boyce-Codd Normal Form (BCNF)?
**Spoken Answer:**  
"BCNF is a stricter version of 3NF. A relation is in BCNF if, for every non-trivial functional dependency $X \rightarrow Y$, the determinant $X$ is a superkey. All of our tables with single-column surrogate primary keys naturally satisfy BCNF."

#### Q45. What is an Insertion Anomaly? Give an example of how your design prevents it.
**Spoken Answer:**  
"An insertion anomaly occurs when certain attributes cannot be inserted without the presence of other unrelated attributes. For example, if movies and showtimes were merged into one table, you could not insert an upcoming movie into the catalog until a showtime was scheduled. Our design separates `MOVIE` from `SHOWTIME`, allowing us to add movies with zero scheduled showtimes."

#### Q46. What is a Deletion Anomaly?
**Spoken Answer:**  
"A deletion anomaly occurs when deleting one piece of data unintentionally removes unrelated data. If theaters and screens were combined, deleting the last screen in a venue would accidentally delete the entire theater's address and record. In CINEVERSE, deleting a screen preserves the `THEATER` record."

#### Q47. What is an Update Anomaly?
**Spoken Answer:**  
"An update anomaly occurs when data redundancy forces the same value to be updated in multiple rows, risking data inconsistency. If theater addresses were duplicated across every showtime row, changing an address would require updating thousands of records. In 3NF, the address exists in exactly one row in `THEATER`."

#### Q48. Is there any intentional Denormalization in CINEVERSE?
**Spoken Answer:**  
"Yes, in `BOOKED_SEAT.ticket_price`. While the base price originates in `SHOWTIME`, recording `ticket_price` in `BOOKED_SEAT` represents an immutable financial snapshot at the time of purchase. If ticket base prices change tomorrow, past booking revenues remain historically accurate."

#### Q49. What is a Lossless Join Decomposition?
**Spoken Answer:**  
"A decomposition of relation $R$ into $R_1$ and $R_2$ is lossless if joining $R_1$ and $R_2$ on their common attribute yields the exact original relation $R$ without generating spurious tuples. In our schema, $R_1 \cap R_2$ always forms a superkey for at least one relation, guaranteeing lossless joins."

#### Q50. What is Dependency Preservation?
**Spoken Answer:**  
"Dependency preservation means that all functional dependencies of the original relation can be enforced simply by checking the constraints on the individual decomposed tables, without needing to perform a join. Our schema preserves all dependencies."

---

## Section E: SQL, MySQL Engine & Relational Theory

#### Q51. What are the five major categories of SQL commands?
**Spoken Answer:**  
"1. **DDL (Data Definition Language):** `CREATE`, `ALTER`, `DROP`, `RENAME`, `TRUNCATE`.
2. **DML (Data Manipulation Language):** `INSERT`, `UPDATE`, `DELETE`.
3. **DQL (Data Query Language):** `SELECT`.
4. **DCL (Data Control Language):** `GRANT`, `REVOKE`.
5. **TCL (Transaction Control Language):** `COMMIT`, `ROLLBACK`, `SAVEPOINT`."

#### Q52. What is the difference between TRUNCATE and DELETE?
**Spoken Answer:**  
"`DELETE` is a DML command that removes rows one by one, logs individual row deletions in the transaction log, fires delete triggers, and can be rolled back. `TRUNCATE` is a DDL command that deallocates the table's data pages, resets auto-increment counters, is faster, and cannot be rolled back in some configurations."

#### Q53. What is an INNER JOIN versus a LEFT OUTER JOIN?
**Spoken Answer:**  
"An `INNER JOIN` returns only rows that have matching values in both tables. A `LEFT JOIN` returns all rows from the left table, and the matched rows from the right table; if no match exists, NULL values are returned for the right table's columns. In CINEVERSE, we use `LEFT JOIN BOOKING` when querying all customers so that customers with zero bookings are still included."

#### Q54. What are Aggregate Functions in SQL? Name the five core functions.
**Spoken Answer:**  
"Aggregate functions perform a calculation on a set of rows and return a single summary value. The five core functions are:
`COUNT()`, `SUM()`, `AVG()`, `MIN()`, and `MAX()`. In `reportController.js`, we use `SUM(total_amount)` to compute gross theater revenue."

#### Q55. What is the difference between WHERE and HAVING clauses?
**Spoken Answer:**  
"`WHERE` filters individual rows *before* any grouping or aggregation takes place. `HAVING` filters aggregated groups *after* the `GROUP BY` clause has been evaluated. For example, `WHERE booking_status = 'CONFIRMED' GROUP BY movie_id HAVING COUNT(*) > 5`."

#### Q56. What are the ACID properties in database transactions?
**Spoken Answer:**  
"- **Atomicity:** All statements in the transaction succeed, or the entire transaction is rolled back ('all or nothing').
- **Consistency:** The database transitions from one valid state to another, satisfying all schema constraints.
- **Isolation:** Concurrent transactions execute without interfering with one another.
- **Durability:** Once committed, changes are permanently written to non-volatile storage and survive power failures."

#### Q57. How are ACID properties maintained during CINEVERSE ticket booking?
**Spoken Answer:**  
"In `createBooking`, we execute `await conn.beginTransaction()`. If seat validation, customer check, seat insertion, payment simulation, or snack deduction fails, `await conn.rollback()` is triggered. Changes are only made permanent when `await conn.commit()` executes."

#### Q58. What is a Clustered Index versus a Secondary (Non-Clustered) Index in MySQL InnoDB?
**Spoken Answer:**  
"In InnoDB, the primary key forms the **Clustered Index**, meaning table rows are physically stored on disk in the B+ Tree order of the primary key. A **Secondary Index** stores the index column and points to the clustered index primary key. When querying by secondary index, InnoDB looks up the secondary index first, then traverses the clustered index (index lookup)."

#### Q59. What secondary indexes exist in your CINEVERSE database?
**Spoken Answer:**  
"Our foreign keys and search columns have secondary B-Tree indexes:
- `idx_showtime_date` on `SHOWTIME(show_date)`
- `idx_showtime_movie` on `SHOWTIME(movie_id)`
- `idx_showtime_screen` on `SHOWTIME(screen_id)`
- `idx_booking_customer` on `BOOKING(customer_id)`
- `idx_booking_showtime` on `BOOKING(show_id)`
- `idx_booking_status` on `BOOKING(booking_status)`"

#### Q60. What is a Subquery? What is the difference between a Correlated and Non-Correlated subquery?
**Spoken Answer:**  
"A subquery is a `SELECT` query nested inside another query. A **non-correlated subquery** executes once independently, and its result is used by the outer query. A **correlated subquery** references columns from the outer query and must be evaluated repeatedly for each row processed by the outer query."

#### Q61. What does the COALESCE() function do?
**Spoken Answer:**  
"`COALESCE()` accepts a list of arguments and returns the first non-NULL value. In our revenue reporting queries, we write `COALESCE(SUM(b.total_amount), 0.00)` so that if a movie has zero confirmed bookings, the query returns `0.00` instead of `NULL`."

#### Q62. Does your live database have any Triggers, Views, or Stored Procedures?
**Spoken Answer:**  
"No, live schema introspection confirms `TRIGGERS: []`, `PROCEDURES: []`, and `VIEWS: []`. In CINEVERSE, business validations and multi-statement workflows are implemented in the Express backend controllers (`bookingController.js`, `showtimeController.js`) for better code versioning, unit testing, and horizontal scalability."

#### Q63. If asked to write a trigger, how would you write a trigger to update snack stock after an order?
**Spoken Answer:**  
"```sql
CREATE TRIGGER trg_after_snack_item_insert
AFTER INSERT ON SNACK_ORDER_ITEM
FOR EACH ROW
BEGIN
    UPDATE SNACK 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE snack_id = NEW.snack_id;
END;
```"

#### Q64. If asked to write a Stored Procedure, how would you write one to get a movie's revenue?
**Spoken Answer:**  
"```sql
CREATE PROCEDURE sp_get_movie_revenue(IN p_movie_id INT, OUT p_revenue DECIMAL(10,2))
BEGIN
    SELECT COALESCE(SUM(b.total_amount), 0.00) INTO p_revenue
    FROM BOOKING b
    JOIN SHOWTIME s ON b.show_id = s.show_id
    WHERE s.movie_id = p_movie_id AND b.booking_status = 'CONFIRMED';
END;
```"

#### Q65. What is the SQL CHECK constraint? Give two examples from CINEVERSE.
**Spoken Answer:**  
"A `CHECK` constraint specifies a boolean condition that every row in the table must satisfy. In CINEVERSE:
1. `chk_movie_rating`: `CHECK (rating >= 0.0 AND rating <= 10.0)` prevents invalid IMDb scores.
2. `chk_booking_status`: `CHECK (booking_status IN ('CONFIRMED', 'CANCELLED', 'PENDING'))` prevents invalid lifecycle states."

---

## Section F: Code Walkthrough & Database Implementation

#### Q66. Where is the database connection configured in the backend?
**Spoken Answer:**  
"In `backend/src/config/db.js`. It exports `pool`, `query(sql, params)`, `getConnection()`, and `checkDbConnection()`. The pool uses `mysql2/promise` with configuration pulled from `process.env`."

#### Q67. How are SQL injection attacks prevented in your backend?
**Spoken Answer:**  
"We strictly execute parameterized queries using the `?` placeholder syntax in `pool.execute(sql, params)`. The `mysql2` driver prepares the statement on the database server using MySQL's binary protocol, separating the SQL syntax tree from the data inputs. Malicious strings like `' OR '1'='1` are treated purely as literal strings, completely neutralizing SQL injection."

#### Q68. What function handles showtime conflict prevention, and in which file?
**Spoken Answer:**  
"Function `adminCreateShowtime` in `backend/src/controllers/showtimeController.js` (lines 176–260). It queries for overlapping screenings on the same screen using interval overlap logic."

#### Q69. What mathematical condition detects an auditorium scheduling conflict?
**Spoken Answer:**  
"Two time intervals $[A_{start}, A_{end}]$ and $[B_{start}, B_{end}]$ overlap if and only if:
$A_{start} < B_{end} \land A_{end} > B_{start}$.
In SQL, we write:
`WHERE s.screen_id = ? AND s.show_date = ? AND (s.start_time < ? AND s.end_time > ?)` where the parameters are the calculated end time and requested start time."

#### Q70. How does the backend calculate a screening's end time?
**Spoken Answer:**  
"In `showtimeController.js`, helper function `computeEndTime` takes `start_time`, `movie.duration` (in minutes), and adds a mandatory 15-minute turnaround buffer (`turnaroundMins = 15`) to allow auditorium cleaning between audiences."

#### Q71. How does the backend calculate dynamic seat pricing?
**Spoken Answer:**  
"In `bookingController.js` (lines 234–244), the server fetches `base_price` from `SHOWTIME`. It then iterates through the verified seats:
- `Standard` seat: `base_price`
- `Premium` seat: `Math.round(base_price * 1.2)` (+20%)
- `VIP` / `Recliner`: `Math.round(base_price * 1.4)` (+40%).
Pricing is strictly calculated server-side; client-submitted totals are ignored."

#### Q72. Where are administrative dashboard metrics calculated?
**Spoken Answer:**  
"In `backend/src/controllers/adminController.js` under `getAdminDashboard`. It executes aggregate count queries on `MOVIE`, `SHOWTIME`, `BOOKING`, and `CUSTOMER`."

#### Q73. How does password hashing work for admin staff and customer accounts?
**Spoken Answer:**  
"We use `bcryptjs`. When creating accounts, plain passwords are salted with a work factor of 10 (`bcrypt.hash(password, 10)`). During login, `bcrypt.compare(password, staff.password_hash)` verifies the hash without ever storing or logging plain-text passwords."

#### Q74. How does the system handle booking cancellation?
**Spoken Answer:**  
"In `bookingController.js` under `cancelBooking`, it executes an atomic transaction with a row lock: `SELECT booking_id FROM BOOKING WHERE booking_id = ? FOR UPDATE`. It updates `BOOKING.booking_status = 'CANCELLED'` and `PAYMENT.payment_status = 'REFUNDED'`. This immediately frees the seats for other customers while maintaining the transaction log."

#### Q75. How are database errors handled across the API?
**Spoken Answer:**  
"All async controller functions wrap their logic in `try ... catch` blocks and forward caught errors to `next(err)`. In `server.js`, an Express centralized error-handling middleware catches `err`, checks MySQL error codes (such as `ER_DUP_ENTRY` for duplicate emails or `ER_ROW_IS_REFERENCED_2` for foreign key violations), and returns clean, structured JSON error messages."

---

## Section G: Movie, Theatre & Showtime Management

#### Q76. How does the system prevent an auditorium from being double-booked for two movies at the same time?
**Spoken Answer:**  
"When an admin attempts to schedule a screening, `adminCreateShowtime` checks the database for any existing showtime on that screen and date where $(s_{start} < end_{calc} \land s_{end} > start_{form})$. If a conflict is found, the server rejects the request with HTTP 409 Conflict and names the conflicting movie and time slot."

#### Q77. Can a movie exist in the database without any showtimes?
**Spoken Answer:**  
"Yes. In our relational schema, `SHOWTIME` holds the foreign key `movie_id` referencing `MOVIE`. `MOVIE` does not hold a foreign key to `SHOWTIME`. Thus, movies can be inserted into the catalog months ahead of release."

#### Q78. Can a showtime exist without a movie or screen?
**Spoken Answer:**  
"No. In `SHOWTIME`, both `movie_id` and `screen_id` are defined as `INT NOT NULL` foreign keys. The MySQL engine will reject any showtime insertion where either identifier is null or references a non-existent row."

#### Q79. What happens if an admin tries to delete a movie that already has scheduled showtimes?
**Spoken Answer:**  
"The operation is rejected. First, the backend controller checks `SELECT show_id FROM SHOWTIME WHERE movie_id = ?` and returns HTTP 409. Second, at the database level, `fk_showtime_movie` enforces `ON DELETE RESTRICT`, throwing MySQL Error 1451."

#### Q80. How is auditorium screen seating configured?
**Spoken Answer:**  
"Screens have capacity ranging from 112 to 160 seats. Physical rows are assigned letters (A through K), and numbers (1 to 16). Rows A–D are `Standard`, E–H are `Premium`, and I–K are `VIP`/`Recliner`. The unique constraint `uq_screen_seat (screen_id, seat_number)` prevents duplicate seat labels in the same auditorium."

#### Q81. How does the customer website discover which movies are playing in a specific city?
**Spoken Answer:**  
"The customer frontend queries `GET /api/theaters`. When the user selects a city (e.g., 'Bengaluru'), the UI filters showtimes by joining `THEATER` on `city = 'Bengaluru'`, displaying only screenings occurring in multiplexes within that metropolitan area."

#### Q82. What is the difference between screen capacity and seat count?
**Spoken Answer:**  
"`capacity` is an integer column on `SCREEN` indicating total permitted audience. `SEAT` contains the individual physical rows for that screen. In our database, the count of rows in `SEAT WHERE screen_id = X` exactly equals `SCREEN.capacity`."

#### Q83. What is movie release status, and how is it derived?
**Spoken Answer:**  
"A movie is 'Now Showing' if it has at least one active, scheduled showtime in the database. It is 'Coming Soon' if its release date is in the future and it has zero current showtimes. Release status is dynamically derived from relational showtime counts."

#### Q84. Why does the `MOVIE` table store `duration` as an integer?
**Spoken Answer:**  
"It stores duration in total minutes (e.g., 180 for Oppenheimer). Storing duration as an integer allows simple arithmetic addition with start times and turnaround buffers to compute precise screening end times."

#### Q85. How do you prevent deleting a theater that has active staff assigned?
**Spoken Answer:**  
"The foreign key constraint `fk_admin_theater` on `ADMIN_STAFF(theater_id)` is configured with `ON DELETE RESTRICT`. MySQL prevents deleting the theater record until all assigned staff members are reassigned or removed."

---

## Section H: Seat Selection, Booking Logic & Concurrency

#### Q86. How are physical seats mapped to a booking in the database?
**Spoken Answer:**  
"Via the associative junction table `BOOKED_SEAT`. For every seat selected in a booking, a row is inserted with `(booking_id, seat_id, ticket_price)`. The composite primary key `(booking_id, seat_id)` prevents the same seat from being inserted twice within the same booking."

#### Q87. How does the system calculate how many seats are available for a showtime?
**Spoken Answer:**  
"In `getShowtimeSeats`, the query counts all physical seats for the screen:
`SELECT COUNT(*) FROM SEAT WHERE screen_id = ?`.
It then queries:
`SELECT bs.seat_id FROM BOOKED_SEAT bs JOIN BOOKING b ON bs.booking_id = b.booking_id WHERE b.show_id = ? AND b.booking_status != 'CANCELLED'`.
Available seats = Total Seats $-$ Booked Seats."

#### Q88. How does the backend prevent a user from booking a seat that belongs to a different screen?
**Spoken Answer:**  
"In Step 4 of `createBooking`, the server queries the `SEAT` table for all requested `seat_ids` and verifies that every returned seat's `screen_id` matches the showtime's assigned `screen_id`. If a mismatch is detected, the transaction aborts with HTTP 400."

#### Q89. How does the system prevent two users from booking the same seat for the same showtime?
**Spoken Answer:**  
"In Step 5 of `createBooking`, within an active transaction, the server queries `BOOKED_SEAT` joined with `BOOKING` for the target `show_id` and selected `seat_ids` where `booking_status != 'CANCELLED'`. If any seats are returned, the transaction rolls back with HTTP 409 Conflict ('Seats already booked')."

#### Q90. What is a race condition in seat reservation? Does your current implementation completely prevent it?
**Spoken Answer (Honest & Defensible):**  
"A race condition occurs when two concurrent requests read seat availability simultaneously before either writes. In our current implementation, the seat conflict query uses standard `SELECT` without `FOR UPDATE`. Under high concurrent load, two requests could theoretically read the seats as available at the exact same millisecond. To make it 100% race-condition proof, we should add `SELECT ... FOR UPDATE` on the seat rows or enforce a unique constraint on `(show_id, seat_id)`."

#### Q91. What is the purpose of the `FOR UPDATE` clause in SQL?
**Spoken Answer:**  
"`SELECT ... FOR UPDATE` acquires an exclusive row-level lock on the read rows within an InnoDB transaction. Any other concurrent transaction attempting to read or update those locked rows is blocked until the first transaction commits or rolls back. In CINEVERSE, we use `FOR UPDATE` on `SNACK` inventory and `BOOKING` cancellation."

#### Q92. What are the four ANSI SQL Transaction Isolation Levels?
**Spoken Answer:**  
"1. **Read Uncommitted:** Permitted dirty reads.
2. **Read Committed:** Prevents dirty reads; non-repeatable reads possible.
3. **Repeatable Read:** (MySQL InnoDB default) Prevents dirty and non-repeatable reads; phantom reads mitigated by Next-Key Locking.
4. **Serializable:** Highest isolation; fully serializes access using range locks."

#### Q93. What is a Dirty Read, Non-Repeatable Read, and Phantom Read?
**Spoken Answer:**  
"- **Dirty Read:** A transaction reads uncommitted changes made by another transaction that might later be rolled back.
- **Non-Repeatable Read:** A transaction reads the same row twice and observes different data because another transaction committed an update in between.
- **Phantom Read:** A transaction re-executes a query returning a range of rows and finds new 'phantom' rows inserted and committed by another transaction."

#### Q94. Why don't you delete rows from `BOOKED_SEAT` when a booking is cancelled?
**Spoken Answer:**  
"Because `BOOKING.booking_status` is updated to `'CANCELLED'`. Our seat availability queries filter `WHERE b.booking_status != 'CANCELLED'`. By leaving the rows in `BOOKED_SEAT`, the seats are immediately released for new bookings while preserving complete historical audit trails of who originally reserved the seats."

#### Q95. How does the frontend seat map visually distinguish seat categories?
**Spoken Answer:**  
"The customer frontend seat picker fetches seat objects with `seat_type`. The UI assigns distinct visual color schemes: Silver for Standard, Gold for Premium, and Purple/Rose for VIP Recliners, displaying corresponding price badges."

---

## Section I: Payments & Concession Orders

#### Q96. How is concession (snack) ordering integrated with ticket booking?
**Spoken Answer:**  
"Snack orders are tied directly to the ticket reservation via `SNACK_ORDER(booking_id)`. The grand total of the booking combines the ticket total and snack total. Concession line items are stored in `SNACK_ORDER_ITEM`."

#### Q97. How does CINEVERSE prevent selling snacks that are out of stock?
**Spoken Answer:**  
"In Step 7 of `createBooking`, for every snack ordered, the server executes:
`SELECT stock_quantity FROM SNACK WHERE snack_id = ? FOR UPDATE`.
If `stock_quantity < requested_quantity`, the transaction rolls back immediately with HTTP 400 ('Insufficient stock'). If sufficient, it decrements inventory:
`UPDATE SNACK SET stock_quantity = stock_quantity - ? WHERE snack_id = ?`."

#### Q98. Is the payment gateway live or simulated?
**Spoken Answer:**  
"It is an internal transactional simulation. The `PAYMENT` table records the transaction amount, method (`UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Cash`), timestamp, and status (`COMPLETED`). The relational integrity and financial reconciliation are fully modeled, but without external bank API webhooks."

#### Q99. What happens to the payment record if a booking is cancelled?
**Spoken Answer:**  
"In `cancelBooking`, the payment record's status is updated:
`UPDATE PAYMENT SET payment_status = 'REFUNDED' WHERE booking_id = ?`.
This preserves financial accountability for auditing purposes."

#### Q100. How does the schema guarantee that one booking cannot have two conflicting payments?
**Spoken Answer:**  
"The `PAYMENT` table defines a unique constraint `uq_payment_booking UNIQUE (booking_id)`. Any attempt to insert a duplicate payment receipt for the same booking ID is rejected by the database engine."

#### Q101. What payment methods are supported by database constraints?
**Spoken Answer:**  
"The check constraint `chk_payment_method` restricts values to:
`'UPI'`, `'Credit Card'`, `'Debit Card'`, `'Net Banking'`, or `'Cash'`. Inserting any other string throws a check constraint violation."

#### Q102. How do you calculate total concession revenue versus ticket revenue?
**Spoken Answer:**  
"In `reportController.js`:
- Ticket Revenue: `SELECT SUM(total_amount) FROM BOOKING WHERE booking_status = 'CONFIRMED'`.
- Concession Revenue: `SELECT SUM(total_price) FROM SNACK_ORDER WHERE order_status = 'COMPLETED'`."

---

## Section K: Testing, Debugging & Edge Cases

#### Q103. How was the CINEVERSE application tested?
**Spoken Answer:**  
"We tested the application through 37 automated integration tests in `scratch/comprehensive_test.js` covering database release statuses, scheduling collision detection, admin trailer CRUD, and multi-seat transaction rollback. We also verified frontend production builds with zero compiler errors."

#### Q104. What happens if the MySQL database server crashes or loses connection?
**Spoken Answer:**  
"In `backend/src/config/db.js`, `checkDbConnection` detects connection failures, captures the error code (`ECONNREFUSED`), and logs a structured diagnostic message. The API endpoints return HTTP 500 with a clean error message rather than crashing the Node.js process."

#### Q105. What happens if a user submits a negative ticket price or negative snack quantity?
**Spoken Answer:**  
"The operation is rejected at two levels: First, controller input validation checks `if (price <= 0) return res.status(400)`. Second, MySQL schema constraints `chk_showtime_base_price (base_price >= 0.00)` and `chk_snack_item_qty (quantity > 0)` enforce non-negative values at the engine level."

#### Q106. What happens if a customer attempts to book zero seats?
**Spoken Answer:**  
"In `bookingController.js` line 142, the server validates:
`if (!seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0)`.
It immediately rejects the request with HTTP 400 Bad Request before opening a database transaction."

#### Q107. How did you debug SQL syntax and execution errors during development?
**Spoken Answer:**  
"We monitored Node.js server console logs and MySQL query logs. We isolated queries and tested them directly in the MySQL command line client using `EXPLAIN` to inspect query execution plans, verify index usage, and measure execution times."

#### Q108. What is the output of `EXPLAIN SELECT ...` in MySQL?
**Spoken Answer:**  
"`EXPLAIN` displays the query execution plan chosen by MySQL's query optimizer. Key columns include:
- `type`: Join type (`ALL` full table scan, `ref` index lookup, `eq_ref` unique index lookup).
- `possible_keys`: Indexes MySQL could use.
- `key`: The actual index chosen.
- `rows`: Estimated number of rows MySQL must examine."

#### Q109. What happens if an admin schedules a showtime with end time before start time?
**Spoken Answer:**  
"The scheduling collision engine computes `end_time = computeEndTime(start_time, duration, 15)`. Since duration is constrained by `chk_movie_duration (duration > 0)`, the calculated end time is strictly guaranteed to be after the start time."

#### Q110. How did you verify referential integrity under cascading deletes?
**Spoken Answer:**  
"In a test environment, deleting a test `SCREEN` automatically cascade-deleted all associated `SEAT` rows (`ON DELETE CASCADE`), while attempting to delete a `MOVIE` with active showtimes was blocked (`ON DELETE RESTRICT`)."

---

## Section L: Security, Reliability & Performance

#### Q111. How does CINEVERSE prevent Cross-Site Scripting (XSS)?
**Spoken Answer:**  
"React automatically escapes all variables rendered inside JSX expressions `{movie.title}`, treating input as plain strings rather than executable HTML. Additionally, backend inputs are validated and sanitized."

#### Q112. How does the system handle Admin Authentication?
**Spoken Answer:**  
"In `adminController.js`, when staff log in with email and password, the server verifies the bcrypt salted password hash. Upon success, it issues a signed JSON Web Token (JWT) containing `staff_id`, `email`, and `role`, valid for 8 hours."

#### Q113. How does the backend authorize protected administrative routes?
**Spoken Answer:**  
"Using JWT verification middleware in `backend/src/middleware/auth.js`. Protected routes inspect the `Authorization: Bearer <token>` header. If the token is missing, expired, or tampered with, the request is rejected with HTTP 401 Unauthorized."

#### Q114. How would you optimize query performance if your database grew to 10 million bookings?
**Spoken Answer:**  
"1. **Partitioning:** Partition the `BOOKING` and `BOOKED_SEAT` tables by range on `booking_date` (e.g., yearly/monthly partitions).
2. **Composite Indexing:** Add composite indexes on `(show_id, booking_status)`.
3. **Archiving:** Move completed bookings older than 2 years into a cold historical archive table.
4. **Caching:** Cache movie catalog and theater venue data in Redis."

#### Q115. Why is connection pooling crucial for backend reliability?
**Spoken Answer:**  
"Creating a new database connection for every HTTP request incurs heavy TCP handshake and authentication overhead, exhausting database ports under traffic spikes. A connection pool reuses active connections, capping database load and preventing out-of-memory crashes."

#### Q116. What sensitive customer data is stored, and how is it protected?
**Spoken Answer:**  
"We store customer name, phone, email, and password hash. Password hashes use salted bcrypt (`$2a$10$...`), rendering them resistant to rainbow table and brute-force attacks. No raw credit card or CVV numbers are ever stored."

#### Q117. What is Database Connection Starvation, and how do you prevent it?
**Spoken Answer:**  
"Connection starvation occurs when long-running queries or unreleased connections exhaust the pool, causing incoming requests to hang indefinitely. We prevent this by strictly using `try ... finally { conn.release(); }` to guarantee that connections return to the pool immediately upon request completion."

#### Q118. What is Deadlock in MySQL, and how does InnoDB handle it?
**Spoken Answer:**  
"A deadlock occurs when two transactions hold locks that the other needs, creating a circular wait where neither can proceed. InnoDB automatically detects deadlocks using a wait-for graph, immediately aborts the transaction with fewer row locks (the lower-cost transaction), and rolls it back, allowing the other to complete."

---

## Section M: Critical & Difficult Examiner Questions

#### Q119. Why did you choose MySQL instead of PostgreSQL?
**Spoken Answer:**  
"MySQL 8.0 with InnoDB provides enterprise ACID compliance, native B-Tree indexing, robust foreign key constraint enforcement, and straightforward replication. While PostgreSQL offers advanced object-relational features, MySQL is the industry standard for high-throughput commercial web backends and perfectly fits our relational ticketing model."

#### Q120. If an examiner claims: "Your seat booking logic is flawed because two users can book the same seat simultaneously," how do you respond?
**Spoken Answer (Defensible & Masterful):**  
"You are highlighting an essential concurrency consideration. In our current implementation, we execute an application-level conflict check inside a multi-statement transaction, which handles typical sequential traffic. However, because our conflict query does not use `SELECT ... FOR UPDATE`, under extreme millisecond concurrency, two transactions could experience a race condition under MySQL's default `REPEATABLE READ` isolation. To solve this completely, we can add `FOR UPDATE` to lock the seat rows during validation or add an engine-level unique key constraint on `(show_id, seat_id)`."

#### Q121. What happens if payment succeeds but booking creation fails?
**Spoken Answer:**  
"In our architecture, payment recording and booking creation occur within the *exact same* ACID transaction. If booking creation fails, the transaction rolls back before payment is committed. In a commercial deployment with an external payment gateway, we would implement a Two-Phase Commit or Webhook Reconciliation worker: if a payment succeeds but the booking fails, the system automatically triggers an immediate gateway refund."

#### Q122. Why did you use surrogate integer keys (`movie_id`, `show_id`) instead of natural keys (`title`, `start_time`)?
**Spoken Answer:**  
"Natural keys like movie titles or timestamps are wide strings that consume significant index page space, degrade B-Tree performance, and can change in the real world (e.g., a movie title correction). Surrogate integer keys are compact (4 bytes), immutable, highly performant for B-Tree index traversal, and simplify multi-table joins."

#### Q123. Can your database schema support ticket price discounts or promo coupons?
**Spoken Answer:**  
"Yes. We can introduce a `DISCOUNT_COUPON` table with `(coupon_id, coupon_code, discount_pct, expiry_date)` and add an optional nullable foreign key `coupon_id` to `BOOKING`. The total amount in `BOOKING` would reflect the net price after coupon deduction."

#### Q124. How would your schema handle seat reservation for users with disabilities (wheelchair access)?
**Spoken Answer:**  
"The `SEAT` table already includes a `seat_type` column constrained by `chk_seat_type`. We can simply extend the allowed set in `chk_seat_type` to include `'Accessible'` or `'Wheelchair'` and flag these seats in the frontend with specialized icons and priority booking rules."

#### Q125. Why did you write raw SQL queries in your backend controllers instead of using an ORM like Prisma or Sequelize?
**Spoken Answer:**  
"Writing raw SQL queries via `mysql2/promise` was a deliberate academic choice. ORMs abstract away relational mechanics, often generating inefficient, bloated joins. Writing raw SQL allowed us to explicitly design and demonstrate multi-table joins, aggregations, parameterized queries, and ACID transaction boundaries as mandated by the RDBMS laboratory syllabus."

#### Q126. What would you change in the database design if you had one more week?
**Spoken Answer:**  
"Three specific enhancements:
1. Add an engine-level unique constraint on `(show_id, seat_id)` or an ephemeral 5-minute reservation lock table to make seat selection 100% race-condition proof.
2. Implement database Views for complex reporting queries like `vw_movie_revenue_summary`.
3. Add a loyalty point redemption transaction table to complete the customer rewards loop."

#### Q127. Which part of your project demonstrates the strongest RDBMS concepts?
**Spoken Answer:**  
"The `createBooking` transaction and the junction table design for `BOOKED_SEAT`. It integrates 1NF-to-3NF normalization, composite primary keys, composite unique keys, foreign key cascading and restriction, server-side dynamic price calculations, and multi-statement ACID transaction rollback across three related tables."

#### Q128. Why does `BOOKING` have a `show_id` foreign key if `BOOKED_SEAT` already links to `SEAT`?
**Spoken Answer:**  
"Because `SEAT` represents a physical chair in an auditorium, not a screening event. A physical seat exists across hundreds of showtimes. Without `show_id` on `BOOKING`, it would be impossible to know which specific movie screening the customer purchased tickets for."

#### Q129. How does CINEVERSE protect against data loss in the event of a sudden power outage?
**Spoken Answer:**  
"Through MySQL InnoDB's write-ahead logging (WAL) mechanism known as the **Redo Log** (`ib_logfile`). Before changes are flushed to the main data tablespace, transactions are written sequentially to the redo log. Upon restarting after a crash, InnoDB reads the redo log and automatically rolls forward committed transactions while rolling back uncommitted ones."

#### Q130. What is the difference between Database Authentication and Application Authorization?
**Spoken Answer:**  
"Database Authentication verifies the Node.js backend's credentials (`root` user and password) when establishing a connection pool to MySQL. Application Authorization verifies the human user's identity and privileges (e.g., verifying a JWT token to determine if an admin staff member is authorized to schedule showtimes)."

