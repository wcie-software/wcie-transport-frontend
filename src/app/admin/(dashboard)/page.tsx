"use client"

import { auth } from "@/app/utils/firebase";
import { signInWithLink } from "@/app/utils/firebase_email_auth";
import { EMAIL_LOCALSTORAGE_KEY } from "@/app/utils/constants";
import { useRouter } from "next/navigation";
import { getRequests } from "@/app/utils/firestore";
import TransportRequest from "@/app/models/request";

export default async function AdminPage() {
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

	const tableHeaders = [
		"Date",
		"Name",
		"Phone",
		"Service",
		"Children / Seats",
		"Location"
	];

	const requests: TransportRequest[] = [];//await getRequests();

	return (
		<div className="w-full">
			<h1 className="text-4xl">Requests</h1>
			<table className="w-full max-w-2xl px-6 mt-12 border-spacing-0">
				<tr>
					{tableHeaders.map((h) =>
						<th key={h} className="text-sm font-normal text-gray-300">{h}</th>
					)}
				</tr>
				{requests.map((r) => 
					<tr>
						<td className="text-center">{r.timestamp.toDateString()}</td>
						<td className="text-center">{r.fullName}</td>
						<td className="text-center">{r.phoneNumber}</td>
						<td className="text-center">{r.serviceNumber}</td>
						<td className="text-center">{r.noOfChildren} / {r.noOfSeats}</td>
						<td>See location</td>
					</tr>
				)}
			</table>
		</div>
	);
}