export const EMAIL_LOCALSTORAGE_KEY = "wcie-transport-email";
export const SESSION_COOKIE_KEY = "wcie-transport-session";
export const IS_ADMIN_COOKIE_KEY = "wcie-transport-is-admin";

export const NUMBER_SUFFIX: Record<number, string> = { 1: "st", 2: "nd", 3: "rd", 4: "th" };

// 11/01/2025 
export const TIMESTAMP_FORMATTER = Intl.DateTimeFormat("en-US", {
	timeZone: "America/Edmonton",
	month: "2-digit",
	day: "2-digit",
	year: "numeric"
});