import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import * as firebaseAdmin from "@/app/utils/firestore_admin";
import { FirestoreCollections } from "@/app/utils/firestore";
import { ScheduleView } from "@/app/admin/(dashboard)/schedule/schedule_view";
import { Schedule, ScheduleSchema } from "@/app/models/schedule";
import { Driver, DriverSchema } from "@/app/models/driver";

export default async function SchedulePage() {
	const { app, auth, db } = await getFirebaseAdmin();

	const schedules = await firebaseAdmin.getCollection<Schedule>(db, FirestoreCollections.Schedules, ScheduleSchema);

	const drivers = await firebaseAdmin.getCollection<Driver>(db, FirestoreCollections.Drivers, DriverSchema);
	const driverNames: string[] = drivers.map((driver) => driver.full_name);

	return (
		<ScheduleView
			schedules={schedules}
			driverNames={driverNames}
		/>
	);
}