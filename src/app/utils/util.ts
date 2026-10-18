import { createTheme } from "@mui/material";

export const Constants = {
  EMAIL_LOCALSTORAGE_KEY: "wcie-transport-email",
  SESSION_COOKIE_KEY: "wcie-transport-session",
  IS_ADMIN_COOKIE_KEY: "wcie-transport-is-admin",
  UID_HEADER_KEY: "X-Auth-UID",
  NUMBER_OF_SERVICES: 2,
  NUMBER_SUFFIX: {
    1: "st",
    2: "nd",
    3: "rd",
    4: "th",
  } as Record<number, string>,
};

/**
 * Formats a date to YYYY/MM/DD format using Edmonton time zone.
 * @param date The date to format
 * @returns Formatted date string
 */
export function defaultFormatter(date: Date): string {
  return toTimestamp(date).split(" ")[0];
}

/**
 * Formats a date to YYYY/MM/DD HH:MM:SS format using Edmonton time zone.
 * @param date The date to format
 * @returns Formatted datetime string
 */
export function toTimestamp(date: Date): string {
  return Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .format(date)
    .split(", ")
    .join(" ")
    .replaceAll("-", "/");
}

/**
 * Returns the upcoming or current Edmonton Sunday, anchored at noon MST.
 */
export function getNearestSunday(date: Date): Date {
  const calendarDate = addEdmontonDays(date, 0);
  return addEdmontonDays(calendarDate, (7 - calendarDate.getUTCDay()) % 7);
}

/**
 * Given a submission date, returns the service Sunday it belongs to.
 * A request submitted on Sunday morning belongs to the *next* Sunday
 * (not the current one), per the week model where the submission window
 * for service Sunday S is [S-7 00:00, S 00:00).
 */
export function getServiceSunday(submissionDate: Date): Date {
  const service = addEdmontonDays(submissionDate, 0);
  // Sunday submissions roll to next Sunday (+7); all other days roll to
  // the upcoming Sunday. `(7 - day) % 7` would yield 0 for Sunday, so we
  // fall back to 7 in that case.
  const daysUntilSunday =
    service.getUTCDay() === 0 ? 7 : 7 - service.getUTCDay();
  return addEdmontonDays(service, daysUntilSunday);
}

/**
 * Returns the submission-window start (previous Sunday 00:00) for a given
 * service Sunday. The returned Date is anchored at noon MST so that
 * `defaultFormatter` (which uses `America/Edmonton`) produces the correct
 * `YYYY/MM/DD` regardless of the server's local timezone.
 */
export function getWeekStart(serviceSunday: Date): Date {
  return addEdmontonDays(serviceSunday, -7);
}

/**
 * Returns the submission-window end (service Sunday 00:00, exclusive)
 * for a given service Sunday. The returned Date is anchored at noon MST so
 * that `defaultFormatter` produces the correct Edmonton `YYYY/MM/DD`.
 */
export function getWeekEnd(serviceSunday: Date): Date {
  return addEdmontonDays(serviceSunday, 0);
}

/**
 * Constructs a Date at noon MST (UTC-7) from a UTC epoch. Noon MST
 * avoids day-boundary shifts in any timezone. `Intl.DateTimeFormat` with
 * `timeZone: "America/Edmonton"` then reads this as the intended date.
 */
function mstDateFromUtc(utcMs: number): Date {
  // MST is UTC-7. Noon MST = 19:00 UTC.
  return new Date(utcMs + 19 * 60 * 60 * 1000);
}

/** Adds calendar days in Edmonton, returning a Date anchored at noon MST. */
export function addEdmontonDays(date: Date, days: number): Date {
  const [year, month, day] = defaultFormatter(date).split("/").map(Number);
  return mstDateFromUtc(Date.UTC(year, month - 1, day + days));
}

/**
 * Formats a Date into the canonical Sunday key `M-D-YYYY` (no padding),
 * matching the document ID used for `schedules` and `assigned-routes`.
 */
export function formatSundayKey(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "America/Edmonton",
  }).replaceAll("/", "-");
}

/**
 * Returns the Firestore query range for a single service Sunday's submission
 * window: `[S-7 00:00, S 00:00)` in Edmonton time. Use with
 * `timestamp >= start && timestamp < end`. The bounds are timezone-independent.
 */
export function getWeekRange(sunday: Date): { start: string; end: string } {
  return {
    start: defaultFormatter(getWeekStart(sunday)),
    end: defaultFormatter(getWeekEnd(sunday)),
  };
}

/**
 * Returns the Firestore query range covering multiple service Sundays
 * (inclusive) in Edmonton time.
 */
export function getMultiWeekRange(
  firstServiceSunday: Date,
  lastServiceSunday: Date,
): { start: string; end: string } {
  return {
    start: defaultFormatter(getWeekStart(firstServiceSunday)),
    end: defaultFormatter(getWeekEnd(lastServiceSunday)),
  };
}

/**
 * Formats the human-readable week label for a service Sunday as
 * "MMM DD, YYYY – MMM DD, YYYY" spanning the submission window
 * (previous Sunday → Saturday). Times are in Edmonton.
 */
export function formatWeekLabel(serviceSunday: Date): string {
  const weekStart = getWeekStart(serviceSunday);
  const weekEnd = addEdmontonDays(serviceSunday, -1);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton",
    dateStyle: "medium",
  });
  return `${dateFormatter.format(weekStart)} – ${dateFormatter.format(weekEnd)}`;
}

/**
 * Parses a `M-D-YYYY` Sunday key into a Date anchored at noon MST. Using
 * noon MST makes the date unambiguous regardless of the server's local
 * timezone; `Intl.DateTimeFormat` with `America/Edmonton` will read the
 * intended calendar date. Returns null if the string is malformed.
 */
export function parseSundayKey(key: string): Date | null {
  if (!/^\d{1,2}-\d{1,2}-\d{4}$/.test(key)) return null;
  const parts = key.split("-").map(Number);
  const [month, date, year] = parts;
  if (!month || !date || !year) return null;
  // Noon MST = 19:00 UTC. Use Date.UTC to construct, then add the offset
  // so that Intl.DateTimeFormat(timeZone: "America/Edmonton") reads the
  // intended Y/M/D.
  const utcMs = Date.UTC(year, month - 1, date) + 19 * 60 * 60 * 1000;
  const parsed = new Date(utcMs);
  // Reject invalid calendar dates instead of silently rolling into another month.
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== date
  ) return null;
  return parsed;
}

/**
 * Generates a deterministic bold color string from a given string input (like a route ID).
 * Written by Antigravity
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Multiply by a spread factor (approx golden angle) to separate similar strings
  const hue = Math.abs((hash * 137) % 360);

  // Add slight variance to saturation and lightness for extra distinctness
  // Using bitwise operations to extract "random" components from the same hash
  const saturation = 70 + (Math.abs(hash) % 30); // 70-100%
  const lightness = 45 + (Math.abs(hash >> 4) % 15); // 45-60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Cause mui components to use app's theme
export const MUITheme = createTheme({
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: "var(--primary)",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "inherit",
          "&.Mui-focused": {
            color: "var(--primary)",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: "inherit",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--primary)",
            borderWidth: "1px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--primary)",
          },
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "inherit",
          },
        },
      },
    },
  },
});
