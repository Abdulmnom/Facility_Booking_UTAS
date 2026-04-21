# Full-Stack University Facility Booking System



## Context

The current project (`facility-booking/`) is a React 19 + LocalStorage frontend-only app built as a diploma project. It has one monolithic `App.js` with CRUD for bookings. The project report outlines a Phase 2 (add backend) and Phase 3 (production features). This plan upgrades it into a proper full-stack app.



---



## Final Folder Structure



```

Diplome_Project/

├── facility-booking/              ← existing React CRA frontend (refactored)

│   └── src/

│       ├── api/axios.js           ← Axios instance + JWT interceptors

│       ├── context/AuthContext.jsx

│       ├── hooks/useAuth.js, useBookings.js

│       ├── components/

│       │   ├── auth/LoginForm.jsx, RegisterForm.jsx

│       │   ├── bookings/BookingForm.jsx, BookingTable.jsx, CalendarView.jsx

│       │   ├── admin/AdminDashboard.jsx, BookingStats.jsx, UserList.jsx

│       │   └── layout/Navbar.jsx, ProtectedRoute.jsx

│       ├── pages/LoginPage, RegisterPage, BookingsPage, CalendarPage, AdminPage

│       └── App.js  ← refactored to React Router shell

│

└── facility-booking-backend/      ← NEW Node/Express backend

    └── src/

        ├── config/database.js (Sequelize+SQLite), email.js (Nodemailer)

        ├── models/User.js, Facility.js, Booking.js, index.js

        ├── middleware/authMiddleware.js (JWT), adminMiddleware.js

        ├── controllers/authController.js, bookingController.js, facilityController.js, adminController.js

        ├── routes/ (auth, booking, facility, admin)

        ├── services/emailService.js

        └── app.js

    └── server.js  ← entry point

```



---



## Database Schema



### users

| Column | Type | Notes |

|--------|------|-------|

| id | INTEGER PK | |

| name | VARCHAR(100) | |

| email | VARCHAR(150) UNIQUE | |

| password_hash | VARCHAR(255) | bcryptjs |

| role | ENUM('user','admin') | default 'user' |

| is_active | BOOLEAN | default true |



### facilities

| Column | Type | Notes |

|--------|------|-------|

| id | INTEGER PK | |

| name | VARCHAR(100) UNIQUE | Room A, Room B, Lab 1, Lab 2, Meeting Room, Sports Court |

| type | VARCHAR(50) | classroom / lab / meeting / sports |

| capacity | INTEGER | |

| is_active | BOOLEAN | soft delete |



### bookings

| Column | Type | Notes |

|--------|------|-------|

| id | INTEGER PK | |

| user_id | FK → users | |

| facility_id | FK → facilities | |

| booking_date | DATE | |

| start_time | TIME | |

| end_time | TIME | |

| purpose | VARCHAR(255) | |

| status | ENUM('pending','confirmed','cancelled') | |

| email_sent | BOOLEAN | |



**Unique constraint:** `(facility_id, booking_date, start_time)` prevents double booking.



---



## REST API Endpoints



### Auth `/api/auth`

| Method | Path | Auth | Description |

|--------|------|------|-------------|

| POST | `/register` | — | Register user, returns JWT |

| POST | `/login` | — | Login, returns JWT |

| GET | `/me` | JWT | Get current user profile |



### Facilities `/api/facilities`

| Method | Path | Auth | Description |

|--------|------|------|-------------|

| GET | `/` | — | List all active facilities |

| POST | `/` | Admin | Create facility |

| PUT | `/:id` | Admin | Update facility |

| DELETE | `/:id` | Admin | Soft-delete facility |



### Bookings `/api/bookings`

| Method | Path | Auth | Description |

|--------|------|------|-------------|

| GET | `/` | JWT | My bookings |

| POST | `/` | JWT | Create (conflict detection + email) |

| PUT | `/:id` | JWT | Update own booking |

| DELETE | `/:id` | JWT | Cancel own booking |

| GET | `/availability` | JWT | Check slot: `?facilityId&date&start&end` |



### Admin `/api/admin`

| Method | Path | Auth | Description |

|--------|------|------|-------------|

| GET | `/stats` | Admin | Dashboard metrics (totals, by-facility chart data) |

| GET | `/users` | Admin | All users |

| PUT | `/users/:id/role` | Admin | Promote/demote |

| GET | `/bookings` | Admin | All bookings |

| DELETE | `/bookings/:id` | Admin | Force-cancel |



---



## Auth Flow

1. Register → bcryptjs hash password → save user → sign JWT (7d) → return token

