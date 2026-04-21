# University Facility Booking System — Frontend

A diploma project for the University of Technology and Applied Sciences (Academic Year 2024–2025).  
A full-stack web application that allows students and staff to browse, book, and manage university facilities (classrooms, labs, meeting rooms, sports courts) through a clean dark-themed dashboard.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [Troubleshooting](#troubleshooting)

---

## About the Project

### Features
- **Authentication** — Register / Login with JWT. Passwords hashed with bcryptjs.
- **Booking Management** — Create, edit, and cancel facility bookings. Conflict detection prevents double-booking.
- **Calendar View** — Visual weekly/monthly calendar (FullCalendar) showing all your active bookings.
- **Admin Dashboard** — Manage users, facilities, and all bookings. View charts and statistics (Recharts).
- **Email Notifications** — Confirmation email sent on every new booking (Nodemailer / Mailtrap).
- **Dark Theme** — Fully custom dark design system using CSS variables.

### Screenshots
| Page | Description |
|------|-------------|
| `/login` | Email + password login form |
| `/register` | Name, email, password (×2) registration |
| `/bookings` | Booking form + table side-by-side |
| `/calendar` | FullCalendar week/month view |
| `/admin` | Stats, user list, facility manager, all bookings |

---

## Tech Stack

### Frontend (`facility-booking/`)
| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework |
| React Router DOM | 7 | Client-side routing |
| React Bootstrap | 2 | UI components |
| Bootstrap | 5 | CSS base |
| Axios | 1 | HTTP client + JWT interceptors |
| FullCalendar | 6 | Calendar view |
| Recharts | 3 | Admin charts |
| Tailwind CSS | 4 | Utility CSS |

### Backend (`facility-booking-backend/`)
| Library | Purpose |
|---------|---------|
| Express 4 | HTTP server |
| Sequelize 6 + SQLite 3 | ORM + database |
| jsonwebtoken | JWT signing/verification |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| Nodemailer | Email sending |

---

## Project Structure

```
Diplome_Project/
├── facility-booking/              ← This repo (React frontend)
│   ├── public/
│   ├── src/
│   │   ├── api/axios.js           ← Axios instance + JWT interceptors
│   │   ├── context/AuthContext.jsx← Global auth state (login/logout/role)
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useBookings.js
│   │   ├── components/
│   │   │   ├── auth/              ← LoginForm, RegisterForm
│   │   │   ├── bookings/          ← BookingForm, BookingTable, CalendarView
│   │   │   ├── admin/             ← AdminDashboard, BookingStats, UserList, FacilityManager
│   │   │   ├── layout/            ← Navbar, ProtectedRoute
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/                 ← LoginPage, RegisterPage, BookingsPage, CalendarPage, AdminPage
│   │   └── App.js
│   ├── .env
│   └── package.json
│
└── facility-booking-backend/      ← Node.js/Express backend
    ├── src/
    │   ├── config/                ← database.js, email.js
    │   ├── models/                ← User, Facility, Booking
    │   ├── middleware/            ← authMiddleware, adminMiddleware
    │   ├── controllers/           ← auth, bookings, facilities, admin
    │   ├── routes/
    │   └── services/emailService.js
    └── server.js
```

---

## Getting Started

### Prerequisites
- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node)

### 1 — Clone or open the project
```bash
cd Diplome_Project/facility-booking
```

### 2 — Install frontend dependencies
```bash
npm install --legacy-peer-deps
```

> Use `--legacy-peer-deps` to avoid peer-dependency conflicts between React 19 and CRA tooling.

### 3 — Set up environment variables
Create a `.env` file in `facility-booking/` (copy from the example below):
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4 — Start the backend first
```bash
cd ../facility-booking-backend
npm install
npm start
# → "Database synced. Facilities seeded. Server running on port 5000"
```

### 5 — Start the frontend
```bash
cd ../facility-booking
npm start
# → Opens http://localhost:3000 in your browser
```

### 6 — Quick smoke test (optional)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Pass1234!"}'
# Expected: { "token": "...", "user": { "id": 1, ... } }
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:3000` | Backend API base URL. Set to `http://localhost:5000` for local dev. In production, set to your deployed backend URL. |

---

## Available Scripts

Run these from inside the `facility-booking/` directory:

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server at `http://localhost:3000` |
| `npm run build` | Build optimised production bundle into `build/` |
| `npm test` | Run tests in interactive watch mode |

---

## API Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | — | Register new user |
| `/api/auth/login` | POST | — | Login, returns JWT |
| `/api/auth/me` | GET | JWT | Get current user |
| `/api/facilities` | GET | — | List active facilities |
| `/api/bookings` | GET | JWT | Get user's bookings |
| `/api/bookings` | POST | JWT | Create booking |
| `/api/bookings/:id` | PUT | JWT | Update booking |
| `/api/bookings/:id` | DELETE | JWT | Cancel booking |
| `/api/bookings/availability` | GET | JWT | Check time slot |
| `/api/admin/stats` | GET | Admin | Booking statistics |
| `/api/admin/users` | GET | Admin | All users |
| `/api/admin/users/:id/role` | PUT | Admin | Promote / demote user |
| `/api/admin/bookings` | GET | Admin | All bookings |
| `/api/admin/bookings/:id` | DELETE | Admin | Force-cancel booking |

---

## User Roles

| Role | Access |
|------|--------|
| `user` | Register, login, create/edit/cancel own bookings, view calendar |
| `admin` | Everything above + admin dashboard, manage all users/facilities/bookings |

To make a user an admin, either use the admin dashboard (promote button) or set `role = 'admin'` directly in the database.

---

## Troubleshooting

### `react-scripts` not found / `npm start` fails

**Cause:** Running `npm audit fix --force` destroys `react-scripts` by downgrading it to `0.0.0`.

**Fix — do these steps in order:**

```bash
# Step 1: restore the correct version in package.json
# Open package.json and make sure this line is present:
#   "react-scripts": "5.0.1",
# (NOT "^0.0.0" or "0.0.0")

# Step 2: reinstall all packages
npm install --legacy-peer-deps

# Step 3: confirm the version is correct
cat node_modules/react-scripts/package.json | grep '"version"'
# Should print:  "version": "5.0.1",

# Step 4: start the app
npm start
```

> ⚠️ **Rule:** Never run `npm audit fix --force` on this project.  
> The flagged vulnerabilities are in build-time tools only (webpack, babel) and are **not exploitable at runtime**.  
> Safe alternative: `npm audit fix` (without `--force`) — applies only non-breaking fixes.

---

### `Module not found: html-webpack-plugin/lib/loader.js`

**Cause:** Corrupted or incomplete `node_modules` (usually from a bad `npm audit fix --force`).

**Fix:**
```bash
# Delete node_modules and reinstall cleanly
rm -rf node_modules
npm install --legacy-peer-deps
```

---

### Port 3000 already in use

```bash
# Windows — find and kill the process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart
npm start
```

---

### Backend not running / API calls fail

The frontend proxies all `/api/*` requests to `http://localhost:5000` (set in `package.json` `"proxy"` field).  
If the backend is not running, you will see network errors in the browser console.

**Fix:** Start the backend before the frontend:
```bash
cd ../facility-booking-backend && npm start
```

---

### Blank page after login (auth not loading)

The app verifies your JWT with the backend on startup. If the backend is unreachable, the auth check times out.  
Open DevTools → Network tab → check if `/api/auth/me` is returning a response.

---

## License

Academic project — University of Technology and Applied Sciences, 2024–2025.
