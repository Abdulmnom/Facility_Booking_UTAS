# Full-Stack University Facility Booking System — Implementation Plan



## Context



This is a diploma project (Academic Year 2024–2025) for University of Technology and Applied Sciences. The team built a Phase 1 frontend-only React app (`facility-booking/`) using LocalStorage. The project report explicitly outlines Phase 2 (backend + auth) and Phase 3 (production features). This plan upgrades it into a proper full-stack system matching everything described in the report.



**Current state:** `facility-booking/src/App.js` — one monolithic component, all CRUD via LocalStorage, no auth, no backend.



---



## Final Folder Structure



```

Diplome_Project/

├── facility-booking/                  ← existing React frontend (refactored)

│   ├── .env                           ← REACT_APP_API_URL=http://localhost:5000

│   └── src/

│       ├── api/axios.js               ← Axios instance + JWT interceptors

│       ├── context/AuthContext.jsx    ← global auth state

│       ├── hooks/useAuth.js

│       ├── hooks/useBookings.js

│       ├── components/

│       │   ├── auth/LoginForm.jsx

│       │   ├── auth/RegisterForm.jsx

│       │   ├── bookings/BookingForm.jsx

│       │   ├── bookings/BookingTable.jsx

│       │   ├── bookings/CalendarView.jsx

│       │   ├── admin/AdminDashboard.jsx

│       │   ├── admin/BookingStats.jsx

│       │   ├── admin/UserList.jsx

│       │   ├── admin/FacilityManager.jsx

│       │   └── layout/Navbar.jsx

│       │   └── layout/ProtectedRoute.jsx

│       ├── pages/LoginPage.jsx

│       ├── pages/RegisterPage.jsx

│       ├── pages/BookingsPage.jsx

│       ├── pages/CalendarPage.jsx

│       ├── pages/AdminPage.jsx

│       └── App.js                     ← refactored to React Router shell only

│

└── facility-booking-backend/          ← NEW Node.js/Express backend

    ├── .env                           ← PORT, JWT_SECRET, EMAIL_* vars

    ├── server.js                      ← entry point: sync DB + seed + listen

    └── src/

        ├── config/database.js         ← Sequelize + SQLite

        ├── config/email.js            ← Nodemailer (Mailtrap for dev)

        ├── models/User.js

        ├── models/Facility.js

        ├── models/Booking.js          ← unique constraint + afterCreate hook

        ├── models/index.js            ← associations + sync

        ├── middleware/authMiddleware.js

        ├── middleware/adminMiddleware.js

        ├── controllers/authController.js

        ├── controllers/bookingController.js

        ├── controllers/facilityController.js

        ├── controllers/adminController.js

        ├── routes/auth.js

        ├── routes/bookings.js

        ├── routes/facilities.js

        ├── routes/admin.js

        └── services/emailService.js

```



---



## Database Schema



### `users`

| Column | Type | Notes |

|--------|------|-------|

| id | INTEGER PK | auto-increment |

| name | VARCHAR(100) | required |

| email | VARCHAR(150) UNIQUE | required |

| password_hash | VARCHAR(255) | bcryptjs, 10 rounds |

| role | ENUM('user','admin') | default 'user' |

| is_active | BOOLEAN | default true |



### `facilities`

| Column | Type | Notes |

|--------|------|-------|

| id | INTEGER PK | |

| name | VARCHAR(100) UNIQUE | seeded: Room A, Room B, Lab 1, Lab 2, Meeting Room, Sports Court |

| type | VARCHAR(50) | classroom / lab / meeting / sports |

| capacity | INTEGER | |

| is_active | BOOLEAN | soft delete |



### `bookings`

| Column | Type | Notes |

|--------|------|-------|

| id | INTEGER PK | |

| user_id | FK → users | required |

| facility_id | FK → facilities | required |

| booking_date | DATE | required |

| start_time | TIME | required |

| end_time | TIME | required |

| purpose | VARCHAR(255) | optional |

| status | ENUM('pending','confirmed','cancelled') | default 'pending' |

| email_sent | BOOLEAN | default false |



**Unique constraint:** `(facility_id, booking_date, start_time)` — prevents double-booking.



---



## REST API Endpoints



### Auth — `/api/auth`

| Method | Path | Auth | Description |

|--------|------|------|-------------|

| POST | `/register` | — | Register, return JWT |

| POST | `/login` | — | Login, return JWT |

| GET | `/me` | JWT | Get current user |



### Facilities — `/api/facilities`

| Method | Path | Auth | Description |

|--------|------|------|-------------|

| GET | `/` | — | List active facilities |

| POST | `/` | Admin | Create facility |

| PUT | `/:id` | Admin | Update facility |

| DELETE | `/:id` | Admin | Soft-delete facility |



### Bookings — `/api/bookings`

| Method | Path | Auth | Description |

|--------|------|------|-------------|

| GET | `/` | JWT | User's own bookings |

