# WP B2B — Ordering & Stock Management

A production-quality B2B ordering web app. Mobile-optimized, deployable via Vercel.

## Features

- **Login** with email + password, session persistence
- **Product Catalog** — search, category filter, sort by name/price/stock/delivery
- **Product Detail** — variants (size/color/package), quantity selector, live pricing
- **Cart / Current Order** — quantity controls, totals, submit
- **Order Confirmation** — order number, summary, delivery estimate
- **Order History** — status tracking, progress indicator
- **Account** — profile, stats, logout

## Demo Credentials

| Email | Password |
|---|---|
| buyer@acmecorp.com | password123 |
| procurement@globex.com | password123 |

## Quick Start (Local)

**Requirements:** Node.js 18+ (download from nodejs.org)

```bash
cd /Users/lironbar/Documents/wp-mobile/wp-b2b-app
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Deploy to Vercel (Free — Get a Public Link)

1. Create a free account at **github.com**
2. Create a new repository (click +, then "New repository"), name it `wp-b2b-app`
3. Run these commands in Terminal:

```bash
cd /Users/lironbar/Documents/wp-mobile/wp-b2b-app
git init
git add .
git commit -m "Initial B2B app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wp-b2b-app.git
git push -u origin main
```

4. Go to **vercel.com**, sign in with GitHub
5. Click "Add New Project" → select `wp-b2b-app`
6. Click **Deploy** — no configuration needed
7. You get a URL like: `https://wp-b2b-app.vercel.app`

That URL works on any phone or browser. Share it with anyone.

## Architecture

```
app/                     # Next.js pages (App Router)
├── (auth)/login/        # Login screen
├── (app)/catalog/       # Product catalog + detail
├── (app)/cart/          # Cart / current order
├── (app)/orders/        # Order history + detail + confirmation
└── (app)/account/       # Account / profile

src/
├── api/                 # Mock API (replace with real backend later)
│   ├── mockData.ts      # 10 B2B products, 3 sample orders
│   ├── authApi.ts       # login / logout
│   ├── productsApi.ts   # fetch products, filter, sort
│   └── ordersApi.ts     # submit order, order history
├── store/               # Zustand state
│   ├── authStore.ts     # session + localStorage persistence
│   └── cartStore.ts     # cart items + totals
├── features/            # TanStack Query hooks
│   ├── auth/useAuth.ts
│   ├── products/useProducts.ts
│   └── orders/useOrders.ts
├── components/          # UI components
│   ├── ui/              # Button, Badge, Input, etc.
│   ├── layout/AppShell.tsx
│   ├── products/ProductCard.tsx
│   └── orders/OrderCard.tsx
└── types/index.ts       # All TypeScript types
```

## Connecting to a Real Backend

All mock API calls are in `src/api/`. Replace the `mockRequest()` calls with `fetch()` or `axios` calls to your real API endpoints. The types in `src/types/index.ts` define the expected data shapes.

## Adding Manager/Admin Features

Look for `// TODO (manager/admin):` comments throughout the codebase — these mark exactly where admin logic should connect.
