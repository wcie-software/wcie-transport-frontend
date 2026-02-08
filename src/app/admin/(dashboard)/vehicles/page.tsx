import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreAdminHelper } from "@/app/utils/firestore_admin";
import VehiclesView from "@/app/admin/(dashboard)/vehicles/vehicles_page";
import { Vehicle, VehicleSchema } from "@/app/models/vehicle";
import { FirestoreCollections } from "@/app/utils/firestore";

export const dynamic = "force-dynamic";

export default async function VehiclePage() {
	const { db } = await getFirebaseAdmin();
	const fdb = new FirestoreAdminHelper(db);
	const body = await fdb.getCollection<Vehicle>(FirestoreCollections.Vehicles, VehicleSchema);

	return (
		<div className="w-full mt-12 px-8">
			<VehiclesView body={body} />
		</div>
	);
}