import MapView from "@/app/admin/(dashboard)/assignments/map_view";
import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import * as firestoreAdmin from "@/app/utils/firestore_admin";

export default async function AssignmentsPage() {
	const { db } = await getFirebaseAdmin();
	const requestsList = await firestoreAdmin.getCollection<TransportRequest>(
		db,
		FirestoreCollections.Requests,
		TransportRequestSchema,
		"timestamp"
	);

	return (
		<div className="w-full h-screen">
			<div className="w-full h-screen py-4">
				<MapView requestPoints={requestsList} />
			</div>
		</div>
	);
}