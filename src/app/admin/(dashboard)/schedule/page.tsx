import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import * as firebaseAdmin from "@/app/utils/firestore_admin";
import { FirestoreCollections } from "@/app/utils/firestore";
import { ScheduleView } from "@/app/admin/(dashboard)/schedule/views/schedule_view";
import { Schedule, ScheduleSchema } from "@/app/models/schedule";
import { Driver, DriverSchema } from "@/app/models/driver";

export default async function SchedulePage() {
	const { app, auth, db } = await getFirebaseAdmin();

	const schedules = await firebaseAdmin.getCollection<Schedule>(
		db,
		FirestoreCollections.Schedules,
		ScheduleSchema,
		"timestamp",
	);
	console.log(`${schedules.length} schedules found.`);

	const groupedByMonth: Record<string, Schedule[]> = {};
	schedules.forEach((schedule) => {
		// e.g. "March 2025"
		const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
		const monthKey = dateFormatter.format(new Date(schedule.timestamp));
		(groupedByMonth[monthKey] ??= []).push(schedule);
	});

	const drivers = await firebaseAdmin.getCollection<Driver>(db, FirestoreCollections.Drivers, DriverSchema);
	const driverIdsAndNames: Record<string, string> = {};
	drivers.forEach((driver) => driverIdsAndNames[driver.documentId!] = driver.full_name);

	return (
		<ScheduleView
			schedulesByMonth={groupedByMonth}
			driverInfo={driverIdsAndNames}
		/>
	);
}