| POST | `/` | JWT | Create (conflict check + email) |

| PUT | `/:id` | JWT | Edit own booking |

| DELETE | `/:id` | JWT | Cancel own booking |

| GET | `/availability` | JWT | Check slot: `?facilityId&date&start&end` |



### Admin — `/api/admin`

| Method | Path | Auth | Description |

|--------|------|------|-------------|

| GET | `/stats` | Admin | Total bookings, by-facility breakdown |

| GET | `/users` | Admin | All users |

| PUT | `/users/:id/role` | Admin | Promote/demote |

| GET | `/bookings` | Admin | All bookings |

| DELETE | `/bookings/:id` | Admin | Force-cancel |



---



## Auth Flow



1. Register → bcryptjs hash (10 rounds) → save user → sign JWT (7d) → return `{ token, user }`

2. Login → compare hash → sign JWT → return `{ token, user }`

3. `authMiddleware.js`: extract `Bearer` token → `jwt.verify` → attach `req.user = { id, role }`

4. `adminMiddleware.js`: after auth → check `req.user.role === 'admin'`, else 403

5. Frontend stores token in `localStorage` key `fbk_token`

6. `api/axios.js` interceptor auto-attaches `Authorization: Bearer <token>` on every request

7. On 401 response → clear token + redirect to `/login`



---



## Frontend Routes



```

/            → public landing (redirect to /bookings if logged in)

/login       → LoginPage

/register    → RegisterPage

/bookings    → ProtectedRoute → BookingsPage (table + form)

/calendar    → ProtectedRoute → CalendarPage (FullCalendar)

/admin       → ProtectedRoute (adminOnly) → AdminPage

```



---



## New Dependencies



### Backend (`facility-booking-backend/`)

```json

{

  "express": "^4",

  "cors": "^2",

  "dotenv": "^16",

  "sequelize": "^6",

  "sqlite3": "^5",

  "jsonwebtoken": "^9",

  "bcryptjs": "^2",

  "express-validator": "^7",

  "nodemailer": "^6"

}

```



### Frontend (`facility-booking/`)

```

react-router-dom        routing

axios                   API calls

@fullcalendar/react     calendar view

@fullcalendar/daygrid

@fullcalendar/timegrid

@fullcalendar/interaction

recharts                admin charts

tailwindcss             utility CSS

```



---



## Implementation Phases



### Phase 1 — Backend Foundation

1. `mkdir facility-booking-backend && npm init -y && npm install ...`

2. Create folder structure (`src/config`, `src/models`, `src/middleware`, `src/controllers`, `src/routes`, `src/services`)

3. `config/database.js` → Sequelize + SQLite (`bookings.db`)

4. `models/User.js` — beforeCreate/beforeUpdate hook hashes password

5. `models/Facility.js` — `is_active` soft-delete pattern

6. `models/Booking.js` — unique constraint on `(facility_id, booking_date, start_time)`

7. `models/index.js` — define associations, export; `server.js` syncs DB + seeds 6 facilities

8. `app.js` — CORS, JSON body parser, mount all routes, global error handler

9. `authMiddleware.js` + `adminMiddleware.js`

10. `authController.js` + `routes/auth.js` — register, login, /me



### Phase 2 — Booking & Facility API

11. `facilityController.js` + `routes/facilities.js` — CRUD with admin guard

12. `bookingController.js` + `routes/bookings.js`:

    - `createBooking`: Sequelize `findOne` overlap query before insert → 409 on conflict

    - `getAvailability`: query for slot conflicts and return boolean

    - `updateBooking`: ownership check (user owns booking OR admin)

    - `deleteBooking`: set status = 'cancelled'

13. `adminController.js` + `routes/admin.js`:

    - `getStats`: `GROUP BY facility_id` query, total counts, bookings-per-day data



### Phase 3 — Frontend Refactoring

14. Install new frontend deps, configure TailwindCSS (`npx tailwindcss init`)

15. Create `.env` with `REACT_APP_API_URL=http://localhost:5000`

16. `api/axios.js` — base URL from env, request interceptor (attach JWT), response interceptor (auto-logout on 401)

17. `context/AuthContext.jsx` — provides `{ user, token, login, logout, isAdmin }`

18. Refactor `App.js` → React Router `<Routes>` shell only (remove all LocalStorage logic)

19. Build `LoginForm.jsx`, `RegisterForm.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`

20. `ProtectedRoute.jsx` — redirect to `/login` if no token; redirect to `/bookings` if not admin trying admin route

21. Extract `BookingForm.jsx` and `BookingTable.jsx` from existing `App.js`, replace LocalStorage calls with `useBookings` hook

22. `useBookings.js` — wraps axios calls for CRUD, exposes `{ bookings, createBooking, updateBooking, deleteBooking, loading, error }`

23. `Navbar.jsx` — shows Login/Register when logged out; Bookings/Calendar/Admin(if admin)/Logout when logged in



