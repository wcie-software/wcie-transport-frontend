import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import VehiclesPage from "@/app/admin/(dashboard)/vehicles/vehicles_page";
import { Vehicle, VehicleSchema } from "@/app/models/vehicle";
import { FirestoreCollections } from "@/app/utils/firestore";

export default async function RequestsPage() {
	const header = {
		"documentId": "Phone Number",
		"full_name": "Full Name",
		"address": "Address",
		"driver_license_class": "Driver License Class",
		"comments": "Comments",
	};

	const { app, auth, db } = await getFirebaseAdmin();
	const body = await firestoreAdmin.getCollection<Vehicle>(db, FirestoreCollections.Vehicles, VehicleSchema);

	return (
		<div className="w-full mt-12 mx-4">
			<VehiclesPage
			 	body={body}
				header={header}
			/>
		</div>
	);
}