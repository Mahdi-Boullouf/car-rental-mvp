# Master Cars — منصة تأجير وبيع السيارات

Production monorepo for **Master Cars** (Algeria): a public car‑sales storefront
(Ouedkniss‑style) plus an admin dashboard for the rental fleet, bookings and the
sales inventory.

- **frontend/** — React 18 + Vite + TypeScript + Tailwind (RTL Arabic, Tajawal font)
- **backend/** — Express + Prisma + PostgreSQL + JWT + Zod + multer
- **prototype/** — the original single‑file HTML prototype (kept for reference)

## Architecture

```
frontend (SPA :5173)  ──►  backend REST API (:4000)  ──►  PostgreSQL (mastercars)
   React Router              Express + Prisma               8 cars, 6 listings, 1 admin
```

Vite proxies `/api` and `/uploads` to the backend, so dev is same‑origin.

## Prerequisites

- Node 18+ and npm
- PostgreSQL running locally (`psql` / `createdb` available)

## 1) Backend

```bash
cd backend
cp .env.example .env          # then edit DATABASE_URL + JWT
createdb mastercars           # or use your own database name in DATABASE_URL
npm install
npm run migrate               # prisma migrate dev — creates the tables
npm run seed                  # admin user + Algerian fleet + sale listings
npm run dev                   # http://localhost:4000
```

`.env` keys:

```
PORT=4000
DATABASE_URL=postgresql://USER@localhost:5432/mastercars?schema=public
JWT=<a-long-random-secret>
CLIENT_ORIGIN=http://localhost:5173
```

## 2) Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

## Default admin login

```
admin@mastercars.dz  /  admin123
```

(seeded — change it in production)

## What the app does

**Public** (`/`)
- Storefront: search + grid of cars for sale, price, specs, wilaya, **مباعة** ribbon.
- Car details (`/car/:id`): gallery, specs grid, description, seller card with
  call + WhatsApp, sold banner when sold.

**Admin** (`/admin`, JWT‑protected)
- **الأسطول** — rental fleet, KPIs, add/delete a car, and booking with
  **server‑side conflict detection** (overlapping dates are rejected).
- **الحجوزات** — all bookings, status, revenue, delete.
- **سيارات للبيع** — full CRUD on listings + multi‑image upload + mark sold/available.

## API (prefix `/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/login` | – | login → `{ token, user }` |
| GET | `/auth/me` | ✓ | current user |
| GET | `/cars` | – | rental fleet |
| POST/PUT/DELETE | `/cars[/:id]` | ✓ | manage fleet |
| GET | `/bookings` | ✓ | all bookings |
| POST | `/bookings` | ✓ | create (409 on date conflict) |
| DELETE | `/bookings/:id` | ✓ | delete |
| GET | `/sales`, `/sales/:id` | – | public listings |
| POST/PUT/DELETE | `/sales[/:id]` | ✓ | manage listings |
| PATCH | `/sales/:id/sold` | ✓ | toggle sold |
| POST | `/uploads` | ✓ | multipart images → `{ paths }` |

Response envelope: `{ success: true, data }` on success, `{ success: false, message }` on error.

## Next steps (not in this pass)

- Rental **contracts** (PDF/print) and **agents** management screens.
- Public storefront SSR/SEO (currently client‑rendered).
- Password reset, refresh tokens, rate limiting, and image storage on S3/R2 for real deploys.
