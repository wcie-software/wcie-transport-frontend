import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import RequestView from "@/app/admin/(dashboard)/requests/request_view";

export default async function RequestsPage() {
	const { app, auth, db } = await getFirebaseAdmin();
	const requestsList = await firestoreAdmin.getCollection<TransportRequest>(
		db,
		FirestoreCollections.Requests,
		TransportRequestSchema,
		"timestamp"
	);

	return (
		<div className="w-full">
			<RequestView body={requestsList}/>
		</div>
	);
}