"use client"

import { Place } from "@/app/models/place";
import { TransportUser, TransportUserSchema } from "@/app/models/user";
import { auth, db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { getPlaceDetails, getPlacePredictions } from "@/app/utils/google_maps";
import { MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { onAuthStateChanged, User } from "firebase/auth";
import { redirect, RedirectType } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function AddressPage() {
	const [places, setPlaces] = useState<Place[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [defaultAddress, setDefaultAddress] = useState<string | null>(null);

	const search = useDebouncedCallback(async (q: string) => {
		// TODO: Error handling
		const places = await getPlacePredictions(q);
		setPlaces(places);
	}, 400);

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

	onAuthStateChanged(auth, (user) => {
		if (user) {
			setUser(user);
		} else {
			redirect("/login", RedirectType.replace);
		}
	})

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
							}}/>
					</div>
					<ul className="w-full">
						{places.map((p) => 
							<li
								key={p.id}
								className="group cursor-pointer p-2 hover:bg-gray-800 w-full flex flex-row items-center gap-1.5"
								onClick={async (_) => {
									const details = await getPlaceDetails(p.id);
									const transportUser: TransportUser = {
										address: p.text,
										phone_number: user!.phoneNumber!,
										location_details: details
									};

									const firestore = new FirestoreHelper(db);
									await firestore.addDocument(
										FirestoreCollections.Users,
										transportUser,
										user!.uid,
									);

									const formURL = "https://wcie.fillout.com/transport";

									const encodedPhone = encodeURIComponent(user!.phoneNumber!);
									const encodedToken = encodeURIComponent(await user!.getIdToken());
									const encodedName = encodeURIComponent(user!.displayName ?? "")
									const params = `?phone_number=${encodedPhone}&auth_token=${encodedToken}&name=${encodedName}`;

									redirect(formURL + params, RedirectType.replace);
							}}>
								<MapPinIcon width={24} height={24} className="shrink-0"/>
								<p className="text-lg truncate">{p.text}</p>
								<ArrowRightIcon
									className="ml-auto outline-none hidden group-hover:block"
									width={24}
									height={24}/>
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