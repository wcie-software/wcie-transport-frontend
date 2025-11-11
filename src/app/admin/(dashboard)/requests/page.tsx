import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import Table from "@/app/ui/components/table";
import { getFirebaseServer } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";

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
	const body = await firestore.getCollection<TransportRequest>(FirestoreCollections.Requests, TransportRequestSchema);

	// TODO: Add field converter
	return (
		<div className="w-full">
			<Table<TransportRequest>
				headerMap={headers}
				body={body}
				fieldFormatter={(k, v, i) => {
					if (k === "timestamp") {
						return new Date(v).toLocaleDateString();
					} else if (k === "no_of_seats") {
						const children = body[i].no_of_children ?? 0;
						if (children) {
							return `${v} (${children} ${(children == 1 ? "child" : "children")})`;
						}
						return v;
					}
					return v;
				}}/>
		</div>
	);
}