import { createTheme } from "@mui/material";

export const EMAIL_LOCALSTORAGE_KEY = "wcie-transport-email";
export const SESSION_COOKIE_KEY = "wcie-transport-session";
export const IS_ADMIN_COOKIE_KEY = "wcie-transport-is-admin";

export const NUMBER_SUFFIX: Record<number, string> = {
  1: "st",
  2: "nd",
  3: "rd",
  4: "th",
};

// 11/01/2025
export const TIMESTAMP_FORMATTER = Intl.DateTimeFormat("en-US", {
  timeZone: "America/Edmonton",
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
});

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
