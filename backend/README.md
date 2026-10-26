# Movie Theater Ticket Engine - Backend API

The Node.js and Express REST API for the Movie Theater Ticket Engine RDBMS lab project.

## Architecture
- **Framework**: Express.js (v4.19.2)
- **Database Driver**: `mysql2/promise` with connection pooling
- **Security**: `bcryptjs` password hashing, JSON Web Tokens (`jsonwebtoken`)
- **CORS**: Enabled for Vite React frontend (`http://localhost:5173`)

## Environment Variables (`.env`)
Create a `.env` file from `.env.example`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=MovieTheaterDB
JWT_SECRET=supersecretkey_for_rdbms_lab_eval
```

## Running the Server
```powershell
cd backend
npm install
npm start
```
The server starts at `http://localhost:5000`.

## API Endpoints Reference
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/health` | Diagnostics & MySQL ping | No |
| GET | `/api/movies` | List movies (filters: genre, language, search) | No |
| GET | `/api/movies/:id` | Movie details | No |
| GET | `/api/movies/:id/showtimes` | Movie screenings by theater and screen | No |
| GET | `/api/theaters` | Cinema locations and screens | No |
| GET | `/api/showtimes/:id/seats` | Dynamic seat map & live availability | No |
| GET | `/api/snacks` | Concessions inventory | No |
| GET | `/api/bookings` | Bookings list | No |
| GET | `/api/bookings/:id` | Booking details, seats, snacks | No |
| POST | `/api/bookings` | Create booking (ACID transaction) | No |
| POST | `/api/bookings/:id/cancel` | Cancel booking (releases seats) | No |
| GET | `/api/customers` | Customer listing & loyalty points | No |
| GET | `/api/customers/:id/bookings` | Customer's booking history | No |
| POST | `/api/admin/login` | Staff / Admin authentication | No |
| GET | `/api/admin/dashboard` | KPI metrics (revenue, counts, recent) | Bearer Token |
| GET | `/api/admin/movies` | Admin movie catalog | Bearer Token |
| POST | `/api/admin/movies` | Create movie | Bearer Token (Admin/Manager) |
| PUT | `/api/admin/movies/:id` | Update movie | Bearer Token (Admin/Manager) |
| DELETE | `/api/admin/movies/:id` | Delete movie | Bearer Token (Admin) |
| GET | `/api/admin/showtimes` | List all showtimes | Bearer Token |
| POST | `/api/admin/showtimes` | Schedule showtime | Bearer Token (Admin/Manager) |
| GET | `/api/admin/staff` | Staff roster & roles | Bearer Token |
| GET | `/api/reports/revenue` | Financial & concessions breakdown | Bearer Token |
| GET | `/api/reports/popular-movies` | Popular movies by tickets sold | Bearer Token |

