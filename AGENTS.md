# Agent Knowledge Base

Living reference for any developer or AI agent working on **WCIE Transport**. Keep it updated when patterns or tooling evolve. Consult the `docs/` folder (ARCHITECTURE.md, AUTHENTICATION.md, SCHEMA.md, ROUTE_EDITOR.md, UI_UX.md) for long-form context and mirror key changes here.

## Environment & Stack Snapshot
- Framework: Next.js 16 App Router with server components+actions; React 19 on the client; Turbopack drives dev/build loops.
- Language: Strict TypeScript per `tsconfig.json` (`strict`, `isolatedModules`, `jsx: react-jsx`, `@/*` path alias).
- Styling: Tailwind CSS 4 via `@tailwindcss/postcss`, topped with custom tokens in `src/app/globals.css` and occasional MUI/Emotion widgets.
- Data: Firestore accessed through typed helpers (`FirestoreHelper`, `FirestoreAdminHelper`); Zod schemas in `src/app/models` are runtime truth.
- Integrations: Firebase Auth/Admin, Google Places API for address lookup, React Leaflet for maps, `@dnd-kit` for drag/drop editing, OR-Tools microservice for routing.

## Workspace Setup
- Clone repo, run `npm install`, ensure Node ≥ 20.
- Copy `.env.local` template (if missing, create it) and fill auth/map keys; never commit actual secrets.
- Install Firebase CLI for emulator support (`npm install -g firebase-tools`).
- Optional: configure VS Code ESLint + Tailwind extensions for better DX even though lint config is not yet present.

## Commands & Tooling
- Dev: `npm run dev` starts Next with Turbopack and watches Firestore-connected routes.
- Build: `npm run build` then `npm run start` to verify production bundles/local server.
- Firebase emulators: `npm run firebase` launches Firestore/Auth simulators; set `NEXT_PUBLIC_DEBUG_URL` to emulator endpoint for client fetches.
- Type-check: `npx tsc --noEmit` uses the strict compiler to catch regressions before pushing.
- Lint: `npx next lint --dir src` falls back to Next defaults; add an ESLint config when rules become opinionated and document it here.
- Formatting: Prettier is not configured; follow existing spacing/line-break patterns and keep Tailwind class order purposeful.
- Dependency hygiene: prefer exact versions already in `package.json`; when adding packages, favor ESM-compatible builds since bundler resolution is set to `bundler`.

## Testing Status & Expectations
- Automated tests are not configured; there are no test scripts or `*.test.tsx` files today.
- Manual regression checks: `npm run dev`, authenticate as user/admin/driver, exercise request submission, admin dashboard, driver pickups.
- Data seeding: CSV fixtures under `src/test/data/` pair with emulators to simulate Firestore state.
- When introducing a test runner, prefer Vitest or Next's future `next test`; example single-file run command (once installed): `npx vitest src/app/admin/(dashboard)/assignments/my_file.test.ts`.
- Record any new `npm run test` entries plus coverage expectations back in this section immediately.

