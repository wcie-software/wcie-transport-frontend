import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest } from "next/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { Schedule } from "@/app/models/schedule";

const schedulesData: Schedule[] = [
	{ documentId: "11-2-2025", timestamp: 1762063200000, schedule: { "1": ["sn51LHT3z6LB7VvjxHb6", "iEvi3KStL2zm5HDRrTjO", "zUNPU84ndF3rU3zmsULZ"], "2": ["un0pagZN77SBvo3skRfU", "sn51LHT3z6LB7VvjxHb6"] } },
]

export async function GET(req: NextRequest) {
	if (process.env.NODE_ENV !== "development") {
		return new Response("Not allowed", { status: 403 });
	}

	const { db } = await getFirebaseAdmin();
	const schedules = db.collection(FirestoreCollections.Schedules);
	
	for (const s of schedulesData) {
		const id = s.documentId!;
		delete s.documentId;

		try {
			await schedules.doc(id).set(s);
		} catch (e) {
			console.error("Error importing schedule", String(e));
		}
	}
		
	return new Response("Done");
}