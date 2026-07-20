import { describe, test, expect } from "vitest";
import {
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
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(1); // Feb (0-indexed)
    expect(d!.getDate()).toBe(8);
  });

  test("returns null for malformed input", () => {
    expect(parseSundayKey("not-a-date")).toBeNull();
    expect(parseSundayKey("")).toBeNull();
  });
});

describe("getNearestSunday", () => {
  test("returns same day if already Sunday", () => {
    const sun = new Date(2026, 1, 8, 12, 0);
    expect(formatSundayKey(getNearestSunday(sun))).toBe("2-8-2026");
  });

  test("rolls forward to next Sunday from Monday", () => {
    const mon = new Date(2026, 1, 9, 12, 0);
    expect(formatSundayKey(getNearestSunday(mon))).toBe("2-15-2026");
  });

  test("rolls forward to next Sunday from Saturday", () => {
    const sat = new Date(2026, 1, 7, 12, 0);
    expect(formatSundayKey(getNearestSunday(sat))).toBe("2-8-2026");
  });
});

describe("getServiceSunday", () => {
  test("Saturday submission returns next Sunday", () => {
    // Feb 7, 2026 is Saturday
    const sat = new Date(2026, 1, 7, 12, 0);
    expect(formatSundayKey(getServiceSunday(sat))).toBe("2-8-2026");
  });

  test("Sunday morning submission returns NEXT Sunday (+7)", () => {
    // Feb 1, 2026 is Sunday
    const sun = new Date(2026, 1, 1, 8, 0);
    expect(formatSundayKey(getServiceSunday(sun))).toBe("2-8-2026");
  });

  test("Monday submission returns upcoming Sunday", () => {
    const mon = new Date(2026, 1, 2, 12, 0);
    expect(formatSundayKey(getServiceSunday(mon))).toBe("2-8-2026");
  });

  test("Friday submission returns upcoming Sunday", () => {
    const fri = new Date(2026, 1, 6, 12, 0);
    expect(formatSundayKey(getServiceSunday(fri))).toBe("2-8-2026");
  });

  test("late Monday submission (after service) rolls to NEXT Sunday", () => {
    // Feb 9, 2026 is Monday — after Feb 8 service
    const mon = new Date(2026, 1, 9, 12, 0);
    expect(formatSundayKey(getServiceSunday(mon))).toBe("2-15-2026");
  });

  test("service Sunday itself rolls to NEXT Sunday", () => {
    // Feb 8, 2026 is the service day
    const sun = new Date(2026, 1, 8, 12, 0);
    expect(formatSundayKey(getServiceSunday(sun))).toBe("2-15-2026");
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
