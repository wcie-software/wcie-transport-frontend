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
  return Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date).replaceAll("-", "/");
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
