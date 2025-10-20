import { QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import TransportRequest from "@/app/models/request";

export const requestConverter = {
	toFirestore: (request: TransportRequest) => {
		return {};
	},
	fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
		const data = snapshot.data(options);
		return {
			address: data.address,
			fullName: data.full_name,
			googleMapsLink: data.google_maps_link,
			noOfChildren: parseInt(data.no_of_children ?? "0"),
			noOfSeats: parseInt(data.no_of_seats),
			phoneNumber: data.phone_number,
			serviceNumber: parseInt(data.service_number),
			timestamp: new Date(data.timestamp),
		} as TransportRequest;
	}
}