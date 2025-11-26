import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import RequestView from "@/app/admin/(dashboard)/requests/request_view";

export default async function RequestsPage() {
	const { app, auth, db } = await getFirebaseAdmin();
	const requestsList = await firestoreAdmin.getCollection<TransportRequest>(
		db,
		FirestoreCollections.Requests,
		TransportRequestSchema,
		"timestamp"
	);

	const requestsGroupedByWeek: Record<string, TransportRequest[]> = {};
	requestsList.forEach((r) => {
		console.log(r);

		const start = new Date(r.timestamp);
		console.log(r.timestamp);
		start.setDate(start.getDate() + (7 - start.getDay()));
		start.setHours(11, 59, 0, 0); // Have a uniform time
		
		const end = new Date(start);
		end.setDate(start.getDate() + 6);

		const dateFormatter = new Intl.DateTimeFormat(
			"en-US", { timeZone: "America/Edmonton", dateStyle: "medium" }
		)
		const k = `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`;
		(requestsGroupedByWeek[k] ??= []).push(r);
	});

	return (
		<div className="w-full">
			<RequestView body={requestsList} groups={requestsGroupedByWeek}/>
		</div>
	);
}