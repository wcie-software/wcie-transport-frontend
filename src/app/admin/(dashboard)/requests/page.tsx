import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import RequestView from "@/app/admin/(dashboard)/requests/request_view";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
	const { db } = await getFirebaseAdmin();
	const requestsList = await firestoreAdmin.getCollection<TransportRequest>(
		db,
		FirestoreCollections.Requests,
		TransportRequestSchema,
		"timestamp"
	);

	const requestsGroupedByWeek: Record<string, TransportRequest[]> = {};
	requestsList.forEach((r) => {
		const end = new Date(r.timestamp);
		end.setDate(end.getDate() + (7 - end.getDay()));
		end.setHours(10, 59, 0, 0); // Have a uniform time

		const start = new Date(end);
		start.setDate(end.getDate() - 6);

		const dateFormatter = new Intl.DateTimeFormat(
			"en-US", { timeZone: "America/Edmonton", dateStyle: "medium" }
		)
		const k = `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`;
		(requestsGroupedByWeek[k] ??= []).push(r);
	});

	return (
		<div className="w-full">
			<RequestView groups={requestsGroupedByWeek} />
		</div>
	);
}