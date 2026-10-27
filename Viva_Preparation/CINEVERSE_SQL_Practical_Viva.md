# CINEVERSE — Practical SQL Viva Voce Question Bank
**Hands-On SQL Query Tasks & Code Breakdown**  
**Course:** Relational Database Management Systems Laboratory (CSE Department)  
**Institution:** Manipal University Jaipur (MUJ)  
**Database:** MySQL 8.0 (`MovieTheaterDB`)  

---

## Guide for Practical SQL Viva
When an examiner asks you to write or explain an SQL query on paper or in MySQL Workbench:
1. **Name the Target Tables First:** Explain which tables contain the necessary attributes and how they join.
2. **State Join Conditions Explicitly:** Emphasize primary key to foreign key matches (`ON t1.id = t2.t1_id`).
3. **Clarify Aggregate Filters:** Distinguish between `WHERE` (row-level filter before grouping) and `HAVING` (group-level filter after aggregation).
4. **Explain Output:** Describe what each row of the result set represents in the cinema domain.

---

### Task 1: List All Movies with Ratings and Runtimes
* **Examiner Prompt:** *"Write a query to retrieve all movies, showing their title, genre, runtime in minutes, and rating, ordered from highest rated to lowest rated."*
* **SQL Query:**
  ```sql
  SELECT 
      movie_id,
      title,
      genre,
      duration AS duration_mins,
      rating
  FROM MOVIE
  ORDER BY rating DESC, title ASC;
  ```
* **Line-by-Line Explanation:**
  - `SELECT movie_id, title, ...`: Selects the relevant movie identification and descriptive attributes.
  - `FROM MOVIE`: Queries the base strong entity table storing the cinematic catalog.
  - `ORDER BY rating DESC, title ASC`: Sorts the catalog primarily by audience rating descending (highest rated first), using alphabetical title ascending as a tiebreaker.
* **Expected Result:**
  Returns 13 rows displaying titles like *The Dark Knight* (9.0), *Inception* (8.8), and *Interstellar* (8.7).
* **Relational Concept:** Basic DQL projection, attribute aliasing, and multi-column sorting.

---

### Task 2: Count Screens and Total Auditorium Capacity Per Multiplex Theater
* **Examiner Prompt:** *"Write a query to list each theater's name, city, total number of screens, and total seating capacity across all its screens."*
* **SQL Query:**
  ```sql
  SELECT 
      t.theater_id,
      t.theater_name,
      t.city,
      COUNT(s.screen_id) AS total_screens,
      COALESCE(SUM(s.capacity), 0) AS total_theater_capacity
  FROM THEATER t
  LEFT JOIN SCREEN s ON t.theater_id = s.theater_id
  GROUP BY t.theater_id, t.theater_name, t.city
  ORDER BY total_theater_capacity DESC;
  ```
* **Line-by-Line Explanation:**
  - `SELECT t.theater_id, ...`: Selects the theater identifier, name, and city.
  - `COUNT(s.screen_id)`: Aggregates the total number of physical screens belonging to that theater.
  - `COALESCE(SUM(s.capacity), 0)`: Sums the capacity column across all associated screens, defaulting to 0 if a theater has no screens.
  - `FROM THEATER t LEFT JOIN SCREEN s ON t.theater_id = s.theater_id`: Performs a Left Outer Join so theaters with zero screens are not excluded.
  - `GROUP BY t.theater_id, t.theater_name, t.city`: Groups by all non-aggregated select columns to comply with SQL standard grouping rules.
* **Expected Result:**
  Returns 8 rows (one per multiplex). Each theater in Bengaluru, Mumbai, Delhi, Hyderabad, and Chennai shows 4 screens with total capacities around 500–600 seats.
* **Relational Concept:** One-to-Many join, aggregate summation, `GROUP BY`, and `COALESCE` null-handling.

---

