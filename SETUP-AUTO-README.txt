FOREVER - 1-CLICK SETUP (Windows)
================================

1. Copy SETUP-AUTO.bat and SETUP-AUTO.ps1 into your existing
   forever-mern-project folder (same place as package.json).
2. Double-click SETUP-AUTO.bat.
3. Follow prompts. The script automatically creates .env files,
   generates a secure JWT secret, and uses/installs dependencies.
4. Only type your admin email and a private admin password locally.
5. If MongoDB is already running on your laptop, it uses it.
   Otherwise, you will need to create an Atlas free database and
   paste its driver URI into the prompt (hidden input).
6. Stripe test mode is optional. To use it, create a legitimate Stripe
   test account and enter your sk_test_ key LOCALLY at the prompt.
7. Once MongoDB connects, the script seeds sample products, then
   starts all three services.

IMPORTANT:
- Never send anyone backend/.env, JWT_SECRET, ADMIN_PASSWORD,
  STRIPE_SECRET_KEY, or MongoDB connection credentials.
- This script only configures your local development environment.
  It cannot create accounts, bypass sign-ins, or deploy on its own.
- Do not run setup scripts you haven't reviewed or don't trust.
- Rerunning setup keeps existing .env values; it does not overwrite
  your configured credentials or products.
- Stripe webhook setup is described in the full project README.
- If MongoDB Atlas connection fails, confirm Database Access,
  Network Access (your current IP), and the URL-encoded password.
