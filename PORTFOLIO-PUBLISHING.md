# FOREVER — Publishing checklist

This is an independent learning implementation inspired by GreatStack's tutorial, not the original creator's code or licensed product images.

Before making the repository public:

- [ ] Confirm `.env`, MongoDB connection strings, Stripe secrets, passwords, and customer data are NOT present in the Git history.
- [ ] Install dependencies, run `npm run check`, and fix any installation/build failures.
- [ ] Run the app with a local or Atlas MongoDB instance; verify customer auth, product browsing, shopping cart, COD checkout, admin order management.
- [ ] Test Stripe in **test mode** with a test key and validated webhook; never commit credentials.
- [ ] Confirm responsiveness and accessibility at phone, tablet, and desktop sizes.
- [ ] Replace remote placeholder photographs with images you have permission to distribute. Update branding and copy.
- [ ] Take real screenshots of the working store and admin pages; do not claim mockups are screenshots.
- [ ] Deploy backend with HTTPS, real domain and secure CORS settings. Set environment variables in hosting dashboard, not Git.
- [ ] Deploy frontend and admin, set API URLs, check checkout redirects and SPA fallbacks.
- [ ] Add live demo URL to repository About and README, then feature it on profile.

**Status:** JS/JSX source syntax reviewed in previous steps; full dependency installation, end-to-end runtime and deployed integrations NOT verified in this environment. This is a portfolio learning project, not a production-audited commerce solution.
