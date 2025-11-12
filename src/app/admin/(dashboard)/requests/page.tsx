import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { getFirebaseServer } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import RequestTable from "./request_table";

export default async function RequestsPage() {
	const headers = {
		"Date": "timestamp",
		"Name": "full_name",
		"Phone": "phone_number",
		"Service": "service_number",
		"Seats": "no_of_seats",
		// "Location": "address"
	};

	const { app, auth, db } = await getFirebaseServer();
	const firestore = new FirestoreHelper(db);

	const data = await firestore.getCollection<TransportRequest>(FirestoreCollections.Requests, TransportRequestSchema);
	const body = data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

	return (
		<div className="w-full">
			<RequestTable
				body={body}
				header={headers} />
		</div>
	);
}