### Task 3: Find All Available Seats for a Specific Showtime
* **Examiner Prompt:** *"Given a showtime ID (e.g., `show_id = 1`), write a query to list all physical seats that are currently available to be booked."*
* **SQL Query:**
  ```sql
  SELECT 
      st.seat_id,
      st.seat_number,
      st.seat_type
  FROM SHOWTIME sh
  JOIN SEAT st ON sh.screen_id = st.screen_id
  WHERE sh.show_id = 1
    AND st.seat_id NOT IN (
        SELECT bs.seat_id
        FROM BOOKED_SEAT bs
        JOIN BOOKING b ON bs.booking_id = b.booking_id
        WHERE b.show_id = 1 
          AND b.booking_status != 'CANCELLED'
    )
  ORDER BY 
      SUBSTRING(st.seat_number, 1, 1) ASC,
      CAST(SUBSTRING(st.seat_number, 2) AS UNSIGNED) ASC;
  ```
* **Line-by-Line Explanation:**
  - `SELECT st.seat_id, ...`: Projects the seat identifier, row/number label, and tier.
  - `FROM SHOWTIME sh JOIN SEAT st ON sh.screen_id = st.screen_id`: Joins the showtime to its scheduled auditorium screen to retrieve all physical seats belonging to that auditorium.
  - `WHERE sh.show_id = 1`: Focuses on the target screening.
  - `AND st.seat_id NOT IN (...)`: Subquery filtering out seats that already have an active, non-cancelled reservation for that specific showtime.
  - `ORDER BY SUBSTRING(...)`: Natural sort ordering letters (A to K) and numbers (1 to 16).
* **Expected Result:**
  Returns all unreserved seats in that auditorium. If the screen has 142 seats and 4 are booked, exactly 138 rows are returned.
* **Relational Concept:** Set difference using subquery with `NOT IN`, correlated screening logic, and string sorting.

---

### Task 4: Total Revenue Generated by Each Movie
* **Examiner Prompt:** *"Write a query to calculate total ticket revenue generated by each movie from confirmed bookings, ordered by revenue descending."*
* **SQL Query:**
  ```sql
  SELECT 
      m.movie_id,
      m.title,
      m.genre,
      COUNT(DISTINCT b.booking_id) AS confirmed_bookings_count,
      COUNT(bs.seat_id) AS total_tickets_sold,
      COALESCE(SUM(b.total_amount), 0.00) AS gross_ticket_revenue
  FROM MOVIE m
  JOIN SHOWTIME s ON m.movie_id = s.movie_id
  LEFT JOIN BOOKING b ON s.show_id = b.show_id AND b.booking_status = 'CONFIRMED'
  LEFT JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
  GROUP BY m.movie_id, m.title, m.genre
  ORDER BY gross_ticket_revenue DESC;
  ```
* **Line-by-Line Explanation:**
  - `SELECT m.movie_id, ...`: Projects movie details.
  - `COUNT(DISTINCT b.booking_id)`: Counts unique reservation orders to avoid counting duplicate bookings across multiple seats.
  - `COUNT(bs.seat_id)`: Counts individual tickets sold.
  - `COALESCE(SUM(b.total_amount), 0.00)`: Calculates total revenue, ensuring movies with zero bookings display 0.00 rather than NULL.
  - `LEFT JOIN BOOKING b ... AND b.booking_status = 'CONFIRMED'`: Only tallies valid confirmed revenue, excluding cancelled orders.
  - `GROUP BY m.movie_id, m.title, m.genre`: Standard grouping by primary key and attributes.
* **Expected Result:**
  Returns a list of movies ranked by gross ticket sales, led by popular blockbusters.
* **Relational Concept:** Multi-table join across 4 tables, distinct counting, conditional join filtering, and aggregate summation.

---

