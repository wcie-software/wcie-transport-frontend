"use server";

import { DriverRoute, DriverRoutesSchema } from "@/app/models/fleet_route";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "../utils/firestore_admin";

/**
 * Saves custom routes for a given timestamp and service number.
 * Only the specified service's routes are replaced in the weekly
 * `assigned-routes/{timestamp}` document; other services are preserved.
 *
 * @param timestamp - Sunday timestamp in M-D-YYYY format.
 * @param serviceNumber - Service number to overwrite (e.g., 1 or 2).
 * @param routes - Updated routes for the specified service.
 * @returns Result object indicating success or failure.
 */
export async function saveCustomRoutes(
  timestamp: string,
  serviceNumber: number,
  routes: DriverRoute[],
): Promise<{ success: boolean; message?: string }> {
  try {
    const { db } = await getFirebaseAdmin();
    const fdb = new FirestoreAdminHelper(db);
    const existingRoutes =
      (
        await fdb.getDocument(
          FirestoreCollections.Assignments,
          DriverRoutesSchema,
          timestamp,
        )
      )?.routes || [];

    // Merge new custom routes with what's in db
    const mergedRoutes = existingRoutes
      .filter((r) => r.service_number !== serviceNumber)
      .concat(routes);

    // Save to db (merge)
    const ref = db.collection(FirestoreCollections.Assignments).doc(timestamp);
    await ref.set(
      {
        timestamp,
        routes: mergedRoutes,
      },
      { merge: true },
    );

    return { success: true };
  } catch (e) {
    console.error("save_custom_routes.ts ERROR:", e);
    return {
      success: false,
      message: "Failed to save custom routes. Please try again.",
    };
  }
}
