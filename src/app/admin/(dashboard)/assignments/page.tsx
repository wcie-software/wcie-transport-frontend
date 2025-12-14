import MapView from "@/app/admin/(dashboard)/assignments/map_view";
import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import * as firestoreAdmin from "@/app/utils/firestore_admin";

export default async function AssignmentsPage() {
	const { db } = await getFirebaseAdmin();
	const requestsList = await firestoreAdmin.getDocuments<TransportRequest>(
		db,
		FirestoreCollections.Requests,
		TransportRequestSchema,
		"timestamp"
	);
	const driversList = await firestoreAdmin.getCollection<Driver>(
		db,
		FirestoreCollections.Drivers,
		DriverSchema
	);
	return (
		<div className="w-full h-screen">
			<div className="w-full h-screen">
				<MapView
					requestPoints={requestsList}
					driverPoints={driversList.filter((v) => ["sn51LHT3z6LB7VvjxHb6", "iEvi3KStL2zm5HDRrTjO", "zUNPU84ndF3rU3zmsULZ"].includes(v.documentId!))}
				/>
			</div>
		</div>
	);
}