# Movie Theater Ticket Engine - Frontend

Modern React application built with Vite for the Movie Theater Ticket Engine RDBMS lab project.

## Interfaces
1. **Admin Dashboard (Primary)**:
   - System KPIs: Gross revenue, total bookings, active movies, showtimes, customers
   - Movie management: view, add, edit, delete titles
   - Theater & Screen hierarchy
   - Showtime scheduling
   - Dynamic Auditorium Seat Availability grid
   - Booking management with cancellation & seat release
   - Financial audit payment records
   - Concessions & snack stock management
   - Customer profiles & loyalty tiers (Bronze, Silver, Gold, Platinum)
   - Admin staff roster & RBAC roles
   - Reports: Movie-wise revenue and popularity rankings
2. **Customer Portal (Secondary)**:
   - Catalog browsing with title and genre filtering
   - Screening showtime selection
   - Interactive auditorium seat picker (VIP, Premium, Standard)
   - Concession combos (Popcorn, Nachos, Cold Drinks)
   - Server-validated order calculation & Mock payment simulation
   - "My Bookings" history with self-service cancellation and instant seat release

## Development Setup
```powershell
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173` with proxy forwarding `/api` calls to `http://localhost:5000`.

