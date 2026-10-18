"use server";

import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { PickupInfo, PickupInfoSchema } from "@/app/models/pickup_info";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "../utils/firestore_admin";
import {
  addEdmontonDays,
  formatSundayKey,
  getWeekRange,
  parseSundayKey,
} from "@/app/utils/util";

/**
 * Per-week transportation report row.
 * - `picked` / `notPicked` / `pending` / `cancelled` come from `request.status`
 *   (successful / failed / normal / cancelled), matching the Requests screen's
 *   coloring. Cancelled is its own bucket and counts toward `totalRequests`.
 * - `totalPassengersPicked` is enriched from `pickup_info.passengers_picked`
 *   for successful requests (joined via `transport_id`). Cancelled requests
 *   do not contribute to passengers picked.
 * - `adults` = `no_of_seats - no_of_children` (approximation; no gender data today).
 * - `pickupRate` = `picked / totalRequests` (0 if no requests).
 * - Week window is [previous Sunday 00:00, service Sunday 00:00): a request
 *   submitted on Sunday morning counts toward the *next* Sunday's week.
 */
export type WeeklyReport = {
  sundayKey: string;
  totalRequests: number;
  adults: number;
  children: number;
  picked: number;
  notPicked: number;
  pending: number;
  cancelled: number;
  firstService: number;
  secondService: number;
  pickupRate: number;
  totalPassengersPicked: number;
};

export type GenerateReportsResult = {
  success: boolean;
  data?: WeeklyReport[];
  message?: string;
};

/**
 * Generates weekly transportation reports for every Sunday in the
 * inclusive range [`startSundayKey`, `endSundayKey`] (both `M-D-YYYY`).
 *
 * For each week (service Sunday = S):
 * 1. Query `requests` by `timestamp` in [S-7 00:00, S 00:00) — i.e. the
 *    previous Sunday through Saturday 23:59. A request submitted on
 *    Sunday morning belongs to the *next* Sunday's week. All statuses
 *    are included; `cancelled` is bucketed separately.
 * 2. Query `pickup_info` by successful requests' `transport_id`, including
 *    confirmations on service Sunday or another day. Used only to enrich
 *    `totalPassengersPicked`.
 * 3. Classify each request via `request.status`:
 *    `successful` → picked, `failed` → notPicked,
 *    `cancelled` → cancelled, else (`normal`) → pending.
 */
export async function generateReports(
  startSundayKey: string,
  endSundayKey: string,
): Promise<GenerateReportsResult> {
  const startSunday = parseSundayKey(startSundayKey);
  const endSunday = parseSundayKey(endSundayKey);

  if (
    !startSunday || !endSunday ||
    startSunday.getUTCDay() !== 0 || endSunday.getUTCDay() !== 0
  ) {
    return {
      success: false,
      message: "Invalid service Sunday. Expected a Sunday in M-D-YYYY format.",
    };
  }

  if (startSunday.getTime() > endSunday.getTime()) {
    return {
      success: false,
      message: "Start Sunday must be before or equal to end Sunday.",
    };
  }

  try {
    const { db } = await getFirebaseAdmin();
    const fdb = new FirestoreAdminHelper(db);

    const reports: WeeklyReport[] = [];
    let cursor = startSunday;

    while (cursor.getTime() <= endSunday.getTime()) {
      const week = await buildWeekReport(fdb, new Date(cursor));
      reports.push(week);
      cursor = addEdmontonDays(cursor, 7);
    }

    return { success: true, data: reports };
  } catch (e) {
    console.error("generate_report.ts ERROR:", e);
    return {
      success: false,
      message: "Failed to generate reports. Please try again.",
    };
  }
}

async function buildWeekReport(
  fdb: FirestoreAdminHelper,
  sunday: Date,
): Promise<WeeklyReport> {
  const { start, end } = getWeekRange(sunday);
  const sundayKey = formatSundayKey(sunday);

  const requests = await fdb.queryCollection<TransportRequest>(
    FirestoreCollections.Requests,
    TransportRequestSchema,
    [
      { field: "timestamp", operator: ">=", value: start },
      { field: "timestamp", operator: "<", value: end },
    ],
    "timestamp",
  );

  // Join by request ID, not confirmation date: confirmations normally happen
  // on service Sunday, outside the request's submission window. Firestore
  // supports at most 30 values per `in` query.
  const successfulIds = requests.flatMap((r) =>
    r.status === "successful" && r.documentId ? [r.documentId] : [],
  );
  const pickups: PickupInfo[] = [];
  for (let i = 0; i < successfulIds.length; i += 30) {
    pickups.push(
      ...await fdb.queryCollection<PickupInfo>(
        FirestoreCollections.PickupInfo,
        PickupInfoSchema,
        [{ field: "transport_id", operator: "in", value: successfulIds.slice(i, i + 30) }],
      ),
    );
  }

  const passengersByTransportId = new Map<string, number>();
  // Sort in memory to avoid requiring a new composite Firestore index.
  pickups.sort((a, b) => b.pickup_time.localeCompare(a.pickup_time));
  for (const p of pickups) {
    // Retain the latest successful duplicate instead of summing confirmations.
    if (p.failure_reason == null && !passengersByTransportId.has(p.transport_id)) {
      passengersByTransportId.set(
        p.transport_id,
        p.passengers_picked ?? 0,
      );
    }
  }

  let adults = 0;
  let children = 0;
  let picked = 0;
  let notPicked = 0;
  let pending = 0;
  let cancelled = 0;
  let firstService = 0;
  let secondService = 0;
  let totalPassengersPicked = 0;

  for (const r of requests) {
    const seats = r.no_of_seats ?? 0;
    const childCount = r.no_of_children ?? 0;
    adults += Math.max(0, seats - childCount);
    children += childCount;

    if (r.status === "successful") {
      picked += 1;
      if (r.service_number === 1) firstService += 1;
      else if (r.service_number === 2) secondService += 1;
      // Preserve a recorded zero; fall back only when no successful pickup
      // confirmation exists (including legacy requests without an ID).
      totalPassengersPicked +=
        (r.documentId ? passengersByTransportId.get(r.documentId) : undefined) ?? seats;
    } else if (r.status === "failed") {
      notPicked += 1;
    } else if (r.status === "cancelled") {
      cancelled += 1;
    } else {
      pending += 1;
    }
  }

  const totalRequests = requests.length;
  const pickupRate =
    totalRequests > 0 ? picked / totalRequests : 0;

  return {
    sundayKey,
    totalRequests,
    adults,
    children,
    picked,
    notPicked,
    pending,
    cancelled,
    firstService,
    secondService,
    pickupRate,
    totalPassengersPicked,
  };
}
