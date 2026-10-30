# FOREVER | Premium MERN E-commerce — Portfolio Project

## Free full-stack deployment (Netlify)

**Current portfolio hosting:** one Netlify Free site hosts the React storefront at `/`, React admin at `/admin`, and Express + MongoDB API at `/api` via Netlify Functions. The app builds with `npm run build:netlify`, configured in `netlify.toml`.

**[Netlify deployment and safety instructions](./DEPLOY-NETLIFY.md)** · [Netlify's Express Functions guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/)

> Status: public Netlify site deployed. The project owner reports successful API health, products, admin login and a **complete customer COD checkout → Admin Orders visibility** test. Fulfillment status updates, Stripe test payments and security review are still pending. These results are user-reported, not independently automated end-to-end tests. Local Windows development still uses `npm run dev` unchanged.


[![Source checks](https://github.com/msuhaim491/forever-mern-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/msuhaim491/forever-mern-ecommerce/actions/workflows/ci.yml)

**Repository:** [GitHub source](https://github.com/msuhaim491/forever-mern-ecommerce) · **Public demo:** [Open storefront](https://forever-mern-suhaim491.netlify.app/) · [Admin login](https://forever-mern-suhaim491.netlify.app/admin) · **Validation:** CI passed; owner-verified COD order creation and Admin Orders display. [Live test report](./TESTING.md). Stripe payments and fulfillment transitions still need testing.

> **Status:** learning project / development build. Full end-to-end build and hosted payment integration have not yet been independently verified.

**Portfolio publishing and validation checklist:** [PORTFOLIO-PUBLISHING.md](./PORTFOLIO-PUBLISHING.md)


An independent educational implementation inspired by [GreatStack's Full Stack E-commerce MERN tutorial](https://www.youtube.com/watch?v=7E6um7NGmeE). This is **not** a copy of the creator's source code or licensed artwork. Frontend visuals are inspired by a minimalist fashion store, with editable sample product data and externally hosted Unsplash photos.


## Premium Edition V2 — UI and motion

This release upgrades the original recreation with a new fashion-editorial hero, animated collection marquee, functioning Women/Men/Kids category cards, latest and bestseller product sections, product hover discovery affordances, editorial feature block, campaign callout, subtle page transition, sticky translucent header, keyboard-visible focus outlines, and upgraded admin interactions. Animations use CSS and the browser IntersectionObserver rather than a new animation package, and respect `prefers-reduced-motion`. All MongoDB, user accounts, cart, order, and Stripe/COD APIs remain unchanged.

**How to update an existing Windows setup without losing your database:** Back up the project folder, then replace only `frontend/src/` and `admin/src/style.css` from this ZIP in your existing folder (or copy the full ZIP content over the old source but DO NOT replace your existing `.env` files). No database migration is required. In the terminal at the project root, run `npm run dev` if the servers are stopped, or refresh the browser (Ctrl+F5). The Windows auto-setup scripts are also included for fresh installs.

**Compared to GreatStack's tutorial:** core user flows are similar, but the layout is independently designed, not pixel-identical. The tutorial includes Razorpay in addition to Stripe/COD; this implementation does not. This project is not GreatStack's source code.

## What's included

| Component | Tech | Local URL |
|---|---|---|
| Customer storefront | React, Vite, React Router, CSS | http://localhost:5173 |
| Admin dashboard | React, Vite, CSS | http://localhost:5174 |
| REST API | Node.js, Express, Zod, JWT | http://localhost:5000 |
| Database | MongoDB, Mongoose | mongodb://127.0.0.1:27017/forever_store |
| Payments | Stripe Checkout + verified webhook; COD | Stripe credentials required for card payments |

**Customer features:** register/login, responsive home page, latest collections, best sellers, category/type filters, sorting, search, product image gallery, sizes, cart, delivery form, COD checkout, Stripe-hosted card payment, payment confirmation and personal order history.

**Admin features:** admin login, dashboard KPIs, add/edit/hide products, multi-image upload or image URLs, featured products, customer orders and fulfillment status updates.

### Important distinctions
- Tutorial also includes **Razorpay**; this recreation intentionally implements **Stripe and cash on delivery** as requested. Razorpay is **not included**.
- Newsletter subscription and displayed brand/contact details are visual placeholders; no email service is connected.
- Admin's 'recognized sales' KPI counts Stripe-paid orders and delivered COD orders, not all unpaid orders.
- No inventory counts, discounts, tax calculator, real shipping integrations, or automatic Stripe refunds are included. These must be added before using the system commercially.
- Store prices use **USD** by default. `STRIPE_CURRENCY` should stay `usd` unless you update prices and storefront currency formatting consistently. `DELIVERY_FEE` defaults to `$10`; update the frontend cart totals if you change it.
- The product images come from Unsplash remote URLs (internet required to see sample photos). You can replace them in Admin.

## Requirements (Windows 10/11 supported)

1. **Node.js 20+**: https://nodejs.org/
2. **MongoDB**: install local MongoDB Community Server (service must be running), OR create MongoDB Atlas free cluster: https://www.mongodb.com/cloud/atlas
3. **Stripe account (Test Mode)** for online payments: https://dashboard.stripe.com/
4. VS Code recommended: https://code.visualstudio.com/

No Git or cloud deployment is needed for local development. Your MongoDB Atlas deployment should allow your IP, **not** broadly allow the internet unless necessary for a short-lived development test.

## Automatic setup on Windows (recommended)

If you want fewer manual steps, double-click **`SETUP-AUTO.bat`** from the extracted project folder. It will:

1. Create the three `.env` files without overwriting existing settings.
2. Generate a cryptographically random JWT secret and ask you privately for the admin email/password.
3. Detect local MongoDB, or accept an Atlas URI from you on your own computer.
4. Optionally accept a valid Stripe **test** secret key, run dependency installation if needed, check the backend, seed products, and launch all three services.

You still need to sign in and create your own MongoDB Atlas account/cluster if there is no local MongoDB. Stripe test/live account eligibility and webhook configuration are separate. **Never share `.env`, passwords, or secret keys in a chat.** See `SETUP-AUTO-README.txt` for details.

## Setup — one-time

### 1. Extract ZIP and install dependencies

Open the `forever-mern-project` folder in VS Code. Open terminal (Ctrl+`) and run:

```powershell
npm install
```

This installs dependencies for all 3 npm workspaces.

### 2. Create your environment files

**Windows PowerShell:**

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item admin/.env.example admin/.env
```

**macOS / Linux:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
```

Open `backend/.env` and replace:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/forever_store
JWT_SECRET=your_unique_very_long_random_secret_at_least_32_characters
ADMIN_EMAIL=youradmin@example.com
ADMIN_PASSWORD=your_private_strong_password_12_chars_or_more
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
PUBLIC_API_URL=http://localhost:5000
PORT=5000
DELIVERY_FEE=10
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
STRIPE_CURRENCY=usd
```

Generate a random JWT secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

If you don't have Stripe keys yet, **leave both Stripe variables blank**. Cash on Delivery will work. Keep `.env` out of GitHub; `.gitignore` excludes it.

**Pakistan / Stripe eligibility:** As of October 2026, Pakistan is not on the [official Stripe supported-country list](https://stripe.com/global). Live card processing requires a legitimate Stripe account for an eligible business in a supported jurisdiction; do not use a false address or identity. For a Pakistan-only production store, choose a locally supported gateway (not implemented here), or use COD for learning. The code still supports Stripe **test mode** with valid test credentials.

**MongoDB Atlas alternative:** Replace `MONGODB_URI` with the `mongodb+srv://...` connection string copied from Atlas's Drivers page. Add a database user and permit your own IP in Network Access. If using local MongoDB, verify the MongoDB Windows service is running.

### 3. Create administrator and load sample products

```powershell
npm run seed
```

This creates the admin account **only if it does not exist** and populates 18 starter products **only if the collection is empty**. The password is hashed with bcrypt. To change an existing admin password, edit it securely in the database or create another development database; rerunning seed does not replace its password.

### 4. Run all three services

```powershell
npm run dev
```

Open:

- Customer shop: http://localhost:5173
- Admin: http://localhost:5174 (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Backend health test: http://localhost:5000/api/health

For individual terminals:

```powershell
npm run dev -w backend
npm run dev -w frontend
npm run dev -w admin
```

## Stripe card payments: complete TEST MODE instructions

1. Sign in to your Stripe Dashboard and turn on **Test mode**.
2. Under **Developers > API keys**, copy **Secret key** (`sk_test_...`) into `backend/.env` as `STRIPE_SECRET_KEY` (never in frontend or admin env).
3. Install the official [Stripe CLI](https://docs.stripe.com/stripe-cli) and authenticate:

   ```powershell
   stripe login
   ```

4. Start the backend (`npm run dev`). In another terminal run:

   ```powershell
   stripe listen --forward-to localhost:5000/api/stripe/webhook
   ```

5. Copy the displayed `whsec_...` signing secret to `STRIPE_WEBHOOK_SECRET` in `backend/.env`. **Restart backend** after editing .env.
6. Register a customer at http://localhost:5173, add a product with size, go to Checkout, complete address and choose Stripe.
7. Stripe's **test card** is `4242 4242 4242 4242`; use any future valid expiry and any 3-digit CVC. Never use a real card in test mode.
8. Successful payment returns to `/payment-result?session_id=...`. Backend validates the session with Stripe and marks the order `paid`. Webhook also verifies the signature before marking an order paid. Check **My Orders** or admin **Orders**.

Use **webhook endpoint HTTPS URL** from Stripe Dashboard and production signing secret when you deploy the API. Do not reuse Stripe CLI's local secret in production. **Do not fulfill Stripe orders unless paymentStatus is `paid`.** Abandoned checkout sessions remain as `unpaid` pending orders.

## REST API routes

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/health` | public |
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | signed-in |
| GET | `/api/products` | public |
| GET | `/api/products/:id` | public |
| GET | `/api/products/admin/all` | admin |
| POST, PUT, DELETE | `/api/products`, `/api/products/:id` | admin |
| GET, PUT | `/api/cart` | signed-in |
| POST | `/api/orders` | signed-in |
| GET | `/api/orders/mine` | signed-in |
| GET | `/api/orders/verify-session?session_id=...` | signed-in |
| GET | `/api/orders/admin/all`, `/api/orders/admin/stats` | admin |
| PATCH | `/api/orders/admin/:id/status` | admin |
| POST | `/api/stripe/webhook` | verified Stripe signature |

Backend recalculates totals from MongoDB product prices, validates product sizes, uses JWT authorization on protected API routes and verifies Stripe status server-side. Never trust amounts supplied by the browser.

## Folder structure

```text
forever-mern-project/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   ├── models/{User,Product,Order}.js
│   │   ├── routes/{auth,products,cart,orders}.js
│   │   ├── utils/security.js
│   │   └── index.js
│   ├── scripts/seed.js
│   ├── uploads/                  # local product uploads
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/{components,context,pages}/
│   ├── src/App.jsx, src/style.css
│   ├── .env.example
│   └── package.json
├── admin/
│   ├── src/{components,pages}/
│   ├── src/App.jsx, src/style.css
│   ├── .env.example
│   └── package.json
├── package.json                  # npm workspaces
└── README.md
```

## Build and deployment notes

```powershell
npm run check
npm run build
```

Vite generates `frontend/dist` and `admin/dist`. Deploy them as separate static sites, configured with `VITE_API_URL=https://your-backend-domain`. Set frontend and admin origin URLs in backend environment (CORS). React Router needs SPA fallback rewrites to `index.html`. Deploy Express to a Node host with MongoDB Atlas, HTTPS and persistent file storage or migrate uploaded images to Cloudinary/S3 (local `uploads/` folders are ephemeral on many serverless providers). Configure Stripe's production signing secret and webhook.

**Before production** add cookies/CSRF policy if moving auth away from localStorage, tax and shipping calculations, inventory/stock safety, fraud monitoring, upload file-signature checks, user password reset/email verification, explicit refunds, privacy policy, and integration tests. The provided app is a functional **learning project**, not audited production software.

## Troubleshooting

- **Mongo connection error:** Start MongoDB service, verify Atlas username/password and allow your IP. Ensure database URL in backend/.env is valid.
- **JWT_SECRET error:** Copy the env template and set a 32+ character secret.
- **Admin login blocked:** Run `npm run seed` once and sign in using the exact configured email and password; customers cannot become admins by registering.
- **Products missing:** Run `npm run seed` against the same MongoDB URI as the backend.
- **Stripe not configured:** Leave Stripe blank and use COD, or follow Stripe test steps above.
- **Stripe payment still unpaid:** Run `stripe listen`, verify `whsec_...` matches and use the success page to reconcile. Check Stripe Dashboard for successful payment.
- **CORS:** `CLIENT_URL` and `ADMIN_URL` must match your browser's origin, including port; restart backend after edits.
- **Images not visible:** Seeded images are remote Unsplash URLs; verify internet connectivity or add your own photos via Admin.

## Acknowledgment

Tutorial reference: GreatStack, *Create Full Stack E-commerce Website Using React JS | MERN Stack eCommerce Project with Stripe* (published September 13, 2024), https://youtu.be/7E6um7NGmeE.

This codebase is an original recreation for educational use and is not affiliated with GreatStack or Stripe.
