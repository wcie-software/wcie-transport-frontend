import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import { TIMESTAMP_FORMATTER } from "@/app/utils/constants";
import { Schedule, ScheduleSchema } from "@/app/models/schedule";
import { DriverRoutes, DriverRoutesSchema } from "@/app/models/fleet_route";
import AssignmentsView from "@/app/admin/(dashboard)/assignments/views/assignments_view";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage({ searchParams }: {
	searchParams: Promise<{ timestamp?: string, service_number?: string }>
}) {
	const params = await searchParams;

	// Atempt to get date from url search param
	let month, date, year;
	try {
		[month, date, year] = params?.timestamp?.split("-").map(parseFloat)!;
	} catch (e) {
		// Fallback to today's date
		const today = new Date();
		[month, date, year] = [today.getMonth() + 1, today.getDate(), today.getFullYear()];
	}

	// Construct date manually to mitigate date to string conversion issues
	const endDate = new Date(year, month - 1, date, 23, 59, 59);
	// Ensure it falls on a Sunday
	if (endDate.getDay() !== 0) {
		endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));
	}

	const startDate = new Date(endDate);
	startDate.setDate(endDate.getDate() - 7);

	const timestamp = endDate.toLocaleDateString("en-US").replaceAll("/", "-");

	const v = parseInt(params?.service_number ?? "1");
	const service_number = isNaN(v) ? 1 : v;

	const { db } = await getFirebaseAdmin();
	const requestsList = (await firestoreAdmin.queryCollection<TransportRequest>(
		db,
		FirestoreCollections.Requests,
		TransportRequestSchema,
		[
			{ field: "service_number", operator: "==", value: service_number },
			{ field: "timestamp", operator: ">", value: TIMESTAMP_FORMATTER.format(startDate) },
			{ field: "timestamp", operator: "<=", value: TIMESTAMP_FORMATTER.format(endDate) },
		],
		"timestamp"
	)).filter((t) => t.status != "cancelled");

	let driverList: Driver[] = [];
	// No need to show driver points in other services,
	// since they all start at starting point
	if (service_number === 1) {
		const schedule = await firestoreAdmin.getDocument<Schedule>(
			db, FirestoreCollections.Schedules, ScheduleSchema,
			timestamp
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
	}

	const driverRoutes = await firestoreAdmin.getDocument<DriverRoutes>(
		db, FirestoreCollections.Assignments, DriverRoutesSchema,
		timestamp
	);
	// Get only routes for the particular service
	const routes = driverRoutes?.routes.filter((r) => r.service_number == service_number);

	return (
		<div className="w-full h-screen">
			<AssignmentsView
				timestamp={timestamp}
				driversList={driverList}
				requestsList={requestsList}
				routes={routes}
			/>
		</div>
	);
}