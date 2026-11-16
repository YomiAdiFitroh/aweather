# Aweather

Weather and indoor-conditions dashboard with JWT authentication.

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT access token (15 min) + rotating refresh token (7 days, httpOnly cookie) |
| Tests | Jest + Supertest |

## Setup

You need Node 20+ and PostgreSQL installed locally (the installer from postgresql.org is fine; pgAdmin comes with it).

```bash
# 1. Backend
cd backend
cp .env.example .env        # set DATABASE_URL (your postgres password) and the two JWT secrets
npm install
npx prisma migrate dev --name init
npm run dev                 # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

`prisma migrate dev` creates the `aweather` database if it does not exist yet. If you prefer to create it yourself:

```bash
psql -U postgres -c "CREATE DATABASE aweather;"
```

On Windows, use `copy` instead of `cp`. Generate secrets with
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

Open http://localhost:3000, register an account, and you land on the dashboard.
Without a `WEATHER_API_KEY` the backend serves demo weather data. With an
OpenWeatherMap key it fetches live data and caches it for 10 minutes.

## Tests

```bash
cd backend
npm test
```

Tests use an in-memory fake of Prisma, so they run without a database.

| Area | Positive cases | Negative cases |
|---|---|---|
| Register | creates user, sets cookie, hides password hash | duplicate email, bad email, short password, empty body |
| Login | valid credentials, case-insensitive email | wrong password, unknown email, empty password |
| JWT guard | valid token | missing, malformed, tampered, expired, wrong secret, `alg: none` |
| Refresh | rotates token | no cookie, garbage cookie, reuse of a rotated token (revokes all sessions) |
| Logout | revokes token | refresh after logout fails |
| Users / Weather | list returned, no password hashes | 401 without token, unsupported city (400) |

## API

| Method | Route | Auth |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/refresh` | refresh cookie |
| POST | `/api/auth/logout` | refresh cookie |
| GET | `/api/auth/me` | access token |
| GET | `/api/users` | access token |
| GET | `/api/weather/dashboard?city=Jakarta` | access token |
| GET | `/api/weather/cities` | access token |

## How the auth works

- The access token is kept in memory in the browser, never in localStorage.
- The refresh token is an httpOnly cookie scoped to `/api/auth`, and only its SHA-256 hash is stored in the database.
- Every refresh revokes the old token and issues a new one. If an already-used refresh token shows up again, all of that user's sessions are revoked.
- When an API call returns 401, the frontend refreshes once and retries.
