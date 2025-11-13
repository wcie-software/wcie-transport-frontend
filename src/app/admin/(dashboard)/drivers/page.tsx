import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseServer } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import DriversPage from "./drivers_page";

export default async function RequestsPage() {
	const header = {
		"documentId": "Phone Number",
		"full_name": "Full Name",
		"address": "Address",
		"driver_license_class": "Driver License Class",
		"comments": "Comments",
	};

	const { app, auth, db } = await getFirebaseServer();
	const firestore = new FirestoreHelper(db);
	const body = await firestore.getCollection<Driver>(FirestoreCollections.Drivers, DriverSchema);

	return (
		<div className="w-full mt-12 mx-4">
			<DriversPage
			 	body={body}
				header={header}
			/>
		</div>
	);
}