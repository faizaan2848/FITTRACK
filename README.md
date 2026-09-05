# FitTrack — Fitness & Health Tracking Platform

A full-stack fitness tracking application: workouts, nutrition, body metrics,
a marketplace, an AI nutrition assistant, and progress analytics.

## Tech Stack

- **Client:** React 19, Vite, React Router, Axios, Zustand/Context, Recharts
- **Server:** Node.js, Express, JWT auth, bcrypt, MVC structure
- **Database:** PostgreSQL + Prisma ORM
- **AI Assistant:** existing Python service, proxied through Express (client never calls it directly)

## Repository Structure

```
fittrack-app/
├── client/                    React app (Vite)
│   ├── src/
│   │   ├── components/        Reusable, feature-grouped UI pieces
│   │   │   ├── common/        Buttons, cards, inputs, modals — shared everywhere
│   │   │   ├── dashboard/
│   │   │   ├── workout/
│   │   │   ├── nutrition/
│   │   │   └── marketplace/
│   │   ├── pages/              Route-level views, one folder per feature
│   │   ├── layouts/             Shared page shells (e.g. sidebar + topbar layout)
│   │   ├── context/              React Context providers (AuthContext, etc.)
│   │   ├── hooks/                 Reusable custom hooks
│   │   ├── services/               Axios calls grouped by resource (authService.js, workoutService.js...)
│   │   ├── utils/                   Formatters, validators, shared constants
│   │   ├── assets/                   Images, icons
│   │   ├── styles/                    Global CSS, design tokens (variables.css)
│   │   └── routers/                    AppRouter.jsx — central route table
│   └── package.json
│
├── server/                     Express API (MVC)
│   ├── controllers/            Request handlers — one file per resource
│   ├── routes/                  Express routers — one file per resource, mounted in app.js
│   ├── models/                    Non-Prisma domain logic/helpers, if needed alongside Prisma models
│   ├── middleware/                 authMiddleware, errorHandler, notFoundHandler, validators
│   ├── prisma/                      schema.prisma, migrations/, seed.js
│   ├── services/                     Business logic + external calls (e.g. pythonAiService.js)
│   ├── utils/                          Shared helpers (token signing, password hashing, etc.)
│   ├── config/                          env.js — single source of truth for environment vars
│   ├── app.js                            Express app: middleware + route mounting (no listen())
│   ├── server.js                          Entry point — imports app.js and starts listening
│   └── package.json
│
└── README.md
```

### Why this shape

- **`app.js` vs `server.js`** — the Express app is assembled in `app.js` without
  binding a port, so it can be imported directly in integration tests later.
  `server.js` is the only file that calls `.listen()`.
- **`services/` on both sides** — on the client, `services/` holds all Axios
  calls so components never import `axios` directly. On the server, `services/`
  holds business logic that controllers call into, keeping controllers thin.
- **`config/env.js`** — every environment variable is read once here. No other
  file touches `process.env` directly, so config stays validated in one place.
- **Route/Controller split** — `routes/` only wires HTTP verbs + paths to a
  controller function; all actual logic lives in `controllers/` (and delegates
  to `services/` for anything non-trivial).

## Getting Started (current phase)

```bash
# Client
cd client
npm install
npm run dev        # http://localhost:5173

# Server
cd server
npm install
cp .env.example .env
npm run dev         # http://localhost:5000/api/health
```

## Phase Roadmap

- [x] **Phase 1** — Project setup & folder structure
- [x] **Phase 2** — Authentication (register, login, JWT, refresh tokens, protected routes)
- [x] **Phase 3** — Database & Prisma (schema, migrations, seed data)
- [x] **Phase 4** — Dashboard (metrics, charts)
- [x] **Phase 5** — Workout Tracker (exercise library, favorites, workout templates, logging, history)
- [x] **Phase 6** — Nutrition Tracker (meal logging, macros, water intake)
- [x] **Phase 7** — Calculators (BMI, BMR, TDEE, Body Fat)
- [x] **Phase 8** — Marketplace (products, search/filter/sort, product detail, cart, wishlist, checkout)
- [x] **Phase 9** — AI Nutrition Integration (photo-based meal analysis via existing Python/Gemini service, proxied through Express)
- [x] **Phase 10** — Analytics (weight, calories, workout frequency, body fat, BMI, protein intake, exercise completion — week/month/year)
- [x] **Phase 10.5** — UI polish & "wow" pass: toast notifications, animated count-up numbers, scroll-reveal landing page, live Achievements/Badges system
- [x] **Phase 10.6** — Membership tiers (FREE/PRO/PREMIUM): gates AI Meal Scanner + Analytics behind PRO, caps marketplace listings by plan, simulated upgrade flow (real payment wiring deferred)
- [x] **Phase 10.7** — Peer-to-peer marketplace payments: sellers attach a UPI/payment QR to their profile, buyers scan and mark "paid," sellers confirm receipt — no payment gateway needed, FittTrack never touches the money
- [x] **Phase 11** — Notifications: bell icon with live unread badge, fires on workout logged, water goal hit, and order/payment status changes *(this phase)*
- [ ] Phase 12 — Final polish, accessibility, testing, deployment