### Task 5: Customer Booking History and Invoice Summary
* **Examiner Prompt:** *"Write a query to fetch complete booking history for a specific customer (e.g., `customer_id = 1`), including movie title, show date, theater, screen number, payment method, and comma-separated seat numbers."*
* **SQL Query:**
  ```sql
  SELECT 
      b.booking_id,
      b.booking_date,
      m.title AS movie_title,
      t.theater_name,
      t.city,
      sc.screen_number,
      s.show_date,
      s.start_time,
      b.total_amount,
      b.booking_status,
      p.payment_method,
      p.payment_status,
      GROUP_CONCAT(st.seat_number ORDER BY st.seat_number SEPARATOR ', ') AS reserved_seats
  FROM BOOKING b
  JOIN SHOWTIME s ON b.show_id = s.show_id
  JOIN MOVIE m ON s.movie_id = m.movie_id
  JOIN SCREEN sc ON s.screen_id = sc.screen_id
  JOIN THEATER t ON sc.theater_id = t.theater_id
  LEFT JOIN PAYMENT p ON b.booking_id = p.booking_id
  LEFT JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
  LEFT JOIN SEAT st ON bs.seat_id = st.seat_id
  WHERE b.customer_id = 1
  GROUP BY b.booking_id, b.booking_date, m.title, t.theater_name, t.city, sc.screen_number, s.show_date, s.start_time, b.total_amount, b.booking_status, p.payment_method, p.payment_status
  ORDER BY b.booking_date DESC;
  ```
* **Line-by-Line Explanation:**
  - Connects `BOOKING` across 7 tables to reconstitute the full commercial invoice.
  - `GROUP_CONCAT(st.seat_number ...)`: Aggregates multiple individual seat rows (e.g., A1, A2) into a single readable string per booking invoice.
  - `WHERE b.customer_id = 1`: Restricts results to the targeted patron.
* **Expected Result:**
  Returns all booking orders made by customer 1 with complete theater, timing, and seat assignment details.
* **Relational Concept:** Complex multi-table equijoin, string aggregation with `GROUP_CONCAT`, and relational projection.

---

### Task 6: Detect Scheduling Conflicts on the Same Auditorium Screen
* **Examiner Prompt:** *"Write a query to verify whether scheduling a screening on Screen ID 3 on date '2026-10-30' from '18:00:00' to '21:15:00' conflicts with any existing screening."*
* **SQL Query:**
  ```sql
  SELECT 
      s.show_id,
      m.title AS conflicting_movie,
      s.start_time,
      s.end_time
  FROM SHOWTIME s
  JOIN MOVIE m ON s.movie_id = m.movie_id
  WHERE s.screen_id = 3
    AND s.show_date = '2026-10-30'
    AND (s.start_time < '21:15:00' AND s.end_time > '18:00:00');
  ```
* **Line-by-Line Explanation:**
  - `WHERE s.screen_id = 3 AND s.show_date = '2026-10-30'`: Isolates screenings scheduled in the exact same physical auditorium on that calendar day.
  - `AND (s.start_time < '21:15:00' AND s.end_time > '18:00:00')`: The mathematical interval overlap condition. If any existing showtime starts before the candidate ends, AND ends after the candidate starts, an overlap exists.
* **Expected Result:**
  Returns empty result set if the time slot is clear, or returns the conflicting movie title and hours if occupied.
* **Relational Concept:** Interval comparison logic, range overlap detection, and domain integrity enforcement.

---

### Task 7: Concession Sales Revenue Breakdown by Snack Item
* **Examiner Prompt:** *"Write a query to calculate total quantity sold and total revenue earned for each snack item, showing top-selling items first."*
* **SQL Query:**
  ```sql
  SELECT 
      sn.snack_id,
      sn.snack_name,
      sn.price AS current_unit_price,
      sn.stock_quantity AS remaining_stock,
      COALESCE(SUM(soi.quantity), 0) AS total_units_sold,
      COALESCE(SUM(soi.quantity * soi.unit_price), 0.00) AS total_concession_revenue
  FROM SNACK sn
  LEFT JOIN SNACK_ORDER_ITEM soi ON sn.snack_id = soi.snack_id
  LEFT JOIN SNACK_ORDER so ON soi.snack_order_id = so.snack_order_id AND so.order_status = 'COMPLETED'
  GROUP BY sn.snack_id, sn.snack_name, sn.price, sn.stock_quantity
  ORDER BY total_concession_revenue DESC;
  ```
* **Line-by-Line Explanation:**
  - `FROM SNACK sn LEFT JOIN SNACK_ORDER_ITEM soi ...`: Left joins concessions so items with zero sales are still listed.
  - `COALESCE(SUM(soi.quantity * soi.unit_price), 0.00)`: Multiplies recorded line item quantities by historical purchase prices to calculate accurate historical revenue.
  - `ORDER BY total_concession_revenue DESC`: Sorts top revenue-earning snacks first.
