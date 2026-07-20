"use server";

import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { PickupInfo, PickupInfoSchema } from "@/app/models/pickup_info";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "../utils/firestore_admin";
import {
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
 * 2. Query `pickup_info` by `pickup_time == S` (drivers confirm pickups
 *    on the service Sunday itself). Used only to enrich the
 *    `totalPassengersPicked` total for successful requests.
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

  if (!startSunday || !endSunday) {
    return {
      success: false,
      message: "Invalid Sunday key format. Expected M-D-YYYY.",
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
    const cursor = new Date(startSunday);
    cursor.setHours(0, 0, 0, 0);

    while (cursor.getTime() <= endSunday.getTime()) {
      const week = await buildWeekReport(fdb, new Date(cursor));
      reports.push(week);
      cursor.setDate(cursor.getDate() + 7);
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
  const sundayKey = sunday
    .toLocaleDateString("en-US")
    .replaceAll("/", "-");

  const requests = await fdb.queryCollection<TransportRequest>(
    FirestoreCollections.Requests,
    TransportRequestSchema,
    [
      { field: "timestamp", operator: ">=", value: start },
      { field: "timestamp", operator: "<", value: end },
    ],
    "timestamp",
  );

  // pickup_info is only used to enrich the passengers-picked total.
  // Picked / not-picked / pending / cancelled counts come from
  // `request.status`, which is the same field the Requests screen colors
  // by. Query the full submission window (not just service Sunday) so
  // we don't miss pickups confirmed on a different day.
  const pickups = await fdb.queryCollection<PickupInfo>(
    FirestoreCollections.PickupInfo,
    PickupInfoSchema,
    [
      { field: "pickup_time", operator: ">=", value: start },
      { field: "pickup_time", operator: "<", value: end },
    ],
  );

  const passengersByTransportId = new Map<string, number>();
  for (const p of pickups) {
    if (p.failure_reason == null) {
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
      if (r.documentId) {
        // Prefer the passengers_picked recorded by the driver; fall back
        // to the requested seat count when no pickup_info doc exists
        // (e.g. legacy data, or a missing/failed write).
        totalPassengersPicked +=
          passengersByTransportId.get(r.documentId) ?? seats;
      }
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