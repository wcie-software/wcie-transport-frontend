"use server";

import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { PickupInfo, PickupInfoSchema } from "@/app/models/pickup_info";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "../utils/firestore_admin";
import {
  defaultFormatter,
  getWeekRange,
  parseSundayKey,
} from "@/app/utils/util";

/**
 * Per-week transportation report row.
 * - `picked` counts requests with a successful `pickup_info` record.
 * - `notPicked` counts requests with a failed `pickup_info` record.
 * - `pending` counts requests with no `pickup_info` record yet.
 * - `adults` = `no_of_seats - no_of_children` (approximation; no gender data today).
 * - `pickupRate` = `picked / totalRequests` (0 if no requests).
 */
export type WeeklyReport = {
  sundayKey: string;
  totalRequests: number;
  adults: number;
  children: number;
  picked: number;
  notPicked: number;
  pending: number;
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
 * For each week:
 * 1. Query `requests` by `timestamp` range (Monday 00:00 → Sunday 23:59),
 *    excluding cancelled requests.
 * 2. Query `pickup_info` by `pickup_time` range (the Sunday date, since
 *    `pickup_time` is stored as `YYYY/MM/DD` via `defaultFormatter`).
 * 3. Join `pickup_info` to `requests` via `transport_id` to classify each
 *    request as picked / notPicked / pending.
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
  const sundayDateOnly = defaultFormatter(sunday);

  const requests = (
    await fdb.queryCollection<TransportRequest>(
      FirestoreCollections.Requests,
      TransportRequestSchema,
      [
        { field: "timestamp", operator: ">=", value: start },
        { field: "timestamp", operator: "<=", value: end },
      ],
      "timestamp",
    )
  ).filter((r) => r.status !== "cancelled");

  const pickups = await fdb.queryCollection<PickupInfo>(
    FirestoreCollections.PickupInfo,
    PickupInfoSchema,
    [
      { field: "pickup_time", operator: ">=", value: sundayDateOnly },
      { field: "pickup_time", operator: "<=", value: sundayDateOnly },
    ],
  );

  const pickupByTransportId = new Map<string, PickupInfo>();
  for (const p of pickups) {
    pickupByTransportId.set(p.transport_id, p);
  }

  let adults = 0;
  let children = 0;
  let picked = 0;
  let notPicked = 0;
  let pending = 0;
  let firstService = 0;
  let secondService = 0;
  let totalPassengersPicked = 0;

  for (const r of requests) {
    const seats = r.no_of_seats ?? 0;
    const childCount = r.no_of_children ?? 0;
    adults += Math.max(0, seats - childCount);
    children += childCount;

    const info = r.documentId
      ? pickupByTransportId.get(r.documentId)
      : undefined;

    if (!info) {
      pending += 1;
    } else if (info.failure_reason == null) {
      picked += 1;
      totalPassengersPicked += info.passengers_picked ?? 0;
      if (r.service_number === 1) firstService += 1;
      else if (r.service_number === 2) secondService += 1;
    } else {
      notPicked += 1;
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
    firstService,
    secondService,
    pickupRate,
    totalPassengersPicked,
  };
}