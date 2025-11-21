import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const { app, auth, db } = await getFirebaseAdmin();

	const admins = await db.collection(FirestoreCollections.Admins).get();
	if (admins.empty) {
		return new Response(JSON.stringify({ message: "No admins found" }), { status: 404 });
	} else {
		for (const admin of admins.docs) {
			const uid = admin.id;
			try {
				await auth.setCustomUserClaims(uid, { role: "admin" });
			} catch (error) {
				return new Response(`Error setting admin claims for user ${uid}: ${error}`, { status: 500 });
			}
			console.log(`Set admin claims for user ${uid}`);
		}
	}

	return new Response("Admins registered", { status: 200 });
}