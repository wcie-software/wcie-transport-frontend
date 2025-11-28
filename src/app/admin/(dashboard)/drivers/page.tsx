import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import * as firebaseAdmin from "@/app/utils/firestore_admin";
import { FirestoreCollections } from "@/app/utils/firestore";
import DriversPage from "./drivers_page";

export default async function RequestsPage() {
	const { app, auth, db } = await getFirebaseAdmin();
	const body = await firebaseAdmin.getCollection<Driver>(db, FirestoreCollections.Drivers, DriverSchema, "full_name", "asc");

	return (
		<div className="w-full mt-12">
			<DriversPage body={body} />
		</div>
	);
}