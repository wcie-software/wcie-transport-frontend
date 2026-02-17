# Authentication and Authorization

This document describes current auth and access-control behavior in **WCIE Transport**.

## Overview

The app uses Firebase Authentication for identity and Firebase Admin for server-side session validation.

- Session cookie key: `wcie-transport-session`
- Admin flag cookie key: `wcie-transport-is-admin`
- UID header key forwarded by middleware: `X-Auth-UID`

(Defined in `src/app/utils/util.ts`.)

## Authentication Flows

### User and Driver login

- Client signs in with Firebase Auth (phone flow).
- Client sends ID token to `userLogin` (`src/app/utils/login.ts`).
- `userLogin` verifies the token and creates a session cookie.
- Default session lifetime is 24 hours.

### Admin login

- Admin signs in with email-link flow from the admin login route.
- Client sends ID token to `adminLogin` (`src/app/utils/login.ts`).
- `adminLogin` reuses `userLogin` with 7-day expiry.
- If role claim is `admin`, admin cookie flag is set to `TRUE`.
- If role is not `admin`, session is cleared.

## Session Cookie Behavior

`userLogin` sets the session cookie with:

- `httpOnly: true`
- `secure: true`
- `sameSite: "strict"`
- `path: "/"`

Admin flow additionally sets the `IS_ADMIN` flag cookie with secure and strict settings.

## Authorization Middleware

Middleware is implemented in `src/proxy.ts`.

Protected matcher:

- `/request/:path*`
- `/admin/:path+`
- `/driver/:path*`

Enforcement behavior:

1. Requires session cookie presence.
2. Verifies session cookie via Firebase Admin.
3. Applies admin/non-admin path restrictions.
4. Injects verified UID into response headers as `X-Auth-UID`.

## Failure and Redirect Behavior

- Missing session cookie:
  - Redirects to `/admin` when hitting admin routes.
  - Redirects to `/login` for non-admin protected routes.
- Invalid/expired session cookie:
  - Redirects using same route-aware logic above.
  - Session cookie is deleted during redirect response.
- Admin cookie/path mismatch:
  - Non-admin cookie on admin route -> redirect to `/admin`.
  - Admin cookie on non-admin protected route -> redirect to `/login`.

## Role Claims

Role checks depend on Firebase custom claim `role`:

- `admin`
- `driver`
- `user` (default fallback in token verification)

Claims are evaluated in server logic during login and middleware checks.
