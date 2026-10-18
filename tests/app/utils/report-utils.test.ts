import { describe, expect, test } from "vitest";
import type { WeeklyReport } from "@/app/actions/generate_report";
import { formatReportSunday, getReportRange, reportsToCsv } from "@/app/utils/report-utils";

const report: WeeklyReport = {
  sundayKey: "2-8-2026", totalRequests: 4, adults: 6, children: 2,
  picked: 2, notPicked: 1, pending: 0, cancelled: 1,
  firstService: 1, secondService: 1, pickupRate: 0.5,
  totalPassengersPicked: 3,
};

describe("getReportRange", () => {
  test("defaults to eight weeks ending on the current Sunday in Edmonton", () => {
    // UTC is already Monday, but Edmonton is still on Sunday.
    expect(getReportRange({}, new Date("2026-02-09T06:30:00Z"))).toEqual({
      startKey: "12-21-2025", endKey: "2-8-2026",
    });
  });

  test("defaults to the upcoming Sunday on weekdays", () => {
    expect(getReportRange({}, new Date("2026-02-10T19:00:00Z"))).toEqual({
      startKey: "12-28-2025", endKey: "2-15-2026",
    });
  });

  test("an explicit end date anchors the default start date across DST", () => {
    expect(getReportRange({ end: "3-15-2026" })).toEqual({
      startKey: "1-25-2026", endKey: "3-15-2026",
    });
  });

  test("preserves explicitly selected service Sundays", () => {
    expect(getReportRange({ start: "2-8-2026", end: "2-8-2026" })).toEqual({
      startKey: "2-8-2026", endKey: "2-8-2026",
    });
  });

  test("does not hide invalid or reversed URL values from action validation", () => {
    expect(getReportRange({ start: "bad", end: "2-30-2026" })).toEqual({
      startKey: "bad", endKey: "2-30-2026",
    });
    expect(getReportRange({ start: "2-15-2026", end: "2-8-2026" })).toEqual({
      startKey: "2-15-2026", endKey: "2-8-2026",
    });
  });
});

describe("report labels and CSV", () => {
  test("labels the service Sunday, not its submission-window start", () => {
    expect(formatReportSunday(report.sundayKey)).toBe("Feb 8, 2026");
    expect(formatReportSunday("3-15-2026")).toBe("Mar 15, 2026");
  });

  test("invalid labels remain visible instead of silently becoming today", () => {
    expect(formatReportSunday("invalid")).toBe("invalid");
  });

  test("CSV identifies the service Sunday and retains all counts and zeros", () => {
    const [header, row] = reportsToCsv([report]).split("\n");
    expect(header).toBe("Service Sunday,Total Requests,Adults,Children,Picked,Not Picked,Pending,Cancelled,1st Service,2nd Service,Pickup Rate,Passengers Picked");
    expect(row).toBe("2-8-2026,4,6,2,2,1,0,1,1,1,50.0%,3");
  });

  test("multiple CSV rows preserve their service dates and order", () => {
    const csv = reportsToCsv([report, { ...report, sundayKey: "2-15-2026" }]);
    expect(csv.split("\n").map((line) => line.split(",")[0]))
      .toEqual(["Service Sunday", "2-8-2026", "2-15-2026"]);
  });

  test("empty exports include the header", () => {
    expect(reportsToCsv([])).toMatch(/^Service Sunday,.*\n$/);
  });

  test("CSV escapes quotes, commas, and newlines", () => {
    expect(reportsToCsv([{ ...report, sundayKey: 'date,"quoted"\nvalue' }]))
      .toContain('"date,""quoted""\nvalue",4,');
  });
});
