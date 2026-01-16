import { FirestoreCollections } from "@/app/utils/firestore";
import DateSelector from "./components/date_selector";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { DriverRoutes, DriverRoutesSchema } from "@/app/models/fleet_route";

export default async function Page({ searchParams }: { searchParams: Promise<{ date: string }> }) {
    const { date: dateString } = await searchParams;

    // TODO: Check date is not less than 2 weeks or greater than this week away
    let sunday = new Date(dateString);
    if (isNaN(sunday.getTime())) {
        sunday = new Date();
        if (sunday.getDay() !== 0) {
            sunday.setDate(sunday.getDate() + (7 - sunday.getDay()))
        }
    }

    const timestamp = sunday.toLocaleDateString("en-US").replaceAll("/", "-");

    const { db } = await getFirebaseAdmin();
    const routes = await firestoreAdmin.getDocument<DriverRoutes>(
        db, FirestoreCollections.Assignments, DriverRoutesSchema,
        timestamp
    );

    // Find a way to save and retrieve uid (save it in header in proxy.ts)
    // Get only current driver routes by filtering for driver_id
    // Convert points to transport requests
    // Display them using pickup_item

    return (
        <div className="mt-6 max-w-3xl m-auto">
            <h1 className="text-3xl font-bold tracking-tight">Your Pickups</h1>
            <div className="flex justify-between items-center mt-1">
                <p className="text-slate-400 text-sm">4 trips scheduled for today</p>
                <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Sync: 2m ago</span>
            </div>
            <div className="mt-8 overflow-x-auto">
                <DateSelector />
            </div>
        </div>
    );
}