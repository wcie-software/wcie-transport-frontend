import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreAdminHelper } from "@/app/utils/firestore_admin";
import { FirestoreCollections } from "@/app/utils/firestore";
import DriversPage from "./drivers_page";

export const dynamic = "force-dynamic"; // Don't cache data

export default async function RequestsPage() {
	const { db } = await getFirebaseAdmin();
	const fdb = new FirestoreAdminHelper(db);
	const body = await fdb.getCollection<Driver>(FirestoreCollections.Drivers, DriverSchema, "full_name", "asc");

	return (
		<div className="w-full mt-12 px-8">
			<DriversPage body={body} />
		</div>
	);
}