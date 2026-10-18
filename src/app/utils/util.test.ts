import { describe, test, expect } from "vitest";
import {
  addEdmontonDays,
  defaultFormatter,
  formatSundayKey,
  formatWeekLabel,
  getMultiWeekRange,
  getNearestSunday,
  getServiceSunday,
  getWeekEnd,
  getWeekRange,
  getWeekStart,
  parseSundayKey,
} from "@/app/utils/util";

describe("parseSundayKey", () => {
  test("parses M-D-YYYY", () => {
    const d = parseSundayKey("2-8-2026");
    expect(d).not.toBeNull();
    expect(d!.toISOString()).toBe("2026-02-08T19:00:00.000Z");
  });

  test("returns null for malformed input", () => {
    expect(parseSundayKey("not-a-date")).toBeNull();
    expect(parseSundayKey("")).toBeNull();
  });

  test.each(["2-30-2026", "13-1-2026", "0-1-2026", "2-29-2026", "2.5-8-2026", " 2-8-2026", "2-8-Infinity"])(
    "rejects invalid calendar key %s", (key) => {
      expect(parseSundayKey(key)).toBeNull();
    },
  );

  test("accepts leap day without rolling it into March", () => {
    expect(defaultFormatter(parseSundayKey("2-29-2028")!)).toBe("2028/02/29");
  });
});

describe("getNearestSunday", () => {
  test("returns same day if already Sunday", () => {
    const sun = new Date("2026-02-08T12:00:00-07:00");
    expect(formatSundayKey(getNearestSunday(sun))).toBe("2-8-2026");
  });

  test("rolls forward to next Sunday from Monday", () => {
    const mon = new Date("2026-02-09T12:00:00-07:00");
    expect(formatSundayKey(getNearestSunday(mon))).toBe("2-15-2026");
  });

  test("rolls forward to next Sunday from Saturday", () => {
    const sat = new Date("2026-02-07T12:00:00-07:00");
    expect(formatSundayKey(getNearestSunday(sat))).toBe("2-8-2026");
  });
});

describe("getServiceSunday", () => {
  test("Saturday submission returns next Sunday", () => {
    // Feb 7, 2026 is Saturday
    const sat = new Date("2026-02-07T12:00:00-07:00");
    expect(formatSundayKey(getServiceSunday(sat))).toBe("2-8-2026");
  });

  test("Sunday morning submission returns NEXT Sunday (+7)", () => {
    // Feb 1, 2026 is Sunday
    const sun = new Date("2026-02-01T08:00:00-07:00");
    expect(formatSundayKey(getServiceSunday(sun))).toBe("2-8-2026");
  });

  test("Monday submission returns upcoming Sunday", () => {
    const mon = new Date("2026-02-02T12:00:00-07:00");
    expect(formatSundayKey(getServiceSunday(mon))).toBe("2-8-2026");
  });

  test("Friday submission returns upcoming Sunday", () => {
    const fri = new Date("2026-02-06T12:00:00-07:00");
    expect(formatSundayKey(getServiceSunday(fri))).toBe("2-8-2026");
  });

  test("late Monday submission (after service) rolls to NEXT Sunday", () => {
    // Feb 9, 2026 is Monday — after Feb 8 service
    const mon = new Date("2026-02-09T12:00:00-07:00");
    expect(formatSundayKey(getServiceSunday(mon))).toBe("2-15-2026");
  });

  test("service Sunday itself rolls to NEXT Sunday", () => {
    // Feb 8, 2026 is the service day
    const sun = new Date("2026-02-08T12:00:00-07:00");
    expect(formatSundayKey(getServiceSunday(sun))).toBe("2-15-2026");
  });
});

