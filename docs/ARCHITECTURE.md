# Architecture Overview

This document summarizes the current architecture of **WCIE Transport**.

## System Overview

The app is a Next.js App Router project backed by Firebase.

- Client UI is built with React Client Components.
- Server-side logic is handled through Next.js Server Actions and server components.
- Data is stored in Firestore and validated with Zod schemas.
- Authentication is Firebase-based, with role-aware session enforcement in middleware.

## Technology Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Data store: Firestore
- Auth: Firebase Auth + Firebase Admin session cookies
- Validation: Zod
- Map rendering: Leaflet + React Leaflet
- External integrations:
  - Google Places API (address search/details)
  - External services for route generation and form ingestion

## Auth and Access Model

Authentication flows:

- User/Driver: phone authentication through Firebase Web SDK
- Admin: email-link authentication through Firebase Web SDK

Authorization model:

- Custom claims carry role values (`user`, `driver`, `admin`)
- Middleware in `src/proxy.ts` enforces protected path access
- Verified UID is forwarded as a request header for downstream server logic

## Project Structure

```text
src/app/
├── (user)/
│   ├── login/
│   ├── request/
│   └── success/
├── admin/
│   ├── (login)/
│   └── (dashboard)/
├── driver/
│   ├── (pickups)/
│   ├── schedules/
│   └── profile/
├── actions/
├── models/
├── ui/
└── utils/
```

## Data Access Pattern

Two helpers are used to separate client and server data access:

- `FirestoreHelper` (`src/app/utils/firestore.ts`)
  - Uses Firebase Web Firestore SDK
  - Intended for client components where rule-constrained access is acceptable
- `FirestoreAdminHelper` (`src/app/utils/firestore_admin.ts`)
  - Uses Firebase Admin SDK
  - Intended for server components/actions requiring privileged access

Both helpers inject `documentId` from Firestore snapshots into returned objects.

## Data Flow

1. UI events trigger client actions or server actions.
2. Server actions perform privileged operations with `FirestoreAdminHelper` where needed.
3. Client-side dashboard interactions can use `FirestoreHelper` for direct updates.
4. External route-generation/data-ingestion services write to Firestore collections consumed by the app.
5. Zod schemas in `src/app/models` are the source of truth for runtime validation.

## Notes

- Several dashboard pages use dynamic rendering to avoid stale operational data.
- Assignment routes can be manually edited in-app after generation and persisted back to `assigned-routes`.
