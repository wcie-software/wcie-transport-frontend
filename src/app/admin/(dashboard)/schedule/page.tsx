import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreAdminHelper } from "@/app/utils/firestore_admin";
import { FirestoreCollections } from "@/app/utils/firestore";
import { ScheduleView } from "@/app/admin/(dashboard)/schedule/views/schedule_view";
import { Schedule, ScheduleSchema } from "@/app/models/schedule";
import { Driver, DriverSchema } from "@/app/models/driver";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
	const { db } = await getFirebaseAdmin();
	const fdb = new FirestoreAdminHelper(db);

	const schedules = await fdb.getCollection<Schedule>(
		FirestoreCollections.Schedules,
		ScheduleSchema,
		"timestamp",
	);

	// Create groups of schedules
	const groupedByMonth: Record<string, Schedule[]> = {};
	schedules.forEach((schedule) => {
		// e.g. "March 2025"
		const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "America/Edmonton" });
		// Get month from date
		const monthKey = dateFormatter.format(new Date(schedule.timestamp));
		// Add schedule to correct month bucket
		if (monthKey in groupedByMonth) {
			groupedByMonth[monthKey].push(schedule);
		} else {
			groupedByMonth[monthKey] = [schedule];
		}
	});

	const drivers = await fdb.getCollection<Driver>(FirestoreCollections.Drivers, DriverSchema);
	// Records of (driver id: driver name)
	const driverIdsAndNames: Record<string, string> = {};
	drivers.forEach((driver) => driverIdsAndNames[driver.documentId!] = driver.full_name);

	return (
		<div className="px-8">
			<ScheduleView
				schedulesByMonth={groupedByMonth}
				driverInfo={driverIdsAndNames}
			/>
		</div>
	);
}