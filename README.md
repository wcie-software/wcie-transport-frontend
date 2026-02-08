# WCIE Transport

- Users can request rides to church by logging in with your phone number, selecting your address using Google Maps and filling out a Fillout form.
- Admins can manage transport requests and inventory (drivers, vehicles etc).
- **Flagship Feature**: App allows admins to automatically generate routes for drivers to pickup riders.

## Tech Stack

-   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Database & Auth**: Verified with [Firebase](https://firebase.google.com/) (Firestore, Auth, Admin SDK).
-   **Maps & Geolocation**:
    -   [React Leaflet](https://react-leaflet.js.org/)
    -   [StadiaMaps](https://stadiamaps.com/) (Tiles)
    -   [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview) (Autocomplete & Details)
-   **Backend Logic**: Firebase Cloud Functions (via Cloud Run / Serverless)
-   **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Documentation

Detailed documentation for developers and contributors can be found in the [docs](docs) folder:

- Getting Started: Keep on reading.
- [Architecture](docs/ARCHITECTURE.md): Project structure and technology stack.
- [Authentication](docs/AUTHENTICATION.md): Session management, RBAC, and middleware.
- [Data Schema](docs/SCHEMA.md): Firestore collections and Zod models.
- [UI/UX](docs/UI_UX.md): Design principles and shared components.
- [Agent Knowledge Base](docs/AGENTS.md): Technical details and patterns for developers/agents.

## Getting Started

### Prerequisites

-   Node.js (v18 or newer)
-   npm
-   A Firebase project with Firestore and Auth enabled.
- Firebase and gcloud CLIs

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd wcie-transport
    ```

2. Google Cloud Login:
    ```bash
    firebase login && gcloud auth application-default login
    ```

3. Setup Firebase [(read this)](https://firebase.google.com/docs/app-hosting/firebase-sdks#automatically-initialize-firebase-admin-and-web-sdks)
	- Before installing dependencies, ensure `FIREBASE_WEBAPP_CONFIG` is set to the Firebase web app config object.
		```bash
		export FIREBASE_WEBAPP_CONFIG="{...}"
		```

4.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_project_api_key

# Google Maps (for Places Autocomplete)
GOOGLE_PLACES_API_KEY=your_google_places_api_key

NEXT_PUBLIC_DEBUG_URL=http://localhost:[port number]
```

### Running Locally

```bash
npm run firebase
```

## Project Structure

-   `src/app`: Main application routes (App Router).
    -   `(user)`: Public facing routes for users.
    -   `admin`: Restricted routes for administrators.
		- 	`driver`: Restricted routes for drivers.
    -   `action`: Backend-only functions.
- 	`src/app/ui/components`: Reusable UI components.
-   `src/app/utils`: Utility functions, including Firebase setup and helper scripts.
-   `src/app/models`: TypeScript interfaces and data models.

## Deployment

This project is configured for **Firebase App Hosting**.
See `apphosting.yaml` for configuration details.

To deploy, merge to main or

```bash
firebase deploy
```

---

*Built for [Winners Chapel International Edmonton](https://www.winnerschapeledmonton.org).*