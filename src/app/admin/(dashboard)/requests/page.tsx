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

	// Calculate range for the current "page" (4 weeks per page).
	// `rangeMax` is the service Sunday of the latest week in the view.
	// The submission window for a service Sunday S is [S-7 00:00, S 00:00),
	// so to capture every submission for the 4 weeks ending on `rangeMax`,
	// we query [rangeMax - 35 days 00:00, rangeMax + 7 days 00:00) and
	// bucket each request by its next Sunday.

	const rangeMax = new Date(referenceSunday);
	// Whenever a user increases the page, we want to move 4 weeks from previous page start
	// (4 * `page`) weeks from today. 
	rangeMax.setDate(referenceSunday.getDate() - (page * 28));

	// Lower bound: start of the week whose service Sunday is 4 weeks before rangeMax.
	const rangeMin = new Date(rangeMax);
	rangeMin.setDate(rangeMax.getDate() - 28); // 4 weeks of Sundays
	rangeMin.setHours(0, 0, 0, 0);

	// Exclusive upper bound: start of the week after rangeMax (next Sunday 00:00).
	const rangeUpper = new Date(rangeMax);
	rangeUpper.setDate(rangeMax.getDate() + 7);
	rangeUpper.setHours(0, 0, 0, 0);

	const { db } = await getFirebaseAdmin();
	const fdb = new FirestoreAdminHelper(db);
	const requestsList = await fdb.queryCollection<TransportRequest>(
		FirestoreCollections.Requests,
		TransportRequestSchema,
		[
			{ field: "timestamp", operator: ">=", value: defaultFormatter(rangeMin) },
			{ field: "timestamp", operator: "<", value: defaultFormatter(rangeUpper) },
		],
		"timestamp"
	);

	// Group requests by week (service Sunday bucket).
	// A request submitted on Sunday morning belongs to the *next* Sunday.
	const requestsGroupedByWeek: Record<string, TransportRequest[]> = {};
	requestsList.forEach((r) => {
		const submitted = new Date(r.timestamp);
		// Find the next Sunday (service Sunday) for this submission.
		// If submitted on a Sunday, getDay() === 0 → +7 to next Sunday.
		const daysUntilSunday = (7 - submitted.getDay()) % 7;
		const serviceSunday = new Date(submitted);
		serviceSunday.setDate(submitted.getDate() + daysUntilSunday);
		serviceSunday.setHours(11, 59, 0, 0);

		// Week label spans the submission window: previous Sunday → Saturday.
		const weekStart = new Date(serviceSunday);
		weekStart.setDate(serviceSunday.getDate() - 7);
		const weekEnd = new Date(serviceSunday);
		weekEnd.setDate(serviceSunday.getDate() - 1);

		// MMM DD, YYYY
		const dateFormatter = new Intl.DateTimeFormat(
			"en-US", { timeZone: "America/Edmonton", dateStyle: "medium" }
		)
		const k = `${dateFormatter.format(weekStart)} – ${dateFormatter.format(weekEnd)}`;
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