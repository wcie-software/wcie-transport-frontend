"use client"

import { auth } from "@/app/utils/firebase";
import { signInWithLink } from "@/app/utils/firebase_email_auth";
import { EMAIL_LOCALSTORAGE_KEY } from "@/app/utils/constants";
import { useRouter } from "next/navigation";

export default function AdminPage() {
	// const router = useRouter();

	// if (!auth.currentUser) {
	// 	const email = localStorage.getItem(EMAIL_LOCALSTORAGE_KEY);
	// 	if (email) {
	// 		localStorage.removeItem(EMAIL_LOCALSTORAGE_KEY); // Clear from storage
	// 		const uid = await signInWithLink(email, window.location.href);
	// 		if (uid) {
	// 			// Check if user is admin
	// 		} else {
	// 			router.replace("/admin/login");
	// 		}
	// 	} else {
	// 		router.replace("/admin/login");
	// 	}
	// } else {
	// 	// Check if user is admin
	// }

	return (
		<div>
			Helllo
		</div>
	);
}