# WCIE Transport

WCIE Transport is a web application designed to facilitate ride requests for church members. It allows users to verify their identity, locate their address, and submit ride requests efficiently. The platform also includes administrative features for managing these requests.

## Features

### Member Ride Requests
-   **Phone Number Verification**: Securely validates users via SMS.
-   **Address Location**: Integrated map interface (Canada-limited) to pinpoint pickup locations.
-   **Request Management**: Simple form integration to capture trip details.

### Admin Dashboard
-   **Request Overview**: Admins can view and manage incoming ride requests.
-   **Resource Management**: Add and manage **Drivers** and **Vehicles**.
-   **Schedule Management**: Create and edit service schedules (defining services and their driver assignments).
-   **Route Assignments**: Automated generation and assignment of optimal routes to drivers using serverless functions.

### Authentication
-   **Secure Access**: Cookie-based authentication using Firebase Auth.
-   **Role-Based Access Control**: Middleware protection (`proxy.ts`) ensures only authorized users can access admin routes.

## Tech Stack

This project is built with a modern, high-performance stack:

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

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

-   Node.js (v18 or newer)
-   npm
-   A Firebase project with Firestore and Auth enabled.

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

3.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
FIREBASE_PROJECT_ID=your_firebase_project_id

# Google Maps (for Places Autocomplete)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key

NEXT_PUBLIC_DEBUG_URL=http://localhost:[port number]
```

### Running Locally

Start the development server:

```bash
npm run dev
```

## Project Structure

-   `src/app`: Main application routes (App Router).
    -   `(user)`: Public facing routes for users.
    -   `admin`: Restricted routes for administrators.
    -   `api`: Backend API routes.
-   `src/utils`: Utility functions, including Firebase setup and helper scripts.
-   `src/models`: TypeScript interfaces and data models.

## Deployment

This project is configured for **Firebase App Hosting**.
See `apphosting.yaml` for configuration details.

To deploy, ensure your Firebase CLI is set up and run:

```bash
firebase deploy
```

---

*Built for [Winners Chapel International Edmonton](https://www.winnerschapeledmonton.org).*