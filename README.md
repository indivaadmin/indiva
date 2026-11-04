# Indiva — full-stack e-commerce store

A complete storefront for the **Indiva** business, built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS**, deployable to **Vercel** with one click. Frontend and backend live in a single project: the backend is a set of Next.js API routes (`app/api/*`).

## Three experiences, three pages

| Page | Route | For | What you can do |
|---|---|---|---|
| 🛍 Customer storefront | `/` | Shoppers | Browse/search/filter products, see **suggested products**, add to cart, checkout (places a real order) |
| 👑 Founder dashboard | `/founder` | The founder | Revenue/orders/customers KPIs, 14-day revenue chart, top products, revenue by category, order pipeline, insights |
| 🛠 Admin panel | `/admin` | Store admins | Create/edit/delete products, change order status, view customers & spend |

## Backend API

| Method | Route | Purpose |
|---|---|---|
| GET/POST | `/api/products` | List (filter via `?q=`, `?category=`, `?featured=1`) / create products |
| GET/PUT/DELETE | `/api/products/[id]` | Read (+ related `suggestions`) / update / delete a product |
| GET/POST | `/api/orders` | List orders / place an order (validates stock, decrements it) |
| GET/PATCH | `/api/orders/[id]` | Read order / update status (`pending → processing → shipped → delivered / cancelled`) |
| GET | `/api/customers` | Customer rollup (orders, total spent) |
| GET | `/api/analytics` | Aggregated metrics for the founder dashboard |
| GET | `/api/suggestions` | Product suggestions (`?productId=` for "customers also bought" style) |

### Data layer

`lib/db.ts` is a seeded in-memory store. On Vercel each serverless instance keeps a warm copy, so the API is fully functional out of the box. To persist data across instances, swap `lib/db.ts` for Vercel Postgres / KV / Blob — the routes and UI need no changes.

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
3. Click **Deploy**. No environment variables are required.

Or from the CLI:

```bash
npm i -g vercel
vercel --prod
```

## Project structure

```
app/
  page.tsx            Customer storefront (cart, checkout, suggestions)
  founder/page.tsx    Founder dashboard (analytics)
  admin/page.tsx      Admin panel (product/order/customer management)
  api/                Backend: products, orders, customers, analytics, suggestions
components/           Shared UI (ProductCard, formatting)
lib/                  Types + data layer (db.ts)
```
