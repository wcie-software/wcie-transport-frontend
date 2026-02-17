# WCIE Transport

WCIE Transport is a Next.js application for coordinating church transportation.

- Users request rides with phone-based sign-in and pickup details.
- Admins manage requests, drivers, vehicles, schedules, and assignments.
- Routes can be generated externally and then manually adjusted in the admin dashboard.

## Tech Stack

- Framework: [Next.js 16 (App Router)](https://nextjs.org/)
- Language: [TypeScript](https://www.typescriptlang.org/)
- Styling: [Tailwind CSS v4](https://tailwindcss.com/)
- Data + Auth: [Firebase](https://firebase.google.com/) (Firestore, Auth, Admin SDK)
- Maps: [Leaflet](https://leafletjs.com/), [React Leaflet](https://react-leaflet.js.org/)
- Geolocation APIs: [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
- Deployment: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Documentation

Project docs are in `docs/`:

- [Architecture](docs/ARCHITECTURE.md)
- [Authentication](docs/AUTHENTICATION.md)
- [Data Schema](docs/SCHEMA.md)
- [UI/UX](docs/UI_UX.md)
- [Route Editor Guide](docs/ROUTE_EDITOR.md)
- [Agent Knowledge Base](docs/AGENTS.md)

## Getting Started

### 1. Prerequisites

- Node.js 18+
- npm
- Firebase CLI (`firebase`)
- Google Cloud CLI (`gcloud`)
- A Firebase project with Firestore and Auth enabled

### 2. Authenticate CLIs

```bash
firebase login
gcloud auth application-default login
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key

# Optional server fallback for Admin SDK init
FIREBASE_PROJECT_ID=your_firebase_project_id

# Google Places (server actions)
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Admin email-link redirect target (dev/staging/prod specific)
NEXT_PUBLIC_DEBUG_URL=http://localhost:5000
```

### 5. Run locally

```bash
npm run firebase
```

This starts the Firebase emulators based on `firebase.json`.

## Project Structure

```text
src/app/
├── (user)/           # User-facing routes (login, request, success)
├── admin/            # Admin login + dashboard routes
├── driver/           # Driver routes (pickups, schedules, profile)
├── actions/          # Server actions
├── models/           # Zod schemas + inferred TS types
├── ui/               # Shared UI components
└── utils/            # Shared helpers (Firebase setup, auth, Firestore)
```

## Deployment

Configured for Firebase App Hosting (`apphosting.yaml`).

```bash
firebase deploy
```

Built for [Winners Chapel International Edmonton](https://www.winnerschapeledmonton.org/).
