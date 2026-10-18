import type { WeeklyReport } from "@/app/actions/generate_report";
import {
  addEdmontonDays,
  formatSundayKey,
  getNearestSunday,
  parseSundayKey,
} from "@/app/utils/util";

/** Default to eight service Sundays, including the upcoming/current Sunday. */
export function getReportRange(
  params: { start?: string; end?: string },
  now = new Date(),
): { startKey: string; endKey: string } {
  const endSunday = parseSundayKey(params.end ?? "") ?? getNearestSunday(now);
  return {
    // Preserve invalid URL values so the action reports them rather than
    // silently querying a different date range.
    startKey: params.start ?? formatSundayKey(addEdmontonDays(endSunday, -49)),
    endKey: params.end ?? formatSundayKey(endSunday),
  };
}

/** A service-date label shared by the chart and table, never the week start. */
export function formatReportSunday(key: string): string {
  const sunday = parseSundayKey(key);
  return sunday
    ? sunday.toLocaleDateString("en-US", {
        timeZone: "America/Edmonton",
        dateStyle: "medium",
      })
    : key;
}

const CSV_COLUMNS: { key: keyof WeeklyReport; label: string }[] = [
  { key: "sundayKey", label: "Service Sunday" },
  { key: "totalRequests", label: "Total Requests" },
  { key: "adults", label: "Adults" },
  { key: "children", label: "Children" },
  { key: "picked", label: "Picked" },
  { key: "notPicked", label: "Not Picked" },
  { key: "pending", label: "Pending" },
  { key: "cancelled", label: "Cancelled" },
  { key: "firstService", label: "1st Service" },
  { key: "secondService", label: "2nd Service" },
  { key: "pickupRate", label: "Pickup Rate" },
  { key: "totalPassengersPicked", label: "Passengers Picked" },
];

function toCsvCell(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function reportsToCsv(rows: WeeklyReport[]): string {
  const header = CSV_COLUMNS.map((c) => c.label).join(",");
  const body = rows.map((r) =>
    CSV_COLUMNS.map((c) => toCsvCell(
      c.key === "pickupRate" ? `${(r.pickupRate * 100).toFixed(1)}%` : r[c.key],
    )).join(","),
  ).join("\n");
  return `${header}\n${body}`;
}
