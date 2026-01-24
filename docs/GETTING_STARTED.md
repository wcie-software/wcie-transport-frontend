# Getting Started

Welcome to the **WCIE Transport** project! This document will guide you through the setup process and basic development workflow.

## Pre-requisites

- **Node.js**: Ensure you have Node.js installed (v18 or later recommended).
- **npm**: Package manager (comes with Node.js).
- **Firebase Account**: Access to the Firebase project `wcie-transport-backend`.
- **Firebase CLI**: Use the [Firebase CLI](https://firebaseopensource.com/projects/firebase/firebase-tools) to easily connect to the Firebase project

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd wcie-transport
    ```

2. **Login to Firebase**
    ```bash
    firebase login
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add the necessary Firebase and Google Maps configurations. 

    ```env
    FIREBASE_PROJECT_ID=wcie-transport-backend

    # Use by email link sign in logic
    NEXT_PUBLIC_DEBUG_URL=url_of_local_dev_server

    # Google Maps API
    GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    ```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Scripts

- `npm run dev`: Start development server with Turbopack.
- `npm run build`: Build the production application.
- `npm run start`: Start the production server.

## Data Initialization

In development mode, you can use the "Import Test Data" button in the admin sidebar to populate the Firestore database with sample data. This is useful for testing and local development.
