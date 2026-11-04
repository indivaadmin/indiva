# Indiva 🇮🇳 — Made-in-India e-commerce store

A complete storefront for the **Indiva** business, built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS**, deployable to **Vercel** with one click. Frontend and backend live in a single project: the backend is a set of Next.js API routes (`app/api/*`). The theme is Indian — saffron & green palette, tricolor accents, prices in ₹.

## Accounts & roles

| Role | Who | How the account is created |
|---|---|---|
| 👑 **Founder (owner / super admin)** | You | Seeded automatically — sign in with `INDIVA_FOUNDER_EMAIL` (default `indiva.founder@gmail.com`) / `INDIVA_FOUNDER_PASSWORD` (default `1234678`). Change via env vars on Vercel. |
| 🛠 **Admin** | Your staff | **Only the founder can assign admin accounts** — from the Admin panel → Team tab (`POST /api/users` requires a founder token). Public sign-up can never create an admin. |
| 🛍 **Customer** | Shoppers | Self sign-up at `/signup` (creates customer accounts only). |

Sign in at `/signin`. The session is a Bearer token sent as `Authorization: Bearer <token>` on API calls.

## Three experiences, three pages

| Page | Route | Access | What you can do |
|---|---|---|---|
| 🛍 Customer storefront | `/` | Public | Browse/search/filter products, suggestions, cart, checkout (places a real order) |
| 👑 Founder dashboard | `/founder` | Founder only | Revenue/orders/customers KPIs, 14-day revenue chart, top products, category revenue, insights |
| 🛠 Admin panel | `/admin` | Admin or founder | Publish/edit/delete products, manage order status, view customers; **founder also manages the team (create/remove admins)** |

## No sample data

The store starts **empty** — no demo products, orders or customers. Real data appears only when the founder/admin publishes products (`POST /api/products`) and customers place orders. The only seeded record is the founder account above.

## Backend API

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create a **customer** account |
| POST | `/api/auth/signin` | Public | Sign in → `{ token, user }` |
| POST | `/api/auth/signout` | Auth | Invalidate session |
| GET | `/api/auth/me` | Auth | Current user |
| GET/POST | `/api/users` | **Founder only** | List accounts / create **admin** account |
| DELETE | `/api/users/[id]` | **Founder only** | Remove an admin (founder protected) |
| GET | `/api/products` | Public | List (filter `?q=`, `?category=`, `?featured=1`) |
| POST | `/api/products` | Admin/founder | Publish a product |
| GET/PUT/DELETE | `/api/products/[id]` | Public / Admin+ | Read (+suggestions) / update / delete |
| GET | `/api/orders` | Admin/founder | List orders |
| POST | `/api/orders` | Public | Place an order (validates stock) |
| GET/PATCH | `/api/orders/[id]` | Admin+ | Read / update status |
| GET | `/api/customers` | Admin/founder | Customer rollup |
| GET | `/api/analytics` | **Founder only** | Dashboard metrics |
| GET | `/api/suggestions` | Public | Product suggestions (`?productId=`) |

### Data layer

`lib/db.ts` is an in-memory store seeded only with the founder account. On Vercel each serverless instance keeps a warm copy. To persist data across instances, swap `lib/db.ts` for Vercel Postgres / KV — the routes and UI need no changes.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build & start:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo — Next.js is auto-detected (`vercel.json` is included).
3. In the Vercel project → **Settings → Environment Variables**, set:
   - `INDIVA_FOUNDER_EMAIL` = `indiva.founder@gmail.com`
   - `INDIVA_FOUNDER_PASSWORD` = your new strong password (change it from the default!)
4. Click **Deploy**. No database required to get started.

Or from the CLI:

```bash
npm i -g vercel
vercel --prod
```

## Project structure

```
app/
  page.tsx            Customer storefront (cart, checkout, suggestions)
  signin/page.tsx     Sign in
  signup/page.tsx     Customer sign up
  founder/page.tsx    Founder dashboard (founder only)
  admin/page.tsx      Admin panel + team management (admin/founder)
  api/                Backend: auth, users, products, orders, customers, analytics, suggestions
components/           Navbar, ProductCard
lib/                  types, db (data layer), auth (guards), auth-context, client fetch helper
```
