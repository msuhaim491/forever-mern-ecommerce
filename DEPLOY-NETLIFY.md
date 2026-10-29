# FOREVER: free Netlify full-stack portfolio demo

**Plan:** One Netlify Free site serves the **storefront** at `/`, the **admin** at `/admin`, and the **Express + MongoDB API** at `/api` using Netlify Functions. A single deploy reduces credits compared with maintaining three separate sites.

This is a **learning/portfolio demo**, not a production store. Netlify's free plan offers 300 credits/month with a hard cap and no automatic paid recharge. If the credits run out, service pauses until the next billing cycle. See [official Netlify pricing](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/).

## Step 1: create the Netlify Free account

1. Open https://app.netlify.com/signup and choose **Sign up with GitHub**.
2. Connect your GitHub account `msuhaim491` and grant access to `forever-mern-ecommerce`.
3. Select **Add new project > Import an existing project > GitHub**.
4. Select `msuhaim491/forever-mern-ecommerce` on `main`.
5. Make sure **Base directory is empty/root** (do not select frontend or backend as the base).
6. The checked-in `netlify.toml` configures:
   - Build command: `npm install && npm run build:netlify`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`

## Step 2: add private environment variables (Netlify dashboard only)

Go to **Project configuration > Environment variables** and enter these using the dashboard (not in GitHub or chat):

- `MONGODB_URI`: copy the Atlas connection string from your own secure local `backend/.env`. This must reference a **dedicated test/demo database** and use a dedicated DB user.
- `JWT_SECRET`: create a secure random string (64+ characters). Generate in your own Windows terminal using `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- `NODE_ENV`: `production`
- `DELIVERY_FEE`: `10`
- `STRIPE_CURRENCY`: `usd`

Optional only when you have valid **Stripe test-mode** keys:
- `STRIPE_SECRET_KEY`: `sk_test_...`
- `STRIPE_WEBHOOK_SECRET`: `whsec_...` (configure a webhook endpoint at `https://YOUR-SITE.netlify.app/api/stripe/webhook`)
- `CLIENT_URL`: `https://YOUR-SITE.netlify.app` (Netlify `URL` is used as fallback automatically)
- `ADMIN_URL`: same site origin (for cross-origin restrictions)
- `PUBLIC_API_URL`: same site origin (only needed if using local disk uploads; **uploads are disabled** in Netlify functions)

**Environment scope:** Netlify Functions need `MONGODB_URI` and `JWT_SECRET` at **runtime**, not just during build. Apply to the Functions scope or all scopes. If you update variables after the first deploy, trigger a new deploy.

### Database: important network access note

Netlify Functions do not offer dedicated static outbound IPs on the Free plan, so Atlas cannot generally restrict them to one predictable address. For a portfolio demo, use a **separate sample-data database** with a unique restricted DB user, strong password, and no sensitive customer data. If absolutely necessary to connect from dynamic Netlify egress, allow Atlas inbound `0.0.0.0/0` **only for this isolated demo**, monitor and restrict it when practical. Do not open your production Atlas cluster or use a privileged shared DB user.

If your Windows project already seeded sample data, ensure `MONGODB_URI` uses the same demo database. Otherwise run the existing **local** `npm run seed` command with that demo URI; the Netlify build intentionally does not seed using private credentials.

## Step 3: deploy and verify

Netlify should build automatically on pushes to `main`. A successful build is **not** proof that MongoDB and checkout work.

Check:
1. `https://YOUR-SITE.netlify.app/api/health` returns `{"status":"ok","service":"Forever API"}`.
2. `https://YOUR-SITE.netlify.app/api/products` returns sample products (tests Atlas access).
3. Storefront homepage shows products from the API.
4. `https://YOUR-SITE.netlify.app/admin` opens admin, using existing Atlas admin credentials.
5. Register a fake user and place a test **COD** order. Check it appears in admin.
6. Only if Stripe test keys exist, configure a signed Stripe webhook and test the checkout/return flow using test card data.

## Known limitations for public demos

- Local product uploads are intentionally unavailable in serverless mode: admin should use **external HTTPS image URLs**. Netlify Functions do not persist uploaded files.
- Stripe is optional and **not live** unless test credentials and webhook are configured.
- No real customer PII, real orders or real card data should be used.
- This free plan has credit limits and no guarantee of uptime. Use production services and persistent object storage for a real business.
- Netlify's Express integration uses `serverless-http`; see the [official Netlify guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/).

**Do not claim the app is live until the URL and API tests succeed.** Keep the README status truthful.
