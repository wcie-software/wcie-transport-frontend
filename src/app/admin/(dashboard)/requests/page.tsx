import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "@/app/utils/firestore_admin";
import RequestView from "@/app/admin/(dashboard)/requests/request_view";
import { defaultFormatter } from "@/app/utils/util";

export const dynamic = "force-dynamic";

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
	const pageParam = (await searchParams).page;
	const page = parseInt(pageParam || "0");

	// Get reference Sunday (nearest sunday in the future)
	const referenceSunday = new Date();
	if (referenceSunday.getDay() !== 0) { // If not a Sunday
		referenceSunday.setDate(referenceSunday.getDate() + 7 - referenceSunday.getDay());
	}
	referenceSunday.setHours(10, 59, 0, 0);

	// Calculate range for the current "page" (4 weeks per page)

	const rangeMax = new Date(referenceSunday);
	// Whenever a user increases the page, we want to move 4 weeks from previous page start
	// (4 * `page`) weeks from today. 
	rangeMax.setDate(referenceSunday.getDate() - (page * 28));

	const rangeMin = new Date(rangeMax);
	// Minimum date is 4 weeks from max
	rangeMin.setDate(rangeMax.getDate() - 28);

	const { db } = await getFirebaseAdmin();
	const fdb = new FirestoreAdminHelper(db);
	const requestsList = await fdb.queryCollection<TransportRequest>(
		FirestoreCollections.Requests,
		TransportRequestSchema,
		[
			{ field: "timestamp", operator: ">=", value: defaultFormatter(rangeMin) },
			{ field: "timestamp", operator: "<=", value: defaultFormatter(rangeMax) },
		],
		"timestamp"
	);

	// Group requests by week
	const requestsGroupedByWeek: Record<string, TransportRequest[]> = {};
	requestsList.forEach((r) => {
		const end = new Date(r.timestamp);
		// Find Sunday of that week
		end.setDate(end.getDate() + (7 - end.getDay()));
		end.setHours(10, 59, 0, 0); // Have a uniform time

		const start = new Date(end);
		// Start from Monday
		start.setDate(end.getDate() - 6);

		// MMM DD, YYYY
		const dateFormatter = new Intl.DateTimeFormat(
			"en-US", { timeZone: "America/Edmonton", dateStyle: "medium" }
		)
		const k = `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`;
		// Add request to correct week bucket
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