* **Expected Result:**
  Returns 10 rows showing items like *Caramel Popcorn (L)* and *Cheese Nachos* leading in units and revenue.
* **Relational Concept:** Many-to-Many junction aggregation, calculated column summation, and inventory auditing.

---

### Task 8: Find Customers with Zero Bookings (Inactive Patrons)
* **Examiner Prompt:** *"Write a query to identify all registered customers who have never made a single ticket booking."*
* **SQL Query (Method 1: LEFT JOIN with NULL check):**
  ```sql
  SELECT 
      c.customer_id,
      c.customer_name,
      c.email,
      c.phone
  FROM CUSTOMER c
  LEFT JOIN BOOKING b ON c.customer_id = b.customer_id
  WHERE b.booking_id IS NULL;
  ```
* **Alternative Query (Method 2: NOT EXISTS Correlated Subquery):**
  ```sql
  SELECT 
      c.customer_id,
      c.customer_name,
      c.email,
      c.phone
  FROM CUSTOMER c
  WHERE NOT EXISTS (
      SELECT 1 
      FROM BOOKING b 
      WHERE b.customer_id = c.customer_id
  );
  ```
* **Line-by-Line Explanation:**
  - Method 1 joins customers to bookings; if a customer has no bookings, the right table columns are `NULL`. `WHERE b.booking_id IS NULL` filters strictly for those non-matching rows.
  - Method 2 uses `NOT EXISTS`, which returns true if the subquery returns zero rows for that customer.
* **Expected Result:**
  Returns customers in the database who registered an account or profile but have not yet purchased tickets.
* **Relational Concept:** Outer joins for non-existence matching versus correlated `NOT EXISTS` subqueries.

---

### Task 9: Overall Financial Reconciliation (Tickets, Snacks, Refunds)
* **Examiner Prompt:** *"Write an executive financial summary query showing total confirmed ticket revenue, total concession revenue, total refunded amount, and net gross revenue."*
* **SQL Query:**
  ```sql
  SELECT 
      ticket_summary.confirmed_tickets,
      concession_summary.total_concessions,
      ticket_summary.refunded_amount,
      (ticket_summary.confirmed_tickets + concession_summary.total_concessions) AS net_gross_revenue
  FROM 
      (
          SELECT 
              COALESCE(SUM(CASE WHEN booking_status = 'CONFIRMED' THEN total_amount ELSE 0 END), 0.00) AS confirmed_tickets,
              COALESCE(SUM(CASE WHEN booking_status = 'CANCELLED' THEN total_amount ELSE 0 END), 0.00) AS refunded_amount
          FROM BOOKING
      ) AS ticket_summary
  CROSS JOIN 
      (
          SELECT 
              COALESCE(SUM(total_price), 0.00) AS total_concessions
          FROM SNACK_ORDER
          WHERE order_status = 'COMPLETED'
      ) AS concession_summary;
  ```
* **Line-by-Line Explanation:**
  - Uses two derived subqueries (`ticket_summary` and `concession_summary`).
  - Conditional `SUM(CASE ...)` separates confirmed ticket earnings from refunded amounts.
  - `CROSS JOIN` combines the two single-row scalar summaries to calculate overall net revenue.
* **Expected Result:**
  Returns exactly 1 row summarizing overall corporate financials.
* **Relational Concept:** Derived tables (inline views), `CASE` expressions inside aggregates, and scalar joins.

---

### Task 10: Find Movies Screened in All 8 Multiplex Theaters
* **Examiner Prompt:** *"Write a query to find movies that have at least one showtime scheduled in every single theater in the circuit (Relational Division concept)."*
* **SQL Query:**
  ```sql
  SELECT 
      m.movie_id,
      m.title
  FROM MOVIE m
  JOIN SHOWTIME s ON m.movie_id = s.movie_id
  JOIN SCREEN sc ON s.screen_id = sc.screen_id
  GROUP BY m.movie_id, m.title
  HAVING COUNT(DISTINCT sc.theater_id) = (SELECT COUNT(*) FROM THEATER);
  ```