## Peer-to-peer marketplace payments (Phase 10.7)

Since this app never touches real money, payment happens directly between buyer and seller:

1. Seller adds their UPI/payment QR code (an image URL) once, on their **Profile** page — reused for every listing they create.
2. Buyer checks out normally. Catalog items (the 12 seeded products with no real seller) confirm instantly. User-listed items start `AWAITING_PAYMENT`.
3. Buyer sees the seller's QR on the order confirmation screen, pays externally, clicks "I've sent the payment" → `PAYMENT_SENT`.
4. Seller sees it on their **My Sales** page, clicks "Confirm payment received" → `CONFIRMED`.
5. An order's overall status is always a rollup of its items' statuses — never tracked independently, so it can't drift out of sync.

Every step enforces who's allowed to do what (buyer can't confirm their own payment; seller can't fake "sent" on the buyer's behalf) — verified with a dedicated test suite before shipping.

## Notifications (Phase 11)

`server/utils` has nothing new here — Phase 11 reuses the exact same routes → controller → service → Prisma pattern as every other feature. The one new idea: other services (`orderService`, `workoutService`, `nutritionService`) call `notifyUser()` as a **side effect** of something real happening, wrapped in its own try/catch so a failed notification insert can never break the actual action (an order still confirms even if the notification fails to save).

Triggers wired in: workout logged, daily water goal crossed (fires exactly once, not on every glass after), and order/payment status changes for both buyer and seller.

## Membership tiers (Phase 10.6)

| Plan | Listings | AI Meal Scanner | Analytics |
|---|---|---|---|
| FREE | 3 | ❌ | ❌ |
| PRO | 20 | ✅ | ✅ |
| PREMIUM | Unlimited | ✅ | ✅ |

- `server/utils/planLimits.js` is the single source of truth — every gate (server middleware, client UI) reads from it
- `server/middleware/requirePlan.js` checks the plan fresh from the database on every request, not from the JWT, so an upgrade takes effect immediately without re-login
- Upgrading is currently **simulated** (`POST /api/membership/upgrade` just sets the plan directly) — when real payments are added, only `membershipService.upgradePlan()` changes; every gate elsewhere stays identical

## AI Nutrition Integration architecture

```
React (photo upload) → Express (/api/nutrition-ai/analyze) → Python/FastAPI (/api/analyze) → Gemini
```

The React client never talks to the Python service directly - only Express does. This means the Python model/service can be swapped out later without touching any client code, since the client only knows about the Express contract.

Run the Python service separately (`cd` into wherever your `nutrition-app/backend` folder lives):
```
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
Express expects it at `PYTHON_AI_SERVICE_URL` in `server/.env` (defaults to `http://localhost:8000`).

## UI polish additions (Phase 10.5)

- **Toast system** (`context/ToastContext.jsx`) — call `useToast().showToast(message, type)` from any component. Replaces the old scattered inline "message" state that a few pages had.
- **CountUp** (`components/common/CountUp.jsx`) — animates a number counting up from 0. Used on dashboard stat cards and the landing page stat strip.
- **Reveal + useOnScreen** (`components/common/Reveal.jsx`, `hooks/useOnScreen.js`) — scroll-triggered fade-in, used on the landing page sections.
- **Achievements** (`services/achievementService.js` server + client, `components/dashboard/AchievementsWidget.jsx`) — badges computed live from real usage data (workout count, streak, meals logged, etc.) - no new database table, just threshold checks against existing tables.

## Design direction

The app switched from the original clean-white brief to a **dark navy theme with a glowing signal-blue accent** (client's choice, mid-project). Fonts: **Anton** for the landing page hero/brand, **Space Grotesk** for in-app headings, **Inter** for body text, **IBM Plex Mono** for stat readouts. Colors and fonts are all CSS custom properties in `client/src/styles/variables.css` — changing the palette again only requires editing that one file, since every component reads from those tokens rather than hardcoding colors.
# FITTRACK
