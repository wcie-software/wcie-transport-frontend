import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import RequestTable from "@/app/admin/(dashboard)/requests/request_table";

export default async function RequestsPage() {
	const headers = {
		"timestamp": "Date",
		"full_name": "Name",
		"phone_number": "Phone",
		"service_number": "Service",
		"no_of_seats": "Seats",
	};

	const { app, auth, db } = await getFirebaseAdmin();
	const requestsList = await firestoreAdmin.getCollection<TransportRequest>(
		db,
		FirestoreCollections.Requests,
		TransportRequestSchema
	);

	const body = requestsList.sort((a, b) => {
		const aDate = new Date(a.timestamp);
		const bDate = new Date(b.timestamp);
		
		return bDate.getTime() - aDate.getTime();
	});

	return (
		<div className="w-full">
			<RequestTable
				body={body}
				header={headers} />
		</div>
	);
}