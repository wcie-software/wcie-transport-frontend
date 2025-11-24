import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import VehiclesView from "@/app/admin/(dashboard)/vehicles/vehicles_page";
import { Vehicle, VehicleSchema } from "@/app/models/vehicle";
import { FirestoreCollections } from "@/app/utils/firestore";

export default async function VehiclePage() {
	const header = {
		"name": "Vehicle Name",
		"plate_number": "License Plate",
		"year": "Model",
		"fuel_cost": "Cost of Fuel ($)",
		"last_fuel_date": "Last Fueled",
		"maintenance_type": "Maintenance Type",
		"maintenance_receipt_amount": "Maintenance Cost ($)",
		"last_maintenance_date": "Last Maintained",
		"remarks": "Remarks"
	};

	const { app, auth, db } = await getFirebaseAdmin();
	const body = await firestoreAdmin.getCollection<Vehicle>(db, FirestoreCollections.Vehicles, VehicleSchema);

	return (
		<div className="w-full mt-12 mx-4">
			<VehiclesView
			 	body={body}
				header={header}
			/>
		</div>
	);
}