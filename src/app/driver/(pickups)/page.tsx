import { FirestoreCollections } from "@/app/utils/firestore";
import DateSelector from "./components/date_selector";
import * as firestoreAdmin from "@/app/utils/firestore_admin";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { DriverRoutes, DriverRoutesSchema } from "@/app/models/fleet_route";
import { headers } from "next/headers";
import { UID_HEADER_KEY } from "@/app/utils/constants";
import { TransportRequestSchema } from "@/app/models/request";
import PickupItem from "./components/pickup_item";

export default async function Page({ searchParams }: { searchParams: Promise<{ date: string }> }) {
    const { date: dateString } = await searchParams;

    const h = await headers();
    const uid = h.get(UID_HEADER_KEY) || "bad-uid";

    // TODO: Check date is not less than 2 weeks or greater than this week away
    // Atempt to get date from url search param
    let month, date, year;
    try {
        [year, month, date] = dateString.split("-").map(parseFloat)!;
    } catch (e) {
        // Fallback to today's date
        const today = new Date();
        [month, date, year] = [today.getMonth() + 1, today.getDate(), today.getFullYear()];
    }

    const sunday = new Date(year, month - 1, date, 23, 59, 59);
    if (sunday.getDay() !== 0) {
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay()))
    }

    const timestamp = `${sunday.getMonth() + 1}-${sunday.getDate()}-${sunday.getFullYear()}`;

    const { db } = await getFirebaseAdmin();
    const routes = (await firestoreAdmin.getDocument<DriverRoutes>(
        db, FirestoreCollections.Assignments, DriverRoutesSchema,
        timestamp
    ))?.routes.filter(r => r.driver_id == uid);

    const transportRequestIds = [];
    if (routes) {
        for (const d of routes) {
            for (const t of d.route) {
                transportRequestIds.push(t.id);
            }
        }
    }

    const transportRequests = transportRequestIds.length > 0
        ? await firestoreAdmin.getDocuments(
            db,
            FirestoreCollections.Requests,
            TransportRequestSchema,
            transportRequestIds)
        : [];

    return (
        <div className="mt-6 max-w-3xl m-auto">
            <h1 className="text-3xl font-bold tracking-tight">Your Pickups</h1>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-1 gap-2">
                <p className="text-slate-400 text-sm truncate">{transportRequests.length} pickups scheduled for {sunday.toDateString()}</p>
                <span className="text-slate-500 text-[10px] font-mono uppercase truncate">Last Sync {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="mt-8 mb-24 overflow-x-auto">
                <DateSelector />
                <div className="space-y-4">
                    {transportRequests.map((t, i) => <PickupItem key={t.documentId} pickup={t} active={i == 0} />)}
                </div>
                {transportRequests.length === 0 && <p className="uppercase my-4 text-xs">No pickups</p>}
            </div>
        </div>
    );
}