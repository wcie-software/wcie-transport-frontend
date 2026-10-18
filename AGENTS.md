# Agent Knowledge Base

Living reference for any developer or AI agent working on **WCIE Transport**. Keep it updated when patterns or tooling evolve. Long-form context lives in `docs/` (ARCHITECTURE.md, AUTHENTICATION.md, SCHEMA.md, ROUTE_EDITOR.md, UI_UX.md) — mirror key changes here.

## Environment & Stack
- Next.js 16 App Router (server components + actions), React 19, Turbopack dev/build.
- Strict TypeScript (`tsconfig.json`): `strict`, `isolatedModules`, `jsx: react-jsx`, `@/*` alias.
- Tailwind CSS 4 via `@tailwindcss/postcss` + tokens in `src/app/globals.css`. Some MUI/Emotion widgets in admin tables.
- Firestore via typed helpers (`FirestoreHelper` client, `FirestoreAdminHelper` server). Zod schemas in `src/app/models` are runtime truth — every read goes through `safeParse`.
- Recharts for graphs, `@dnd-kit` for the assignments drag/drop editor, React Leaflet for maps, Google Places for address autocomplete, OR-Tools microservice for route optimization.
- Node ≥ 20. Firebase CLI for emulators.

## Commands
- Dev: `npm run dev` (Turbopack, hot reload).
- Build + verify: `npm run build` then `npm run start`.
- Tests: `npm test` (Vitest, single run) or `npm run test:watch`.
- Type-check: `npx tsc --noEmit`.
- Lint: `npx next lint --dir src` (no ESLint config yet — falls back to Next defaults). No Prettier; follow existing spacing/class order.
- Emulators: `npm run firebase` (Firestore + Auth). Set `FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST` in your shell and `NEXT_PUBLIC_DEBUG_URL` for client fetches to route to the emulator.
- Single test file: `npx vitest src/app/utils/util.test.ts` (or any matching glob).
- Add packages with `npm install --save-exact`; bundler resolution is `bundler` so prefer ESM-compatible builds.

## Testing
- Vitest is configured (`vitest.config.ts`, `npm test`). Tests live next to source: `src/**/*.test.ts(x)`.
- 22 tests currently cover the week primitives in `src/app/utils/util.ts` (see "Week model" below). Run `npm test` after any change to week helpers.
- No component/integration tests yet. When adding them, prefer Vitest; mock `firebase-admin` rather than running against real Firestore.
- Manual regression for new features: `npm run dev`, log in as admin + driver, exercise request submission, admin dashboard, driver pickups.

## Environment Variables
- Client (must be `NEXT_PUBLIC_*`): `NEXT_PUBLIC_DEBUG_URL`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_API_KEY`.
- Server-only: `GOOGLE_PLACES_API_KEY` (request address autocomplete).
- `.env.local` is git-ignored. Document any new key in this section the same PR that adds it.

## Week Model (CRITICAL — easy to get wrong)
- **Service Sunday S has submission window `[S-7 00:00, S 00:00)` in Edmonton time.** A request submitted any time during that 7-day window is for S.
- **Sunday morning submissions roll to the *next* Sunday.** So Jan 31 (Sun) → Feb 7 (Sun), not Feb 1.
- **All week primitives are timezone-anchored at noon MST (19:00 UTC)** so `Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton" })` reads the intended calendar date on any server. Do not reintroduce local-time `new Date()` arithmetic — the Vitest suite will catch it.
- All week boundaries and bucketing go through these helpers in `src/app/utils/util.ts`. Use them; do not inline:
  - `parseSundayKey("M-D-YYYY")` → Date at noon MST
  - `getServiceSunday(submissionDate)` → next service Sunday (+7 for Sun, +N for other days)
  - `getWeekStart(serviceSunday)` / `getWeekEnd(serviceSunday)` → noon-MST Dates for `[S-7, S)`
  - `getWeekRange(sunday)` / `getMultiWeekRange(first, last)` → `{ start, end }` `YYYY/MM/DD` strings for Firestore `>=` and `<` queries
  - `formatWeekLabel(serviceSunday)` → `"MMM DD, YYYY – MMM DD, YYYY"` (previous Sunday → Saturday)
  - `addEdmontonDays(date, days)` → adds calendar days in Edmonton time, returning a noon-MST Date. Use for all week arithmetic (`getWeekStart`/`getWeekEnd`/`getNearestSunday`/`getServiceSunday` are built on it).
