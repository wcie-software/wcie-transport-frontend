"use client"

import { Place } from "@/app/models/place";
import { TransportUser, TransportUserSchema } from "@/app/models/user";
import { auth, db } from "@/app/utils/firebase_client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { getPlaceDetails, getPlacePredictions } from "@/app/actions/google_maps";
import { MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { onAuthStateChanged, User } from "firebase/auth";
import { redirect, RedirectType } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";

export default function AddressPage() {
	const [places, setPlaces] = useState<Place[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [defaultAddress, setDefaultAddress] = useState<string | null>(null);

	// Get user's address from database and search for it automatically
	// This is called only once (or once the user's settings are loaded)
	useEffect(() => {
		if (user && !defaultAddress) {
			const firestore = new FirestoreHelper(db);
			firestore.getDocument<TransportUser>(
				FirestoreCollections.Users,
				user.uid,
				TransportUserSchema
			).then((transportUser) => {
				if (transportUser?.address) {
					setDefaultAddress(transportUser.address);
					search(transportUser.address);
				}
			});
		}
	}, [user, defaultAddress]);

	// Wait for user's details to be loaded from firebase
	onAuthStateChanged(auth, (user) => {
		if (user) {
			setUser(user);
		} else {
			redirect("/login", RedirectType.replace);
		}
	});

	// Avoid calling function back-to-back by using a debouncer
	// A debouncer creates a timer that resets every time it's called
	// Once the timer hits zero, the function is called
	const search = useDebouncedCallback(async (q: string) => {
		try {
			const places = await getPlacePredictions(q);
			setPlaces(places);
		} catch (e) {
			toast.error("Failed to load locations. Ensure you're connected to the internet.");
			console.error(e);
		}
	}, 400);

	async function sendToFillout(place: Place) {
		const details = await getPlaceDetails(place.id);

		// Send user's details to database
		const firestore = new FirestoreHelper(db);
		await firestore.addDocument(
			FirestoreCollections.Users,
			{
				address: place.text,
				phone_number: user!.phoneNumber!,
				location_details: details
			} as TransportUser,
			user!.uid,
			true // Allow updating
		);

		const formURL = "https://wcie.fillout.com/transport";

		// Set up required params for Fillout
		const params = new URLSearchParams();
		params.set("phone_number", encodeURIComponent(user!.phoneNumber!));
		params.set("auth_token", encodeURIComponent(await user!.getIdToken()));
		params.set("name", encodeURIComponent(user!.displayName ?? ""));

		// Redirect to Fillout
		redirect(`${formURL}?${params.toString()}`, RedirectType.replace);
	}

	return (
		<div className="flex flex-col gap-6 items-start justify-start max-w-2xl w-full mx-4">
			{user ?
				<>
					<div className="flex flex-col gap-1.5 w-full">
						<h2 className="text-lg font-semibold">Enter Pickup Location</h2>
						<input
							type="text"
							className="outline-0 placeholder-gray-500 w-full truncate font-bold text-4xl"
							placeholder={defaultAddress ?? "12950 50 Street NW"}
							onChange={(event) => {
								const text = event.target.value.trim();
								if (text.length > 0) {
									search(text);
								} else {
									setPlaces([]);
								}
							}} />
					</div>
					<ul className="w-full">
						{places.map((p) =>
							<li
								key={p.id}
								className="group cursor-pointer p-2 hover:bg-tertiary w-full flex flex-row items-center gap-1.5"
								onClick={(_) => sendToFillout(p)}>
								<MapPinIcon width={24} height={24} className="shrink-0" />
								<p className="text-lg truncate">{p.text}</p>
								<ArrowRightIcon
									className="ml-auto outline-none hidden group-hover:block"
									width={24}
									height={24} />
							</li>
						)}
					</ul>
				</>
				:
				<div>
					Loading...
				</div>
			}
		</div>
	);
}