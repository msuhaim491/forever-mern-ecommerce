# Deploy FOREVER on Render (portfolio demo)

This repository includes a [Render Blueprint](./render.yaml) that defines 3 services:
1. `forever-mern-msuhaim491-api` — Node/Express API (free web service)
2. `forever-mern-msuhaim491-shop` — React storefront (free static site)
3. `forever-mern-msuhaim491-admin` — React admin (free static site)

## Before deploying

- Sign in to [Render](https://dashboard.render.com/) and connect GitHub account `msuhaim491`. Grant repository access to `forever-mern-ecommerce`.
- From Render dashboard choose **New > Blueprint**, select this repository, and point it at `render.yaml`.
- Review the three services and keep the free plans (do not select a paid plan).
- When prompted enter **MONGODB_URI** (the Atlas connection string), **ADMIN_EMAIL**, and a **strong ADMIN_PASSWORD** (12+ characters).
- Render generates `JWT_SECRET` itself. Do not enter secrets in GitHub, a chat, or the repository.
- If you already seeded an admin with the same email locally against that Atlas database, use the **existing** admin password to sign in; running the idempotent seed script won't overwrite it.

## Database network access

MongoDB Atlas must allow the Render API's outbound IP addresses. Use the Render dashboard's **Connect > Outbound Bandwidth / outbound IPs** information (location depends on dashboard version), then add appropriate IP/CIDR entries in Atlas **Network Access**. IP addresses assigned by hosting providers may change. Avoid opening Atlas to `0.0.0.0/0` for a production database. For demonstration only, use a dedicated sample-data database, no real customer information, and restrict network access wherever possible.

## Initial URLs

These are the **expected** URLs if Render preserves the requested service names exactly:

- Store: https://forever-mern-msuhaim491-shop.onrender.com
- Admin: https://forever-mern-msuhaim491-admin.onrender.com
- API health: https://forever-mern-msuhaim491-api.onrender.com/api/health

**Verify the actual URLs in Render before sharing publicly.** If Render assigns different URLs, update backend `CLIENT_URL`, `ADMIN_URL`, and `PUBLIC_API_URL`, and both static services' `VITE_API_URL`. Redeploy all affected services.

## First-run verification

1. API health must show `{"status":"ok","service":"Forever API"}`.
2. API logs must show MongoDB connected and the sample product seed complete.
3. Store must show sample products from the API.
4. Register a test account (no real personal info) and add one product to cart.
5. Place a test **COD** order and confirm it in Admin. Never fulfill a fake order.
6. Confirm Admin sign-in and product listing.
7. Configure Stripe **test** keys only after COD works, then test payment & verified webhook. Do not use live Stripe credentials until merchant eligibility and production readiness are confirmed.

## Hosting limitations

Render free web services can spin down after 15 minutes idle and take time to restart. Their filesystem is ephemeral, so locally uploaded product images can disappear after restart/redeploy. Use external image URLs (sample data already does) or integrate durable object storage before real use. Do not store real orders/customer PII on this portfolio demo. The demo is not a production-ready e-commerce service.

For more details see the main [README](./README.md) and [portfolio checklist](./PORTFOLIO-PUBLISHING.md).
