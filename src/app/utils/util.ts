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
 * Returns the nearest Sunday (future or same day) for the given date.
 * If `date` is already a Sunday, returns it unchanged (time preserved).
 */
export function getNearestSunday(date: Date): Date {
  const sunday = new Date(date);
  if (sunday.getDay() !== 0) {
    sunday.setDate(sunday.getDate() + (7 - sunday.getDay()));
  }
  return sunday;
}

/**
 * Given a submission date, returns the service Sunday it belongs to.
 * A request submitted on Sunday morning belongs to the *next* Sunday
 * (not the current one), per the week model where the submission window
 * for service Sunday S is [S-7 00:00, S 00:00).
 */
export function getServiceSunday(submissionDate: Date): Date {
  const service = new Date(submissionDate);
  // Sunday submissions roll to next Sunday (+7); all other days roll to
  // the upcoming Sunday. `(7 - day) % 7` would yield 0 for Sunday, so we
  // fall back to 7 in that case.
  const daysUntilSunday =
    service.getDay() === 0 ? 7 : 7 - service.getDay();
  service.setDate(service.getDate() + daysUntilSunday);
  service.setHours(11, 59, 0, 0);
  return service;
}

/**
 * Returns the submission-window start (previous Sunday 00:00) for a given
 * service Sunday. This is the first day a request can be submitted for
 * that service Sunday.
 */
export function getWeekStart(serviceSunday: Date): Date {
  const start = new Date(serviceSunday);
  start.setDate(serviceSunday.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Returns the submission-window end (service Sunday 00:00, exclusive)
 * for a given service Sunday. This is the exclusive upper bound for
 * `timestamp < end` Firestore queries.
 */
export function getWeekEnd(serviceSunday: Date): Date {
  const end = new Date(serviceSunday);
  end.setHours(0, 0, 0, 0);
  return end;
}

/**
 * Formats a Date into the canonical Sunday key `M-D-YYYY` (no padding),
 * matching the document ID used for `schedules` and `assigned-routes`.
 */
export function formatSundayKey(date: Date): string {
  return date.toLocaleDateString("en-US").replaceAll("/", "-");
}

/**
 * Returns the Firestore query range for a single service Sunday's submission
 * window: `[S-7 00:00, S 00:00)`. Use with `timestamp >= start && timestamp < end`.
 *
 * A request submitted during this window is for `sunday`'s service. A
 * Sunday-morning submission belongs to the *next* Sunday's week.
 */
export function getWeekRange(sunday: Date): { start: string; end: string } {
  return {
    start: defaultFormatter(getWeekStart(sunday)),
    end: defaultFormatter(getWeekEnd(sunday)),
  };
}

/**
 * Returns the Firestore query range covering multiple service Sundays
 * (inclusive). Use with `timestamp >= start && timestamp < end`.
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
 * (previous Sunday → Saturday). Used by the Requests screen.
 */
export function formatWeekLabel(serviceSunday: Date): string {
  const weekStart = getWeekStart(serviceSunday);
  const weekEnd = new Date(serviceSunday);
  weekEnd.setDate(serviceSunday.getDate() - 1);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton",
    dateStyle: "medium",
  });
  return `${dateFormatter.format(weekStart)} – ${dateFormatter.format(weekEnd)}`;
}

/**
 * Parses a `M-D-YYYY` Sunday key into a Date at 11:59 local time.
 * Returns null if the string is malformed.
 */
export function parseSundayKey(key: string): Date | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [month, date, year] = parts;
  if (!month || !date || !year) return null;
  return new Date(year, month - 1, date, 11, 59, 0, 0);
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