* **Line-by-Line Explanation:**
  - Joins `MOVIE` through `SHOWTIME` and `SCREEN` to access `theater_id`.
  - `GROUP BY m.movie_id, m.title`: Groups rows by movie.
  - `HAVING COUNT(DISTINCT sc.theater_id) = (SELECT COUNT(*) FROM THEATER)`: Compares the distinct count of theaters where the movie is scheduled to the total count of theaters in the entire circuit (8).
* **Expected Result:**
  Returns universal releases that are playing across all venues nationwide.
* **Relational Concept:** Relational Division ($A \div B$) simulated using `GROUP BY`, `COUNT(DISTINCT)`, and `HAVING` with a subquery.

---

### Task 11: Rank Theaters by Ticket Sales Using Window Functions
* **Examiner Prompt:** *"Write a query to rank all multiplex theaters by total ticket sales using SQL Window Functions."*
* **SQL Query:**
  ```sql
  SELECT 
      t.theater_id,
      t.theater_name,
      t.city,
      COALESCE(SUM(b.total_amount), 0.00) AS theater_revenue,
      RANK() OVER (ORDER BY COALESCE(SUM(b.total_amount), 0.00) DESC) AS revenue_rank,
      DENSE_RANK() OVER (ORDER BY COALESCE(SUM(b.total_amount), 0.00) DESC) AS dense_revenue_rank
  FROM THEATER t
  LEFT JOIN SCREEN sc ON t.theater_id = sc.theater_id
  LEFT JOIN SHOWTIME s ON sc.screen_id = s.screen_id
  LEFT JOIN BOOKING b ON s.show_id = b.show_id AND b.booking_status = 'CONFIRMED'
  GROUP BY t.theater_id, t.theater_name, t.city;
  ```
* **Line-by-Line Explanation:**
  - `RANK() OVER (ORDER BY ... DESC)`: Calculates relative rank. If two theaters tie for rank 1, the next rank is 3.
  - `DENSE_RANK() OVER (...)`: Calculates dense rank without skipping rank numbers on ties.
* **Expected Result:**
  Returns all 8 multiplexes with their revenue ranks (1 through 8).
* **Relational Concept:** Modern SQL Window Functions (`OVER`, `RANK()`, `DENSE_RANK()`).

---

### Task 12: Identify Theaters with No Active Showtimes
* **Examiner Prompt:** *"Write a query to find multiplex theaters that currently have zero showtimes scheduled."*
* **SQL Query:**
  ```sql
  SELECT 
      t.theater_id,
      t.theater_name,
      t.city
  FROM THEATER t
  WHERE t.theater_id NOT IN (
      SELECT DISTINCT sc.theater_id
      FROM SCREEN sc
      JOIN SHOWTIME s ON sc.screen_id = s.screen_id
  );
  ```
* **Line-by-Line Explanation:**
  - Subquery selects all `theater_id`s that currently appear in `SCREEN` rows linked to `SHOWTIME`.
  - `WHERE t.theater_id NOT IN (...)` returns theaters absent from that set.
* **Expected Result:**
  Returns any newly constructed or unprogrammed multiplex venues.
* **Relational Concept:** Set membership negation using `NOT IN`.

---

### Task 13: Average Ticket Price by Auditorium Screen Type
* **Examiner Prompt:** *"Write a query to calculate the average ticket base price across different screen formats (Standard, Laser IMAX, 4DX, VIP)."*
* **SQL Query:**
  ```sql
  SELECT 
      sc.screen_type,
      COUNT(s.show_id) AS total_screenings,
      ROUND(AVG(s.base_price), 2) AS avg_base_ticket_price,
      MIN(s.base_price) AS min_price,
      MAX(s.base_price) AS max_price
  FROM SCREEN sc
  JOIN SHOWTIME s ON sc.screen_id = s.screen_id
  GROUP BY sc.screen_type
  ORDER BY avg_base_ticket_price DESC;
  ```
* **Line-by-Line Explanation:**
  - Groups showtimes by `sc.screen_type`.
  - Computes average, minimum, and maximum ticket pricing per cinema format.
* **Expected Result:**
  Shows premium formats like IMAX and 4DX commanding significantly higher average prices than Standard auditoriums.