2. Login → compare hash → sign JWT → return token

3. `authMiddleware.js`: extract `Bearer` token → `jwt.verify` → attach `req.user = { id, role }`

4. `adminMiddleware.js`: runs after auth → check `req.user.role === 'admin'`

5. Frontend stores token in `localStorage` key `fbk_token`

6. Axios interceptor auto-attaches header on every request

7. 401 response → auto-logout + redirect to `/login`



---



## Frontend Routes (after App.js refactor)

```

/ → HomePage (public)

/login → LoginPage

/register → RegisterPage

/bookings → ProtectedRoute → BookingsPage (table + calendar toggle)

/calendar → ProtectedRoute → CalendarPage (FullCalendar)

/admin → ProtectedRoute (adminOnly) → AdminPage

```



---



## New Dependencies



**Frontend**

- `react-router-dom` — routing

- `axios` — API calls

- `@fullcalendar/react` + `daygrid` + `timegrid` + `interaction` — calendar view

- `recharts` — admin charts

- `tailwindcss` — styling



**Backend**

- `express`, `cors`, `dotenv`

- `sequelize`, `sqlite3` (dev), `pg` (prod-ready)

- `jsonwebtoken`, `bcryptjs`

- `nodemailer`

- `express-validator`



---



## Implementation Order



### Phase 1 — Backend Foundation

1. Init `facility-booking-backend/`, install deps, create folder structure

2. `config/database.js` → Sequelize + SQLite

3. Models: `User.js` (with bcrypt hooks), `Facility.js`, `Booking.js` (unique constraint, email hook), `index.js` (associations)

4. `server.js` → sync DB + seed 6 facilities on first run

5. `app.js` → CORS, JSON, route mounts, error handler

6. Auth: `authMiddleware`, `adminMiddleware`, `authController`, `authRoutes`

7. Test: register → login → /me via curl/Postman



### Phase 2 — Booking & Facility API

8. `facilityController` + `facilityRoutes` → test GET returns seeded data

9. `bookingController` + `bookingRoutes` → full CRUD with overlap detection (test conflict returns 409)

10. `adminController` + `adminRoutes` → stats aggregation query



### Phase 3 — Frontend Refactoring

11. Install new frontend deps, configure Tailwind

12. `AuthContext.jsx` + `useAuth.js` + `api/axios.js` + `.env`

13. Refactor `App.js` → React Router shell with `<Routes>`

14. Build auth pages: `LoginForm`, `RegisterForm`, `LoginPage`, `RegisterPage`, `ProtectedRoute`

15. Extract booking components from existing `App.js`: `BookingForm`, `BookingTable`, `BookingRow` → connect to API via `useBookings` hook

16. `Navbar.jsx` with auth-aware links

17. `CalendarView.jsx` with FullCalendar, `CalendarPage`



### Phase 4 — Admin Dashboard

18. `BookingStats.jsx` (Recharts BarChart + LineChart)

19. `UserList.jsx`, `FacilityManager.jsx`

20. `AdminPage.jsx` with tab navigation + admin-only ProtectedRoute



### Phase 5 — Email Notifications

21. `config/email.js` (Nodemailer, use Mailtrap for dev)

22. `services/emailService.js` → `sendBookingConfirmation()`

23. Wire into `bookingController.createBooking` afterCreate



---



## Critical Files



| File | Role |

|------|------|

| `facility-booking/src/App.js` | Primary file to refactor — extract all logic into components |

| `facility-booking/src/context/AuthContext.jsx` | Auth hub; Navbar, ProtectedRoute, Axios all depend on it |

| `facility-booking/src/api/axios.js` | Intercepts every request to attach JWT |

| `facility-booking-backend/server.js` | Entry point — Sequelize sync + facility seed |

| `facility-booking-backend/src/models/Booking.js` | Unique constraint + email hook |

| `facility-booking-backend/src/controllers/bookingController.js` | Overlap detection query (core business logic) |



---



## Verification / Testing



1. **Backend**: `npm start` in backend → SQLite file created, 6 facilities seeded, server on port 5000

2. **Auth**: POST `/api/auth/register` → get token → GET `/api/auth/me` → see user profile

3. **Booking conflict**: POST two bookings with same facility/date/time → second returns 409

4. **Frontend**: `npm start` in frontend → login works, bookings list loads from API (not LocalStorage)

5. **Calendar**: `/calendar` shows bookings as events on FullCalendar

6. **Admin**: Login as admin → `/admin` accessible, stats charts render, regular user redirected

7. **Email**: Create booking → check Mailtrap inbox for confirmation email

