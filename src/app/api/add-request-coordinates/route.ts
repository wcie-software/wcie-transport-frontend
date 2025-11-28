import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { TransportUser, TransportUserSchema } from "@/app/models/user";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { getCollection } from "@/app/utils/firestore_admin";
import { NextResponse } from "next/server";

export async function GET() {
    const { app, db, auth } = await getFirebaseAdmin();

    // 1. Get all users
    const users = await getCollection<TransportUser>(
        db,
        FirestoreCollections.Users,
        TransportUserSchema
    );

    // 2. Get all requests
    const requests = await getCollection<TransportRequest>(
        db,
        FirestoreCollections.Requests,
        TransportRequestSchema
    );

    // 3. Create a map of phone number to user location
    const userLocationMap = new Map<string, TransportUser["location_details"]["location"]>();
    users.forEach(user => {
        if (user.location_details?.location) {
            userLocationMap.set(user.phone_number, user.location_details.location);
        }
    });

    // 4. Update requests
    let updatedCount = 0;
    const batch = db.batch();
    let batchCount = 0;

    for (const request of requests) {
        const location = userLocationMap.get(request.phone_number);
        if (location && !request.coordinates && request.documentId) {
            const ref = db.collection(FirestoreCollections.Requests).doc(request.documentId);
            batch.update(ref, { coordinates: location });
            updatedCount++;
            batchCount++;

            // Commit batch every 500 writes
            if (batchCount >= 500) {
                await batch.commit();
                batchCount = 0;
            }
        }
    }

    if (batchCount > 0) {
        await batch.commit();
    }

    return NextResponse.json({
        message: "Coordinates backfill complete",
        totalRequests: requests.length,
        updatedRequests: updatedCount
    });
}