### Phase 4 — Admin Dashboard

24. `AdminDashboard.jsx` with tab navigation: Stats | Users | Facilities | All Bookings

25. `BookingStats.jsx` — Recharts `<BarChart>` for bookings per facility, `<LineChart>` for bookings over time

26. `UserList.jsx` — table with Promote/Demote button calling `PUT /api/admin/users/:id/role`

27. `FacilityManager.jsx` — add/edit/soft-delete facilities

28. `AdminPage.jsx` — assembles the above with admin-only `ProtectedRoute`



### Phase 5 — Calendar View + Email

29. `CalendarView.jsx` — FullCalendar `dayGridMonth`/`timeGridWeek` toggle; events sourced from bookings API

30. `CalendarPage.jsx` — wraps CalendarView in protected page layout

31. `config/email.js` — Nodemailer transport (Mailtrap in dev, real SMTP in prod)

32. `services/emailService.js` — `sendBookingConfirmation(user, booking, facility)`

33. Wire email into `bookingController.createBooking` after successful save; set `email_sent = true`



---



## Critical Files



| File | Why It's Critical |

|------|------------------|

| `facility-booking/src/App.js` | Must be stripped down to Router shell; all logic moves to components/pages |

| `facility-booking/src/context/AuthContext.jsx` | Everything (Navbar, ProtectedRoute, axios) depends on this |

| `facility-booking/src/api/axios.js` | JWT attachment + auto-logout — must be correct before any API calls |

| `facility-booking-backend/server.js` | DB sync + seed; if this breaks, nothing works |

| `facility-booking-backend/src/models/Booking.js` | Unique constraint is the core business rule |

| `facility-booking-backend/src/controllers/bookingController.js` | Overlap detection query — most critical backend logic |



---



## Testing Plan



### Backend Manual Tests (curl / Postman)



| # | Test | Expected |

|---|------|----------|

| 1 | `POST /api/auth/register` with valid body | 201 + JWT token |

| 2 | `POST /api/auth/login` with correct credentials | 200 + JWT token |

| 3 | `GET /api/auth/me` with valid Bearer token | 200 + user object |

| 4 | `GET /api/auth/me` with no token | 401 |

| 5 | `GET /api/facilities` | 200 + array of 6 seeded facilities |

| 6 | `POST /api/bookings` with valid booking (JWT) | 201 + booking object |

| 7 | `POST /api/bookings` with same facility/date/time (JWT) | 409 Conflict |

| 8 | `PUT /api/bookings/:id` by different user | 403 Forbidden |

| 9 | `GET /api/admin/stats` as regular user | 403 |

| 10 | `PUT /api/admin/users/:id/role` as admin | 200 + updated user |



### Frontend End-to-End Tests



| # | Test | Steps | Expected |

|---|------|-------|----------|

| 1 | Register + Login | Visit `/register`, fill form, submit; then `/login` | Redirected to `/bookings` |

| 2 | Create booking | Fill BookingForm, submit | Row appears in BookingTable |

| 3 | Conflict detection | Submit same facility/date/time twice | Error toast shown |

| 4 | Edit booking | Click Edit on row, change facility, resubmit | Row updates in place |

| 5 | Delete booking | Click Delete | Row removed instantly |

| 6 | Calendar view | Visit `/calendar` | Bookings appear as events on calendar |

| 7 | Admin route guard | Login as regular user, visit `/admin` | Redirected to `/bookings` |

| 8 | Admin dashboard | Login as admin, visit `/admin` | Stats, charts, user list visible |

| 9 | Email notification | Create booking (Mailtrap configured) | Email appears in Mailtrap inbox |

| 10 | Auto-logout | Expire or remove token from localStorage | Redirected to `/login` |



### Startup Verification Sequence

```bash

# 1. Start backend

cd facility-booking-backend

npm start

# → "Database synced. Facilities seeded. Server running on port 5000"



# 2. Start frontend

cd facility-booking

npm start

# → Opens http://localhost:3000



# 3. Quick smoke test

curl -X POST http://localhost:5000/api/auth/register \

  -H "Content-Type: application/json" \

  -d '{"name":"Test","email":"test@test.com","password":"Pass123!"}'

# → { "token": "...", "user": { ... } }

```



---



## Key Design Decisions



- **SQLite for development**: no server process, single `.db` file, easy for the whole team. Can migrate to PostgreSQL later (Sequelize handles it).

- **JWT in localStorage (`fbk_token`)**: simple for a course project; production would use httpOnly cookies.

- **Soft-delete facilities** (`is_active = false`): preserves booking history references.

- **`status = 'cancelled'` instead of DELETE** on bookings: maintains audit trail.

- **Mailtrap** for email dev: safe sandbox, no real emails sent, free tier sufficient.

- **TailwindCSS**: replaces the existing plain CSS without changing component logic; pair with existing class names where possible.

