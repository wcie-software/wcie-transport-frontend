import { auth } from "@/app/utils/firebase.browser";
import { signInWithCustomToken } from "firebase/auth";

export function sendOTP(phoneNumber: string) {
	// Send Twilio code
}

export function checkOTP(phoneNumber: string, code: string) {
	// Get custom token
	// Sign in using token
}