describe("Edmonton calendar boundaries", () => {
  test.each([
    ["2026-02-08T06:59:59Z", "2-8-2026"], // Saturday in Edmonton
    ["2026-02-08T07:00:00Z", "2-15-2026"], // Sunday midnight
    ["2026-03-08T08:59:59Z", "3-15-2026"], // before spring DST jump
    ["2026-03-08T09:00:00Z", "3-15-2026"], // after spring DST jump
    ["2026-11-01T07:30:00Z", "11-8-2026"], // first 01:30
    ["2026-11-01T08:30:00Z", "11-8-2026"], // repeated 01:30
  ])("submission %s belongs to %s", (timestamp, key) => {
    expect(formatSundayKey(getServiceSunday(new Date(timestamp)))).toBe(key);
  });

  test("nearest Sunday does not roll forward on Sunday evening in Edmonton", () => {
    expect(formatSundayKey(getNearestSunday(new Date("2026-02-09T06:30:00Z"))))
      .toBe("2-8-2026");
  });

  test("keys use the Edmonton date even when UTC has rolled over", () => {
    expect(formatSundayKey(new Date("2026-02-09T06:30:00Z"))).toBe("2-8-2026");
  });

  test.each([
    ["3-8-2026", "2026/03/01", "2026/03/08"],
    ["3-15-2026", "2026/03/08", "2026/03/15"],
    ["11-1-2026", "2026/10/25", "2026/11/01"],
    ["11-8-2026", "2026/11/01", "2026/11/08"],
    ["1-4-2026", "2025/12/28", "2026/01/04"],
  ])("%s has stable submission bounds", (key, start, end) => {
    expect(getWeekRange(parseSundayKey(key)!)).toEqual({ start, end });
  });

  test("day arithmetic preserves the noon-MST anchor across DST", () => {
    expect(addEdmontonDays(parseSundayKey("3-8-2026")!, 7).toISOString())
      .toBe("2026-03-15T19:00:00.000Z");
  });
});

describe("getWeekStart", () => {
  test("returns previous Sunday for Feb 8 service", () => {
    const sunday = parseSundayKey("2-8-2026")!;
    expect(defaultFormatter(getWeekStart(sunday))).toBe("2026/02/01");
  });

  test("month boundary: Mar 1 service returns Feb 22", () => {
    const sunday = parseSundayKey("3-1-2026")!;
    expect(defaultFormatter(getWeekStart(sunday))).toBe("2026/02/22");
  });

  test("year boundary: Jan 1, 2026 service returns Dec 25, 2025", () => {
    const sunday = parseSundayKey("1-1-2026")!;
    expect(defaultFormatter(getWeekStart(sunday))).toBe("2025/12/25");
  });
});

describe("getWeekEnd", () => {
  test("returns service Sunday for Feb 8 service", () => {
    const sunday = parseSundayKey("2-8-2026")!;
    expect(defaultFormatter(getWeekEnd(sunday))).toBe("2026/02/08");
  });

  test("month boundary: Mar 1 service returns Mar 1", () => {
    const sunday = parseSundayKey("3-1-2026")!;
    expect(defaultFormatter(getWeekEnd(sunday))).toBe("2026/03/01");
  });
});

describe("getWeekRange", () => {
  test("Feb 8 service returns [Feb 1, Feb 8) regardless of server timezone", () => {
    const sunday = parseSundayKey("2-8-2026")!;
    const { start, end } = getWeekRange(sunday);
    expect(start).toBe("2026/02/01");
    expect(end).toBe("2026/02/08");
  });

  test("month boundary: Mar 1 service returns [Feb 22, Mar 1)", () => {
    const sunday = parseSundayKey("3-1-2026")!;
    const { start, end } = getWeekRange(sunday);
    expect(start).toBe("2026/02/22");
    expect(end).toBe("2026/03/01");
  });

  test("year boundary: Jan 1, 2026 service returns [Dec 25, 2025, Jan 1, 2026)", () => {
    const sunday = parseSundayKey("1-1-2026")!;
    const { start, end } = getWeekRange(sunday);
    expect(start).toBe("2025/12/25");
    expect(end).toBe("2026/01/01");
  });
});

describe("getMultiWeekRange", () => {
  test("spans from first week's start to last week's end", () => {
    const first = parseSundayKey("1-11-2026")!;
    const last = parseSundayKey("2-8-2026")!;
    const { start, end } = getMultiWeekRange(first, last);
    expect(start).toBe("2026/01/04");
    expect(end).toBe("2026/02/08");
  });
});

describe("formatWeekLabel", () => {
  test("Feb 8 service displays as 'Feb 1, 2026 – Feb 7, 2026' in Edmonton", () => {
    const sunday = parseSundayKey("2-8-2026")!;
    expect(formatWeekLabel(sunday)).toBe("Feb 1, 2026 – Feb 7, 2026");
  });

  test("month boundary: Mar 1 service displays as 'Feb 22 – Feb 28'", () => {
    const sunday = parseSundayKey("3-1-2026")!;
    expect(formatWeekLabel(sunday)).toBe("Feb 22, 2026 – Feb 28, 2026");
  });
});
