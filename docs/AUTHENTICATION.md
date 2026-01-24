# Authentication & Authorization

This document describes the authentication mechanisms and authorization patterns used in the **WCIE Transport** application.

## Overview

The application uses **Firebase Auth** for identity management and **Next.js Middleware** for session enforcement and role-based access control (RBAC).

## Authentication Flows

### 1. User/Driver Authentication
- **Mechanism**: Phone number verification (SMS).
- **Process**: Users/Drivers sign in on the client side using the Firebase Web SDK.
- **Session**: Upon successful sign-in, a Firebase ID Token is sent to the server (via `userLogin` in `src/app/utils/login.ts`).
- **Cookie**: The server verifies the ID Token and creates a **Firebase Session Cookie**. This cookie is `httpOnly`, `secure`, and has a `sameSite: strict` policy for security.

### 2. Admin Authentication
- **Mechanism**: Email Link (Passwordless) Authentication.
- **Process**: 
    1. Admins enter their email on the `/admin` login page.
    2. Firebase sends a sign-in link to their email.
    3. Clicking the link redirects the admin back to the app (`/admin` page), where the session is finalized via `signInWithEmailLink`.
- **Admin Flag**: If the user has the `admin` role (checked via custom claims), an additional `IS_ADMIN` cookie is set to `TRUE`.

## Authorization (RBAC)

Authorization is enforced at the edge/middleware level and within Server Actions.

### Custom Claims
The system uses Firebase custom claims to define user roles:
- `role: "admin"`: Full access to the admin dashboard.
- `role: "driver"`: Access to the driver portal and assigned routes.
- `role: "user"`: Default role for transport requests.

### Middleware Enforcement (`src/proxy.ts`)
A custom middleware function (aliased as `proxy` in this project) intercepts requests to protected routes:
- **Protected Paths**: `/request/*`, `/admin/*`, `/driver/*`.
- **Validation**: 
    1. Checks for the presence of the session cookie.
    2. Verifies the session cookie with `firebase-admin`.
    3. Enforces role-specific path access (e.g., only admins can access `/admin`).
- **UID Header**: Upon successful validation, the user's `uid` is injected into the request headers (`x-uid`) for use by downstream Server Components and Actions.

## Key Files

| File | Purpose |
| :--- | :--- |
| `src/proxy.ts` | Next.js middleware for route protection and role enforcement. |
| `src/app/utils/login.ts` | Server Actions for creating session cookies and handling logouts. |
| `src/app/actions/driver_auth.ts` | Logic for programmatically creating driver accounts with custom claims. |
| `src/app/actions/firebase_server_setup.ts` | Initializes the Firebase Admin SDK for server-side operations. |

## Important Notes for Developers

- **Session Expiry**: User sessions typically last 24 hours, while admin sessions last 7 days.
- **HttpOnly Cookies**: Authentication cookies cannot be accessed or modified by client-side JavaScript, mitigating XSS risks.
- **Role Sync**: When creating or updating drivers via the Admin dashboard, the `role: driver` claim is automatically set by `createDriverAccount`.
