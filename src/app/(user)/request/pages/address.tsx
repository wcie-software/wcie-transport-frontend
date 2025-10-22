"use client"

import { Place } from "@/app/models/place";
import { MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function AddressPage({ defaultAddress, onSelected }:
	{ defaultAddress?: string, onSelected?: (placeId: string, text: string) => void }
) {
	const [places, setPlaces] = useState<Place[]>([]);

	const search = useDebouncedCallback(async (q: string) => {
		const res = await fetch(`/api/maps?q=${q}`);
		const places = await res.json() as Place[];

		setPlaces(places);
	}, 400);

	return (
		<div className="flex flex-col gap-6 items-start justify-start w-full mx-4">
			<div className="flex flex-col gap-1.5 w-full">
				<h2 className="text-lg font-semibold">Enter Pickup Location</h2>
				<input
					type="text"
					defaultValue={defaultAddress}
					className="outline-0 placeholder-gray-500 w-full truncate font-bold text-4xl"
					placeholder="12950 50 Street NW"
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
						onClick={(e) => onSelected?.(p.id, p.text)}>
						<MapPinIcon width={24} height={24} className="shrink-0"/>
						<p className="text-lg truncate">{p.text}</p>
						<ArrowRightIcon
							className="ml-auto outline-none hidden group-hover:block"
							width={24}
							height={24}/>
					</li>
				)}
			</ul>
		</div>
	);
}