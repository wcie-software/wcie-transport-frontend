# Agent Knowledge Base

This document is a "brain dump" of technical details, patterns, and things to remember for any developer or AI agent working on this project.

## Core Patterns

### 1. Document ID Injection
When fetching documents from Firestore via `FirestoreHelper` or `FirestoreAdminHelper`, the document's ID is automatically added to the data object as `documentId`.
- **Reason**: This allows React components and other logic to easily access the document's unique ID without it being stored redundanty as a field inside the document.
- **Implementation**: See the `.forEach` loops in `getCollection` and `getDocuments` methods in the helper classes.

### 2. Weekly Timestamps
The system heavily relies on a "Sunday timestamp" pattern for weekly data (Schedules and Assignments).
- **Format**: `M-D-YYYY` (e.g., `1-26-2026`).
- **Convention**: The timestamp always refers to the **Sunday** at the end of the week.
- **Logic**: To get the range for a week, calculate the Sunday and then subtract 6 days to get the Monday start.

### 3. Zod-Powered Data Layer
Never bypass the Zod schemas when interacting with Firestore.
- **Best Practice**: Always use the `FirestoreHelper` methods which take a `schema: ZodType<Type>` argument. This ensures that any data pulled from the database is valid and typed. 
- **Optional Fields**: Prefer using `z.optional(...)` instead of the trailing `.optional()`. (e.g. `field: z.optional(z.string())`).
- **Manual Parse**: If you must fetch data raw, use `TransportRequestSchema.safeParse(data)` immediately.

### 4. Server vs. Client Firestore
- **Server**: Use `FirestoreAdminHelper` (from `src/app/utils/firestore_admin.ts`) in Server Components and Server Actions. It uses the `firebase-admin` SDK.
- **Client**: Use `FirestoreHelper` (from `src/app/utils/firestore.ts`) in Client Components. It uses the standard `firebase` web SDK.

### 5. Authentication Middleware
All protected routes (`/admin`, `/driver`, `/request`) are guarded by `src/proxy.ts`. 
- **Pattern**: It verifies session cookies and role-based access.
- **Injection**: It injects the user's `uid` into the `x-uid` header. Read this header in Server Actions for secure user-specific logic.

---

## Technical Gotchas

- **`force-dynamic`**: Many admin pages use `export const dynamic = "force-dynamic";`. This is crucial because these pages fetch real-time data from Firestore. If omitted, Next.js might statically optimize the page, leading to stale data.
- **Date Formatting**: Use the `defaultFormatter` from `src/app/utils/util.ts` for consistent date-to-string conversion when querying Firestore.
- **Service Numbers**: Service numbers are used to segment requests and routes. They are typically numbers (1, 2, ...), but often handled as strings in object keys (e.g., in the `Schedule` model).

---

## Route Generation Workflow

The route generation logic is handled by an external microservice.
1.  **Inputs**: `TransportRequest[]`, `Driver[]`, and `Schedule[]` (retrieved directly from Firestore by the microservice).
2.  **Process**: The microservice uses **Google OR-tools** to solve the vehicle routing problem (VRP), optimizing for seating capacity and geographical proximity.
3.  **Output**: Creates/Updates documents in the `assigned-routes` collection with the Sunday timestamp as ID.

---

## Agent Operating Procedures

1. **Keep Documentation Fresh**: Always update the relevant `.md` files in the `docs/` folder (especially `AGENTS.md`) whenever new design choices are made, existing ones are refined, or new patterns are introduced.
2. **Feature Branching**: NEVER add new features directly to the `main` branch. Always prompt the USER to create a new branch for the task at hand.
3. **Commit Frequency**: Commit early and often when making significant feature changes.
4. **Model Initialization**: Whenever a new data model is created in `src/app/models/`, you MUST update the `FirestoreCollections` enum in `src/app/utils/firestore.ts` to include the new collection name.

---

## Common Tasks for Agents

- **Adding a new Model**:
    1. Create the schema in `src/app/models/new_model.ts`.
    2. Add the collection name to the `FirestoreCollections` enum in `src/app/utils/firestore.ts`.
    3. Update `firestore.rules` to enable read/write access to the correct user role.
    4. Use the helpers to fetch/save data.

- **Modifying UI**:
    1. Check `src/app/globals.css` for color variables.
    2. Use Tailwind classes where possible.
    3. Ensure accessibility (ARIA labels, etc.).