## Environment Variables
- Required client env keys: `NEXT_PUBLIC_DEBUG_URL`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_API_KEY`.
- Server-only key: `GOOGLE_PLACES_API_KEY` powers address autocomplete for transport requests.
- Keep `.env.local` git-ignored; if you need new keys (e.g., third-party routing), add placeholder names here and document usage.
- For emulator sessions, set `FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST` in your shell before running Next so the SDK routes traffic locally.

## Code Style Guidelines
- Imports: group native modules, third-party packages, internal aliases (`@/...`), then relative paths; keep CSS side-effect imports (e.g., `leaflet/dist/leaflet.css`) at the very top.
- Types: export type definitions from `src/app/models`; when consuming Firestore data use `z.infer<typeof Schema>` to guarantee compile-time parity with Zod runtime checks.
- Optional fields: follow the repo pattern `z.optional(z.string())` rather than `.optional()` chaining for clarity.
- Naming: PascalCase components/classes/types, camelCase variables/functions, SCREAMING_CASE for constants, kebab-case for filenames except Next route segments.
- React conventions: keep components small, prefer server components when possible, mark data-heavy pages with `export const dynamic = "force-dynamic"` if real-time Firestore data is required.
- Styling: lean on Tailwind tokens defined in `globals.css`; when Emotion/MUI is unavoidable, map theme values to the same primary/foreground palette.
- Comments: only where behavior is non-obvious (see `layout.tsx` toaster note). Do not narrate straightforward JSX.

## Error Handling & Logging
- Firestore helpers already strip `documentId` before writes; leave that guard in place and log meaningful errors when writes fail.
- Wrap server actions with `try/catch`, returning structured error objects to clients and surfacing problems via `sonner` toasts.
- Schema parse failures should `console.warn` with collection/doc ID (see helper pattern) and skip invalid rows instead of throwing.
- When redirecting from middleware or actions, clear cookies if they are invalid to avoid loops (follow `docs/AUTHENTICATION.md`).

## Firestore & Data Model Patterns
- Every collection lives in `FirestoreCollections` (src/app/utils/firestore.ts); keep it synchronized with models under `src/app/models`.
- Weekly artifacts (Schedules, Assignments) use Sunday timestamps formatted `M-D-YYYY`; compute Sunday first, subtract six days when you need the Monday boundary.
- Always pass the appropriate Zod schema into helper methods so `documentId` injection plus validation happen automatically.
- Never persist `documentId`; helpers strip it, but double-check manual writes as well.
- Service numbers are numeric fields but appear as string keys in some objects (e.g., `Schedule`). Coerce with `z.coerce.number()` like existing schemas do.
- Use `defaultFormatter` in `src/app/utils/util.ts` anytime you string-format dates for queries to keep Firestore range filters aligned.

## Authentication & Middleware Expectations
- Session cookie: `wcie-transport-session`; admin gate cookie: `wcie-transport-is-admin`. Both are `secure`, `httpOnly`, `sameSite:"strict"`, `path:"/"`.
- Middleware in `src/proxy.ts` protects `/admin`, `/driver`, `/request`, injects `X-Auth-UID` header downstream, and routes users without valid sessions back to `/admin` or `/login`.
- Login helpers in `src/app/utils/login.ts` abstract Firebase Admin cookie creation; reuse them rather than duplicating token verification.
- Role claims (`admin`, `driver`, `user`) decide redirect destinations and UI gating; update claim checks and documentation together when new roles appear.

## Routing, Scheduling, and Assignments
- External OR-Tools microservice ingests Firestore `TransportRequest`, `Driver`, and `Schedule` collections and writes optimized routes into `assigned-routes/{timestamp}`.
- Admins can override via the drag-and-drop editor (`docs/ROUTE_EDITOR.md`). Only transport requests are draggable; driver origin/depot nodes stay fixed.
- `saveCustomRoutes(timestamp, serviceNumber, routes)` overwrites only the relevant service block inside the weekly document. Preserve other services during updates.
- Service 1 defaults: driver location → requests → origin. Other services: origin → requests → origin. Seed new routes accordingly.
- Keep `displayRoutes` (Assignments view state) synchronized with edits so the Leaflet map updates immediately.
- When adding fields to route payloads, update both the Zod schema (`src/app/models/fleet_route.ts`) and server action typing in the same change.

## UI & UX Guardrails
- Typography comes from Next fonts: Montserrat (body) and PT Serif (branding). Apply via CSS variables like `font-[family-name:var(--font-mont)]` as shown in `layout.tsx`.
- Color palette lives in `globals.css`: `--primary`, `--foreground`, `--background`, `--tertiary`, `--deleteRed`. Reuse them through Tailwind arbitrary values (`text-[var(--foreground)]`).
- Dark mode adjustments exist for calendar pickers and base colors; test both themes when touching shared components.
- Shared UI primitives live in `src/app/ui` (table, sidebar, popup form, button). Extend them or add variants instead of duplicating markup.
- Map styling requires `leaflet/dist/leaflet.css` import (already in `layout.tsx`); avoid re-importing per component to keep bundle lean.
- Follow `docs/UI_UX.md` for responsive sidebar, status indicators, and route legend patterns.

## Authentication & User Flow Notes
- User/Driver login flows rely on Firebase phone auth; admins use email-link auth. Both flows ultimately call `userLogin`/`adminLogin` in `src/app/utils/login.ts`.
- Middleware enforces route-level protection. Missing/expired sessions redirect to `/admin` (admin routes) or `/login` (other protected routes) and cookies are cleared.
- Server actions should read `X-Auth-UID` header rather than trusting client-sent UID fields.

## Operational Practices for Agents
- Update `AGENTS.md` plus relevant docs whenever you add collections, commands, or workflows.
- Never add features directly to `main`. Work in feature branches, keep PRs focused, and mention this policy when handing off work.
- Commit frequently but keep secrets/seeding data out of git. Verify `.env.local` stays ignored.
- Before shipping backend-heavy work, run `npm run build` to ensure Server Actions compile under Turbopack and type-check cleanly.
- When adding data models, update schema files, `FirestoreCollections`, and `docs/SCHEMA.md` in the same pull request.
- UI changes must include accessibility checks (ARIA labels, keyboard focus, readable contrasts) especially inside the assignments drag/drop workflow.

## Cursor or Copilot Rules
- There are currently **no** `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` files. If you add them, summarize the enforced rules here for downstream agents.

## Build & Release Checklist
- Sync with `main`, install deps, confirm `npm run build` passes on a clean tree.
- Run `npx tsc --noEmit` plus any new lint/test commands you introduce, fixing violations before PR.
- Validate auth flows manually (admin login, driver pickup view, user request) in the same browser session to ensure middleware cookies behave as expected.
- Smoke-test Firebase emulator mode if your change touches Firestore schema or helpers.
- Prepare PRs with clear descriptions of schema changes, new env vars, or scripts so reviewers can update their local setup quickly.

## Developer Workflow Tips
- Favor small, composable server actions; keep them colocated in `src/app/actions` and export typed helpers rather than anonymous inline functions.
- Use `@/*` alias imports for anything under `src/app` to avoid brittle relative paths.
- When editing large UI files, break out Pure UI components into `src/app/ui` and hook logic into `use_*` files for testability.
- Lean on Firestore helper methods instead of ad-hoc fetch/update calls; they already handle `documentId` injection and schema validation.
- Keep log statements purposeful and remove verbose debugging before merging unless it is actionable operational logging.

## Data Flow Deep-Dive
- Document IDs are injected by helpers via snapshot IDs; treat `documentId` as read-only metadata inside React state.
- Server components fetching live Firestore data should opt into `export const dynamic = "force-dynamic"` to avoid Next static caching.
- The weekly timestamp pattern controls schedule/assignment lookups; always derive the canonical Sunday string before querying or writing.
- Map server responses through Zod before shaping them for UI—invalid rows should get skipped with a warning rather than crashing the page.
- When writing back to Firestore, strip undefined fields to keep documents compact and Firestore rules straightforward.

## Map & Drag/Drop Notes
- React Leaflet is initialized globally via `leaflet/dist/leaflet.css` import in `layout.tsx`; do not duplicate CSS imports per component.
- The assignments editor uses `@dnd-kit/core` + `@dnd-kit/sortable`; ensure draggable IDs remain stable (request IDs) to preserve internal state.
- Keep accessible drag handles (`aria-pressed`, focus cues) in sync with keyboard interactions; reference `use_assignments_route_editor.ts` for behavior.
- Every drop action should update both `editableRoutes` and `displayRoutes` to keep the map and list views synchronized.
- Reset flows should rebuild state from original props so unsaved edits can be discarded reliably when switching service numbers.

## External Services & API Keys
- Google Places API powers address autocomplete; calls originate from client components, so ensure `NEXT_PUBLIC_FIREBASE_API_KEY` and Places key stay scoped appropriately.
- Firebase Admin credentials live outside the repo; `firebase_admin.ts` expects the hosting platform to supply service account config through environment or default credentials.
- OR-Tools route optimizer is an external microservice; treat its Firestore writes as eventual-consistency inputs and add defensive null checks when fields may be absent during initial ingestion.
- Fillout form submissions feed into Firestore via a webhook service; monitor request statuses for duplicates and keep phone numbers normalized.
- Any new integration should ship with rate-limit/error handling plus documentation updates in this file and relevant docs.

## Debugging & Observability
- Use browser devtools network tab while running `npm run dev` to confirm Firebase calls respect emulator vs production endpoints.
- Enable Firestore debug logging via `firebase.firestore.setLogLevel("debug")` temporarily if deeper tracing is required (remember to remove before committing).
- Keep an eye on server console output during `npm run dev`; Next surfaces server action errors there with stack traces.
- Log structured objects (ids, timestamps, service numbers) instead of free-form text so issues can be correlated quickly.
- When diagnosing Leaflet issues, ensure components only render on the client side (`useEffect` or dynamic import) to avoid SSR window references.

## Security Considerations
- Never trust client-sent UID or role props—always rely on middleware-injected headers or Firebase Admin verifications.
- Cookies are `secure` + `httpOnly`; ensure any new cookie matches those flags and uses `sameSite:"strict"` to prevent cross-site leakage.
- Sanitize any user-provided text before echoing it into the UI; prefer React's default escaping over `dangerouslySetInnerHTML`.
- Do not log secrets or raw auth tokens—restrict logs to document IDs and role metadata.
- Keep Firestore security rules aligned with new collections; update them in the Firebase console/repo when data models expand.

## Quick Reference Checklists
- Firestore model addition: create Zod schema → extend `FirestoreCollections` → add helper usage → document in SCHEMA.md.
- Auth tweak: adjust `src/proxy.ts` matcher/redirects → update login helpers → re-test with admin + driver accounts.
- Route editor change: update hook logic + UI component → confirm drag/drop + map sync → persist via `saveCustomRoutes` and smoke-test.
- Styling update: edit `globals.css` tokens/Tailwind classes → test light/dark mode → ensure Leaflet UI still renders correctly.
