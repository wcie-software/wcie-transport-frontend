# Data Schema Index

This document is an index of Firestore collections and model files.

Source of truth is always the model code in `src/app/models/` and collection enum in `src/app/utils/firestore.ts`.

## Base Model

All primary Firestore documents inherit from:

- `src/app/models/base.ts` (`BaseDocument`)

`BaseDocument` includes optional `documentId`, which is injected from Firestore snapshot IDs by helper classes.

## Firestore Collections

Collection names below are aligned with `FirestoreCollections` in `src/app/utils/firestore.ts`.

- `users`
  - Model: `src/app/models/user.ts`
- `requests`
  - Model: `src/app/models/request.ts`
- `admins`
  - Model: `src/app/models/admin.ts`
- `drivers`
  - Model: `src/app/models/driver.ts`
- `vehicles`
  - Model: `src/app/models/vehicle.ts`
- `schedules`
  - Model: `src/app/models/schedule.ts`
- `assigned-routes`
  - Model: `src/app/models/fleet_route.ts`
- `pickup_info`
  - Model: `src/app/models/pickup_info.ts`

## Key Schema Constraints

### Transport Requests (`request.ts`)

- `phone_number` must start with `+1` and be length 12.
- `service_number` is coerced to number and bounded by configured service count.
- `no_of_seats` must be >= 1.
- `no_of_children` defaults to `0` and must be less than `no_of_seats`.
- `status` defaults to `normal` and allows: `normal`, `cancelled`, `failed`, `successful`.

### Driver Routes (`fleet_route.ts`)

- Route document includes `timestamp` and `routes[]`.
- Each route includes:
  - `driver_id`
  - `assigned_vehicle_id`
  - `service_number` (coerced numeric, min 1)
  - `route` points (`id` + `position`)
  - `estimated_route_time` (coerced numeric, min 0, default 0)

### Pickup Info (`pickup_info.ts`)

- Tracks pickup state by `transport_id` and `user_phone_number`.
- `passengers_picked` defaults to `0`.
- `failure_reason` is nullable string.

## Validation Pattern

Zod schemas are used for runtime parsing/validation when reading or writing through Firestore helpers. If a document does not parse correctly, helper methods log and skip invalid records.
