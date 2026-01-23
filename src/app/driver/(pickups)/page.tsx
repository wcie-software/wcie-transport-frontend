import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "@/app/utils/firestore_admin";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { DriverRoutes, DriverRoutesSchema } from "@/app/models/fleet_route";
import { headers } from "next/headers";
import { Constants } from "@/app/utils/util";
import { TransportRequestSchema } from "@/app/models/request";
import PickupView from "@/app/driver/(pickups)/pickup-view";

// Get route details for the chosen date and display the `TransportRequest` details for each point on the route
export default async function Page({ searchParams }: { searchParams: Promise<{ date: string }> }) {
    const { date: dateString } = await searchParams;

    const h = await headers();
    const uid = h.get(Constants.UID_HEADER_KEY) || "bad-uid";

    // Attempt to get date from url search param
    let month, date, year;
    try {
        [year, month, date] = dateString.split("-").map(parseFloat)!;
    } catch (e) {
        // Fallback to today's date
        const today = new Date();
        [month, date, year] = [today.getMonth() + 1, today.getDate(), today.getFullYear()];
    }

    // Nearest sunday
    const sunday = new Date(year, month - 1, date, 23, 59, 59);
    if (sunday.getDay() !== 0) {
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay()))
    }

    // M-D-YYYY
    const timestamp = sunday.toLocaleDateString("en-US").replaceAll("/", "-");

    const { db } = await getFirebaseAdmin();
    const fdb = new FirestoreAdminHelper(db);

    // Get the assigned routes for this week
    const routes = (await fdb.getDocument<DriverRoutes>(
        FirestoreCollections.Assignments, DriverRoutesSchema,
        timestamp
        // Get only routes that pertain to the currently logged-in driver
    ))?.routes.filter(r => r.driver_id == uid);

    /**
     * Get details of each `RequestPoint` found in the routes.
     * The `RequestPoint` only contains an id and coordinates. We want to
     * get the `TransportRequest` object of each id
     */

    // Get ids of `RequestPoint`s found in `routes` (see "models/fleet_route.ts")
    const transportRequestIds = routes?.flatMap(r => r.route.map(t => t.id)) || [];
    // Get `TransportRequest` objects from "requests" collection
    const transportRequests = (await fdb.getDocuments(
        FirestoreCollections.Requests,
        TransportRequestSchema,
        transportRequestIds
    ))
        .filter((t) => t.status !== "cancelled") // Ignore cancelled requests
        // Make sure the order (in `routes`) is preserved
        .sort((a, b) => transportRequestIds.indexOf(a.documentId!) - transportRequestIds.indexOf(b.documentId!));

    return (
        <div className="mt-6 max-w-3xl m-auto">
            <h1 className="text-3xl font-bold tracking-tight">Your Pickups</h1>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-1 gap-2">
                <p className="text-slate-400 text-sm truncate">{transportRequests.length} pickups scheduled for {sunday.toDateString()}</p>
                <span className="text-slate-500 text-[10px] font-mono uppercase truncate">Last Sync {new Date().toLocaleTimeString()}</span>
            </div>
            {/* Added a key here so the component updates when `transportRequests` is updated */}
            <PickupView key={timestamp} transportRequests={transportRequests} />
        </div>
    );
}