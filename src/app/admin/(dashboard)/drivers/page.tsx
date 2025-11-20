import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import * as firebaseAdmin from "@/app/utils/firestore_admin";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import DriversPage from "./drivers_page";

export default async function RequestsPage() {
	const header = {
		"full_name": "Full Name",
		"phone_number": "Phone Number",
		"email": "Email",
		"address": "Address",
		"driver_license_class": "Driver License Class",
		"comments": "Comments",
	};

	const { app, auth, db } = await getFirebaseAdmin();
	const body = await firebaseAdmin.getCollection<Driver>(db, FirestoreCollections.Drivers, DriverSchema);

	return (
		<div className="w-full mt-12 mx-4">
			<DriversPage
			 	body={body}
				header={header}
			/>
		</div>
	);
}