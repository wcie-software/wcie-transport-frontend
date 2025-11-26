import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import VehiclesView from "@/app/admin/(dashboard)/vehicles/vehicles_page";
import { Vehicle, VehicleSchema } from "@/app/models/vehicle";
import { FirestoreCollections } from "@/app/utils/firestore";

export default async function VehiclePage() {
	const { app, auth, db } = await getFirebaseAdmin();
	const body = await firestoreAdmin.getCollection<Vehicle>(db, FirestoreCollections.Vehicles, VehicleSchema);

	return (
		<div className="w-full mt-12">
			<VehiclesView body={body}/>
		</div>
	);
}