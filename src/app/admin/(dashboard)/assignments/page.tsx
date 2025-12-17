import MapView from "@/app/admin/(dashboard)/assignments/map_view";
import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import { TIMESTAMP_FORMATTER } from "@/app/utils/constants";
import { Schedule, ScheduleSchema } from "@/app/models/schedule";
import { DriverRoutes, DriverRoutesSchema } from "@/app/models/fleet_route";

export default async function AssignmentsPage({ searchParams }: {
	searchParams: Promise<{ timestamp?: string, service_number?: string }>
}) {
	const params = await searchParams;

	const endDate = params?.timestamp
		? new Date(params?.timestamp)
		: new Date();
	// Ensure it falls on a Sunday
	endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));

	const startDate = new Date(endDate);
	startDate.setDate(endDate.getDate() - 7);

	const dateString = TIMESTAMP_FORMATTER.format(startDate);
	const documentDateString = startDate.toLocaleDateString("en-US").replaceAll("/", "-");

	const v = parseInt(params?.service_number ?? "1");
	const service_number = isNaN(v) ? 1 : v;

	const { db } = await getFirebaseAdmin();
	const requestsList = await firestoreAdmin.queryCollection<TransportRequest>(
		db,
		FirestoreCollections.Requests,
		TransportRequestSchema,
		[
			{ field: "service_number", operator: "==", value: service_number },
			{ field: "timestamp", operator: ">", value: dateString },
			{ field: "timestamp", operator: "<=", value: TIMESTAMP_FORMATTER.format(endDate) },
		],
		"timestamp"
	);

	let driverList: Driver[] = [];
	const schedule = await firestoreAdmin.getDocument<Schedule>(
		db, FirestoreCollections.Schedules, ScheduleSchema,
		documentDateString
	);

	const service_number_str = String(service_number);
	if (schedule && service_number_str in schedule.schedule) {
		driverList = await firestoreAdmin.getDocuments<Driver>(
			db,
			FirestoreCollections.Drivers,
			DriverSchema,
			schedule.schedule[service_number_str]
		);
	}

	const routes = await firestoreAdmin.getDocument<DriverRoutes>(
		db, FirestoreCollections.Assignments, DriverRoutesSchema,
		documentDateString
	);

	return (
		<div className="w-full h-screen">
			<MapView
				requestPoints={requestsList}
				driverPoints={driverList}
				routes={routes}
			/>
		</div>
	);
}