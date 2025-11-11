import { Driver, DriverSchema } from "@/app/models/driver";
import Table from "@/app/ui/components/table";
import { getFirebaseServer } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";

export default async function RequestsPage() {
	const headers = {
		// "Name": "full_name",
		"Email": "email",
		"Driver License Class": "driver_license_class",
		"Comments": "comments",
	};

	const { app, auth, db } = await getFirebaseServer();
	const firestore = new FirestoreHelper(db);
	const body = await firestore.getCollection<Driver>(FirestoreCollections.Drivers, DriverSchema);

	// TODO: Add field converter
	return (
		<div className="w-full">
			<Table<Driver>
				headerMap={headers}
				body={body}/>
		</div>
	);
}