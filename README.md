# Red & Green Exercise Tracker

A Next.js (App Router) Progressive Web App for recording energy-giving (Green) and energy-draining (Red) activities, selecting weekly best/worst highlights, and writing structured reflections. Built with responsiveness, offline-first behaviour, and Supabase-backed persistence in mind.

## Tech Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS for styling
- Supabase (PostgreSQL + Auth) for data & authentication
- React Query + server actions for data flows
- Vitest + Testing Library for unit tests, Playwright for E2E smoke tests
- PWA: service worker + web manifest (installable/offline ready)

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- Anon key is required client-side for auth (`createSupabaseBrowserClient`).
- Service role key is used only in server actions for privileged operations.

## Supabase Setup

1. Create a new Supabase project.
2. Apply the schema:
   ```bash
   psql $SUPABASE_DB_URL -f supabase/schema.sql
   ```
3. Apply row-level security policies:
   ```bash
   psql $SUPABASE_DB_URL -f supabase/policies.sql
   ```
4. (Optional) Insert seed data for local testing:
   ```bash
   psql $SUPABASE_DB_URL -f supabase/seed.sql
   ```
5. Enable email/password and Google OAuth in Supabase Auth (callback URL: `${NEXT_PUBLIC_APP_URL}/auth/callback`).

## Key Features

- **Quick entry modal**: 1-step record with Green/Red toggle, energy scale, tags, and duration.
- **History view**: filter by period/type/tags, edit & delete records inline.
- **Weekly hub**: pick Green Best 5 / Red Worst 5 with hypotheses, fill 3 reflection questions, view summary KPIs.
- **Dashboard**: weekly/monthly analytics (energy distribution, ratios, top tags) plus data export/import tools.
- **Export/Import**: JSON export via `/api/export`, import & merge via `/api/import`.
- **PWA**: installable, offline caching through `public/service-worker.js`. Service worker auto-registers via `PwaProvider`.

## Testing

- Unit tests: `npm run test`
- E2E smoke (requires running dev server):
  ```bash
  npx playwright install
  npm run test:e2e
  ```

Test utilities live in `tests/` with Vitest configuration in `vitest.config.ts`.

## Project Structure Highlights

```text
app/
  (app)/        // Authenticated UX (home, history, weekly, dashboard)
  auth/         // Sign-in flow + Supabase callback
  api/          // JSON export/import endpoints
public/         // PWA assets, icons, service worker
src/
  components/   // UI primitives + feature components
  hooks/        // Zustand filter store helpers
  lib/          // Supabase clients, utils, constants, types
  server/       // Server actions (Supabase queries & mutations)
supabase/       // SQL schema, RLS policies, seed data
tests/          // Vitest unit tests & Playwright E2E specs
```

## Deployment Notes

- Vercel + Supabase recommended. Set the env variables in Vercel dashboard; enable the service worker by ensuring `public/service-worker.js` is served.
- For local HTTPS testing (PWA install prompts), consider using `next dev --turbo` behind a tool like `mkcert` or deploy to staging.

## Next Steps / Ideas

- Add AI-powered strength/weakness suggestions.
- Calendar integrations (Google/Apple) for auto-drafting entries.
- Shared team/household reflections with role-based access.
- Richer charting (e.g., area charts via `@visx` or `recharts`).