- For the requests page and the reports page to agree on counts, both must bucket by `getServiceSunday(timestamp)` and use the same `getMultiWeekRange` / `getWeekRange` query bounds. The Vitest suite guards the primitives; both screens already use them.

## Firestore & Data Model Patterns
- Every collection lives in `FirestoreCollections` (`src/app/utils/firestore.ts`). Keep it in sync with `src/app/models`.
- Weekly artifacts (Schedules, Assignments) key by the canonical Sunday string `M-D-YYYY` (no padding). Schedule/Assignments docs use a numeric `timestamp` field; request docs use a `YYYY/MM/DD HH:MM:SS` string.
- Always pass the Zod schema into helper methods; `documentId` injection + validation happen automatically.
- Never persist `documentId` — helpers strip it, but double-check manual writes.
- Service numbers are numeric but appear as string keys in `Schedule.schedule`; coerce with `z.coerce.number()`.
- Use `defaultFormatter` (Edmonton tz) whenever you string-format dates for Firestore range filters.
- Schema parse failures should `console.warn(collection/docId, error)` and skip the row, not throw.
- Server components that read live Firestore data must `export const dynamic = "force-dynamic"` to skip static caching.

## Authentication & Middleware
- Session cookie: `wcie-transport-session`; admin gate: `wcie-transport-is-admin`. Both `secure` + `httpOnly` + `sameSite:"strict"` + `path:"/"`.
- Middleware at `src/proxy.ts` protects `/admin`, `/driver`, `/request`, injects `X-Auth-UID` header downstream, and routes invalid sessions back to `/admin` or `/login` (clearing cookies).
- Login helpers in `src/app/utils/login.ts` abstract Firebase Admin cookie creation. Reuse them — never duplicate token verification.
- Roles: `admin`, `driver`, `user`. Update claim checks and `docs/AUTHENTICATION.md` together when roles change.
- Users log in via Firebase phone auth; admins via email link. Both flow through `userLogin`/`adminLogin` in `src/app/utils/login.ts`.
- Server actions read `X-Auth-UID` from the header — never trust client-sent UID.

## Routing, Scheduling, Assignments
- OR-Tools microservice ingests `TransportRequest`, `Driver`, `Schedule` and writes optimized routes to `assigned-routes/{M-D-YYYY}`. One doc holds `routes[]` for all service numbers; per-service filtering at read time.
- Admins can override via the drag-and-drop editor (`docs/ROUTE_EDITOR.md`). Only transport requests are draggable; driver origin/depot nodes stay fixed.
- `saveCustomRoutes(timestamp, serviceNumber, routes)` overwrites only the matching service block; other services are preserved.
- Service 1 default: driver location → requests → origin. Other services: origin → requests → origin.
- When adding fields to route payloads, update `src/app/models/fleet_route.ts` and the server action typing in the same PR.

