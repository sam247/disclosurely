# Disclosurely Next.js (Public Site)

- App Router, Tailwind, strict TS.
- Uses rewrites to forward `/dashboard`, `/app`, `/onboarding` to the Vite dashboard deployment (configure `NEXT_PUBLIC_DASHBOARD_ORIGIN` if the default does not match).
- Keep the migration checklist in `.cursor/plans/vite_to_next.js_migration_c12cf2c2.plan.md`.

## Scripts
- `npm run dev` — local dev (defaults to port 3000).
- `npm run build` — production build.
- `npm run start` — start built app.
- `npm run lint` — Next.js lint rules.

## Env
Copy the relevant `VITE_` values as `NEXT_PUBLIC_` equivalents in `.env.local` (Supabase URL/key, Contentful tokens, Sentry, Stripe publishable key, etc.). Set `NEXT_PUBLIC_DASHBOARD_ORIGIN` to the deployed Vite dashboard URL if different from the default.