* **Relational Concept:** Group-level aggregate statistics (`AVG`, `MIN`, `MAX`, `ROUND`).

---

### Task 14: Most Popular Screening Time Slots (Morning, Afternoon, Evening, Night)
* **Examiner Prompt:** *"Write a query to categorize showtimes into time slots (Morning, Matinee, Evening, Night) and display the number of bookings made for each slot."*
* **SQL Query:**
  ```sql
  SELECT 
      CASE 
          WHEN s.start_time < '12:00:00' THEN 'Morning (Before 12 PM)'
          WHEN s.start_time BETWEEN '12:00:00' AND '16:59:59' THEN 'Matinee (12 PM - 5 PM)'
          WHEN s.start_time BETWEEN '17:00:00' AND '20:59:59' THEN 'Evening (5 PM - 9 PM)'
          ELSE 'Night (After 9 PM)'
      END AS time_slot,
      COUNT(DISTINCT s.show_id) AS scheduled_shows_count,
      COUNT(b.booking_id) AS total_bookings_received
  FROM SHOWTIME s
  LEFT JOIN BOOKING b ON s.show_id = b.show_id AND b.booking_status = 'CONFIRMED'
  GROUP BY time_slot
  ORDER BY total_bookings_received DESC;
  ```
* **Line-by-Line Explanation:**
  - Uses a `CASE` expression to dynamically bin continuous time values into discrete business categories.
  - Groups and aggregates by the computed `CASE` column.
* **Expected Result:**
  Reveals peak cinema attendance hours (typically Evening and Night time slots).
* **Relational Concept:** Categorical binning using `CASE` statements and grouped aggregation.

---

### Task 15: Find the Most Frequently Booked Movie Genre
* **Examiner Prompt:** *"Write a query to determine which movie genre has sold the highest number of individual seat tickets."*
* **SQL Query:**
  ```sql
  SELECT 
      m.genre,
      COUNT(bs.seat_id) AS total_tickets_sold
  FROM MOVIE m
  JOIN SHOWTIME s ON m.movie_id = s.movie_id
  JOIN BOOKING b ON s.show_id = b.show_id
  JOIN BOOKED_SEAT bs ON b.booking_id = bs.booking_id
  WHERE b.booking_status = 'CONFIRMED'
  GROUP BY m.genre
  ORDER BY total_tickets_sold DESC
  LIMIT 1;
  ```
* **Line-by-Line Explanation:**
  - Traverses the schema from `MOVIE` down to `BOOKED_SEAT`.
  - Filters strictly for confirmed bookings.
  - Aggregates by genre, sorts descending, and applies `LIMIT 1` to isolate the top-performing category.
* **Expected Result:**
  Returns the single top genre (e.g., *Sci-Fi* or *Action*) along with ticket volume.
* **Relational Concept:** Top-N query pattern using `ORDER BY ... DESC LIMIT 1`.

---

### Task 16: Verify Physical Seat Map Integrity
* **Examiner Prompt:** *"Write a validation query to verify that every screen's physical seat count in the `SEAT` table matches its declared `capacity` in the `SCREEN` table."*
* **SQL Query:**
  ```sql
  SELECT 
      sc.screen_id,
      sc.screen_number,
      sc.screen_name,
      sc.capacity AS declared_capacity,
      COUNT(st.seat_id) AS actual_physical_seats,
      (sc.capacity - COUNT(st.seat_id)) AS discrepancy
  FROM SCREEN sc
  LEFT JOIN SEAT st ON sc.screen_id = st.screen_id
  GROUP BY sc.screen_id, sc.screen_number, sc.screen_name, sc.capacity
  HAVING discrepancy != 0;
  ```
* **Line-by-Line Explanation:**
  - Compares the configured integer `capacity` in `SCREEN` against the actual count of rows in `SEAT`.
  - `HAVING discrepancy != 0`: Filters strictly for auditoriums where a discrepancy exists.
* **Expected Result:**
  Returns an empty result set (0 rows), mathematically proving 100% database integrity across all 32 screens and 4,544 physical seats.
* **Relational Concept:** Database audit queries, integrity verification, and `HAVING` disparity filters.