## Reports (Weekly Transportation)
- Server action: `src/app/actions/generate_report.ts` exports `generateReports(startKey, endKey)` and the `WeeklyReport` type.
- Bucketing is `request.status`-driven: `successful` → `picked`, `failed` → `notPicked`, `cancelled` → `cancelled`, `normal` → `pending`. `cancelled` counts toward `totalRequests` but does not contribute to `passengersPicked`.
- `passengersPicked` is enriched via `pickup_info.transport_id == request.documentId` for successful requests, with `no_of_seats` as fallback when no pickup_info doc exists.
- Report view: `src/app/admin/(dashboard)/reports/` with `page.tsx` (server component) and `views/reports_view.tsx` (client). Adds: KPI cards (Total / Successful / Success Rate / Cancelled / Passengers Picked), recharts `LineChart` for requests vs picked, `Table` for weekly breakdown, CSV export, print.
- Reports are labeled by **service Sunday** (the date the report row is for), not the previous Sunday. The submission window is `[S-7 00:00, S 00:00)` in Edmonton time; Sunday submissions roll to the next Sunday. `src/app/utils/report-utils.ts` holds shared range/label/CSV helpers.
- `passengersPicked` joins `pickup_info` by `transport_id` (batched in groups of 30 for Firestore's `in` limit), so confirmations recorded on service Sunday or later are counted. The latest successful confirmation wins on duplicates; a recorded `0` is preserved.
- Date iteration in `generateReports` and all report UI date handling use Edmonton-anchored helpers (`addEdmontonDays`, `formatSundayKey`, `parseSundayKey`, `getNearestSunday`) so server/browser timezone cannot shift the selected Sunday. `SundayDatePicker` accepts a `timeZone="America/Edmonton"` prop for consumers that need it.

## UI & UX Guardrails
- Typography: Montserrat (body) + PT Serif (branding) via Next fonts. Apply with `font-[family-name:var(--font-mont)]`.
- Color tokens in `globals.css`: `--primary`, `--foreground`, `--background`, `--tertiary`, `--deleteRed`. Use Tailwind arbitrary values (`text-[var(--foreground)]`).
- Shared UI primitives in `src/app/ui`: `table`, `sidebar`, `popup_form`, `primary_button`, `schema_form`, `sunday_date_picker`. Extend or add variants — don't duplicate markup.
- `leaflet/dist/leaflet.css` is imported once in `layout.tsx`. Do not re-import per component.
- The shared `Table` component: use `String(r[k] ?? "")` (nullish coalescing), never `|| ""` — `0` is a valid cell value.
- For accessibility: ARIA labels on drag handles, keyboard focus, readable contrast. `docs/UI_UX.md` has sidebar/legend patterns.
- `export const dynamic = "force-dynamic"` is required for any page that reads live Firestore.

## Code Style
- Imports: native → third-party → `@/...` internal aliases → relative paths. CSS side-effect imports (e.g. `leaflet/dist/leaflet.css`) at the very top.
- Types: export from `src/app/models`; consume Firestore data via `z.infer<typeof Schema>` for compile-time parity.
- Optional fields: use `z.optional(z.string())` rather than `.optional()` chaining.
- Naming: PascalCase components/classes/types, camelCase variables/functions, SCREAMING_CASE constants, kebab-case filenames (except Next route segments).
- Server actions live in `src/app/actions/`, start with `"use server"`, return `{ success, data?, message? }`, and wrap in try/catch with `console.error` on failure. Surface to user via `sonner` toasts.
- Small server actions, exported as named typed helpers (not inline anonymous functions).
- Lean on `FirestoreHelper` / `FirestoreAdminHelper` rather than ad-hoc fetches.

## Workflow / Process
- Never add features directly to `main`. Feature branches, focused PRs.
- Commit frequently; keep `.env.local` and seed data out of git.
- Before shipping backend-heavy work, run `npm run build` (validates Server Actions compile under Turbopack) and `npx tsc --noEmit`.
- PR descriptions should call out schema changes, new env vars, and new scripts so reviewers can update their local setup.
- When adding a data model: Zod schema → `FirestoreCollections` → helper usage → `docs/SCHEMA.md` (all in the same PR).
- When adding a week-related primitive or behavior change, run `npm test` and update the Vitest suite.

## Debugging & Observability
- Server actions surface errors in the Next dev console with stack traces. Check there first.
- Use structured log fields (ids, timestamps, service numbers) over free-form text.
- For Leaflet issues, ensure components only render on the client (`useEffect` or dynamic import) to avoid SSR `window` references.
- Emulator vs production: set `NEXT_PUBLIC_DEBUG_URL` to the emulator endpoint and `FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST` in your shell.
- `firebase.firestore.setLogLevel("debug")` is available for deeper tracing — remove before committing.

## Security
- Never trust client-sent UID/role props. Always rely on middleware-injected headers or Firebase Admin verifications.
- New cookies must be `secure` + `httpOnly` + `sameSite:"strict"` + `path:"/"`.
- React's default escaping is the right default; avoid `dangerouslySetInnerHTML`.
- Don't log secrets or raw auth tokens. Restrict logs to document IDs and role metadata.
- Keep Firestore security rules aligned with new collections; update the Firebase console + repo together.
