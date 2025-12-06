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
Create `nextjs-app/.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_KEY`
- `NEXT_PUBLIC_DASHBOARD_ORIGIN` (your Vite dashboard URL)
- `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`
- `CONTENTFUL_DELIVERY_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN` (optional)

Copy the existing `VITE_` values as `NEXT_PUBLIC_` equivalents. Without Supabase/Contentful vars, server helpers will fail fast to avoid silent misconfigurations.

