# Architecture Overview

This document describes the high-level architecture and technology stack of the **WCIE Transport** application.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend-as-a-Service**: [Firebase](https://firebase.google.com/)
    - **Firestore**: NoSQL database for storing requests, drivers, vehicles, schedules, and assignments.
    - **Authentication**: Google OAuth and custom driver auth.
- **Validation**: [Zod](https://zod.dev/) for schema definition and runtime validation.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS).
- **Icons**: [Heroicons](https://heroicons.com/).
- **Maps**: [Leaflet](https://leafletjs.com/) and [Google Maps API](https://developers.google.com/maps).
- **External Integrations**:
    - **Fillout**: Used for user intake forms.
    - **Microservices**: Deployed services for specialized tasks (Routing, Data Ingestion).

## Project Structure

```text
src/app/
├── (user)/           # User-facing routes (transport requests)
├── admin/            # Admin dashboard routes
│   ├── (dashboard)/  # Main admin management pages
│   └── (login)/      # Admin login flow
├── driver/           # Driver-specific routes (assigned routes)
├── actions/          # Server Actions (database & API logic)
├── models/           # Zod schemas & TypeScript types
├── ui/               # Shared React components
└── utils/            # Shared utility functions (Firestore, Auth, etc.)
```

## Data Flow

1.  **Client Interaction**: Users/Admins interact with the UI built with Next.js Client Components.
2.  **Server Actions**: Complex logic (like initiating route generation or privileged data fetching) is handled by Next.js Server Actions.
3.  **Firestore Interaction**:
    - **Server-side**: Uses `FirestoreAdminHelper` (built on `firebase-admin`) for secure, privileged access.
    - **Client-side**: Uses `FirestoreHelper` (built on `firebase/firestore`) for direct database access where appropriate (protected by Firestore security rules).
4.  **External Microservices**:
    - **Routing Service**: A specialized microservice using **Google OR-tools** to generate optimal routes. It accesses Firestore directly to retrieve request points, drivers, and schedules.
    - **Data Ingestion Service**: Receives user data from **Fillout** forms and persists it to the Firestore database.
5.  **Validation**: All data entering or leaving the database is validated against Zod schemas defined in `src/app/models`.

## Performance Focus

- **Turbopack**: Used for fast development and build times.
- **Dynamic Optimization**: Pages like `/admin/assignments` use `force-dynamic` to ensure up-to-date data.
- **Optimistic Updates**: (If applicable) UI updates immediately while the database call completes in the background.

## Key Design Patterns

- **Helper Classes**: `FirestoreHelper` and `FirestoreAdminHelper` encapsulate database logic to provide a consistent API and automatic Zod validation.
- **Schema-First**: Models are defined using Zod, serving as both the source of truth for types and the validation layer.
- **Modular Dashboard**: The admin dashboard is split into logical sections (Requests, Assignments, Schedule, Drivers, Vehicles) for maintainability.
