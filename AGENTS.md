# rihla-client — Context

> Auto-loaded when working here. Keep SHORT.
> Mid-task state: `read CONTEXT.md` (relevant section) first.

## What
The **live, functional** frontend. Next.js 16 + React 19, next-intl (i18n), Tailwind v4, Zustand, React Query, Leaflet, Recharts. Pages under `src/app/[locale]/`: auth, chat (SSE), explore/map, currency, safety, quests, wallet, profile, onboarding, tickets, admin.

## Run / test
- Dev: `npm run dev -- -p 3050` (port 3000 taken by Core) — first compile 60-75s on this FS
- Build: `npm run build` · start: `npm start` · lint: `npm run lint`
- Env: `NEXT_PUBLIC_CORE_API_URL=http://localhost:3000/api`, `NEXT_PUBLIC_SITE_URL=http://localhost:3050`

## External contract
- Talks to Core-Server (only gateway): `/auth`, `/chat[/stream]`, `/voice`, `/identify`, `/tokens`, `/payments`, `/journeys`, `/memory`, `/currency`, `/geo/...`, `/safety/...`, `/context-notifications/...`
- All geo/safety/notice traffic goes `coreClient` → Core → GIS proxy (no direct GeoContext calls)
- Auth: JWT via Zustand store; axios 401 → auto-refresh (`/auth/refresh` cookie) → retry; logout on failure

## Key files
- `src/lib/api/*.ts` (client, chat, auth, geo, safety, wallet, journeys, admin, currency)
- `src/lib/stores/*.ts` (auth, chat, geo, ui) · `src/lib/i18n/`
- `src/app/[locale]/**/page.tsx` (pages) · `src/components/**` (ui)
- `src/middleware.ts` (i18n/locale routing)

## Standing rules (enforced reflex)
1. At the end of every task, append a 3–6 line checkpoint to `CONTEXT.md`.
2. At session start, `read` the needed `CONTEXT.md` section before working.
3. Only read sections — never dump whole files into replies.
4. Never commit/log `.env`/`.env.local` secrets.