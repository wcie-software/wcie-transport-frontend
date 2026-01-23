import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "@/app/utils/firestore_admin";
import { defaultFormatter } from "@/app/utils/util";
import { Schedule, ScheduleSchema } from "@/app/models/schedule";
import { DriverRoutes, DriverRoutesSchema } from "@/app/models/fleet_route";
import AssignmentsView from "@/app/admin/(dashboard)/assignments/views/assignments_view";
import { Vehicle, VehicleSchema } from "@/app/models/vehicle";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage({ searchParams }: {
	searchParams: Promise<{ timestamp?: string, service_number?: string }>
}) {
	const params = await searchParams;

	// Attempt to get date from url search param
	let month, date, year;
	try {
		[month, date, year] = params?.timestamp?.split("-").map(parseFloat)!;
	} catch (e) {
		// Fallback to today's date
		const today = new Date();
		[month, date, year] = [today.getMonth() + 1, today.getDate(), today.getFullYear()];
	}

	// Construct date manually to mitigate date to string conversion issues
	const endDate = new Date(year, month - 1, date, 10, 59, 59);
	// Ensure it falls on a Sunday
	if (endDate.getDay() !== 0) {
		endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));
	}

	const startDate = new Date(endDate);
	// Start on Monday
	startDate.setDate(endDate.getDate() - 6);

	// M-D-YYYY
	const timestamp = endDate.toLocaleDateString("en-US").replaceAll("/", "-");

	const service = parseInt(params?.service_number ?? "1");
	const serviceNumber = isNaN(service) ? 1 : service;

	const { db } = await getFirebaseAdmin();
	const fdb = new FirestoreAdminHelper(db);

	// Get all requests that fall within the time range and are for that service
	const requestsList = (await fdb.queryCollection<TransportRequest>(
		FirestoreCollections.Requests,
		TransportRequestSchema,
		[
			{ field: "service_number", operator: "==", value: serviceNumber },
			{ field: "timestamp", operator: ">=", value: defaultFormatter(startDate) },
			{ field: "timestamp", operator: "<=", value: defaultFormatter(endDate) },
		],
		"timestamp" // Sort by time
	)).filter((t) => t.status != "cancelled"); // Don't include cancelled

	let driverList: Driver[] = [];
	// Get driver schedule for this week
	const schedule = await fdb.getDocument<Schedule>(
		FirestoreCollections.Schedules, ScheduleSchema,
		timestamp
	);

	const serviceNumberString = String(serviceNumber);
	if (schedule && serviceNumberString in schedule.schedule) {
		// Get drivers that are in this schedule
		driverList = await fdb.getDocuments<Driver>(
			FirestoreCollections.Drivers,
			DriverSchema,
			schedule.schedule[serviceNumberString]
		);
	}

	// Get route for this week
	const driverRoutes = await fdb.getDocument<DriverRoutes>(
		FirestoreCollections.Assignments, DriverRoutesSchema,
		timestamp
	);
	// Get only routes for the particular service
	const routes = driverRoutes?.routes.filter((r) => r.service_number == serviceNumber);

	// If routes have been generated, get the vehicles assigned to each driver
	const assignedVehicles: Record<string, Vehicle> = {};
	if (routes) {
		const vehicleIdToDriverId: Record<string, string> = {};
		routes.forEach((r) => {
			// Vehicle to driver map
			vehicleIdToDriverId[r.assigned_vehicle_id] = r.driver_id;
		});

		// Get the vehicles pertaining to the chosen drivers
		const vehicles = await fdb.getDocuments<Vehicle>(
			FirestoreCollections.Vehicles,
			VehicleSchema,
			Object.keys(vehicleIdToDriverId)
		);

		vehicles.forEach((v) => {
			try {
				const driverId = vehicleIdToDriverId[v.documentId!];
				// Driver to vehicle details map
				assignedVehicles[driverId] = v;
			} catch (e) {
				console.warn(`[Assignments Page] WARNING: Retrieved vehicle '${v.name}' that does not exist in generated route '${driverRoutes?.documentId}'`)
			}
		});
	}

	return (
		<div className="w-full h-screen">
			<AssignmentsView
				timestamp={timestamp}
				driversList={driverList}
				assignedVehicles={assignedVehicles}
				requestsList={requestsList}
				routes={routes}
			/>
		</div>
	);
}