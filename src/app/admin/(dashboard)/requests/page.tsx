import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "@/app/utils/firestore_admin";
import RequestView from "@/app/admin/(dashboard)/requests/request_view";
import {
  formatWeekLabel,
  getMultiWeekRange,
  getNearestSunday,
  getServiceSunday,
} from "@/app/utils/util";

export const dynamic = "force-dynamic";

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
	const pageParam = (await searchParams).page;
	const page = parseInt(pageParam || "0");

	// Get reference Sunday (nearest sunday in the future)
	const referenceSunday = getNearestSunday(new Date());
	referenceSunday.setHours(10, 59, 0, 0);

	// Calculate range for the current "page" (4 weeks per page).
	// `rangeMax` is the service Sunday of the latest week in the view.
	// `rangeMin` is the service Sunday 4 weeks earlier.
	// The Firestore query spans [rangeMin - 7 days, rangeMax + 7 days) so
	// every submission whose next-Sunday is in [rangeMin, rangeMax] is captured.
	const rangeMax = new Date(referenceSunday);
	rangeMax.setDate(referenceSunday.getDate() - (page * 28));

	const rangeMin = new Date(rangeMax);
	rangeMin.setDate(rangeMax.getDate() - 28); // 4 weeks of Sundays

	const { start, end } = getMultiWeekRange(rangeMin, rangeMax);

	const { db } = await getFirebaseAdmin();
	const fdb = new FirestoreAdminHelper(db);
	const requestsList = await fdb.queryCollection<TransportRequest>(
		FirestoreCollections.Requests,
		TransportRequestSchema,
		[
			{ field: "timestamp", operator: ">=", value: start },
			{ field: "timestamp", operator: "<", value: end },
		],
		"timestamp"
	);

	// Group requests by week (service Sunday bucket).
	// A request submitted on Sunday morning belongs to the *next* Sunday.
	const requestsGroupedByWeek: Record<string, TransportRequest[]> = {};
	requestsList.forEach((r) => {
		const serviceSunday = getServiceSunday(new Date(r.timestamp));
		const k = formatWeekLabel(serviceSunday);
		if (k in requestsGroupedByWeek) {
			requestsGroupedByWeek[k].push(r);
		} else {
			requestsGroupedByWeek[k] = [r];
		}
	});

	return (
		<div className="w-full px-8">
			<RequestView
				key={page}
				groups={requestsGroupedByWeek}
				page={page}
				startingDate={rangeMax.toLocaleDateString("en-US", { dateStyle: "medium" })}
			/>
		</div>
	);
}