import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	const { app, auth, db } = await getFirebaseAdmin();

	db.collection(FirestoreCollections.Admins).get().then(snapshot => {
		console.log("Admins in system:");
		snapshot.forEach(doc => {
			console.log(`${doc.id}`);
		});
	});

	return new Response("Checked admins");
}