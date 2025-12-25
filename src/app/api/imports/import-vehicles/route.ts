import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest } from "next/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { Vehicle } from "@/app/models/vehicle";

const vehiclesData: Vehicle[] = [
	{ documentId: '1AHEOWH0c58J1mDdc5J4', name: 'Sienna W', plate_number: 'WCIE 2', seating_capacity: 6, year: 2020, active: false, remarks: "" },
	{ documentId: 'GCeUkavrmXxE52JPAEaK', name: 'Ford Van', plate_number: 'WCIE 1', seating_capacity: 11, year: 2022, active: false, remarks: "" },
	{ documentId: 'ICZI7QOAQk3vak9ibTtY', name: 'Chevrolet Van', plate_number: 'CFJ-4140', seating_capacity: 13, year: 2008, active: false, remarks: "" },
	{ documentId: 'UAJGnZ8rNa6wDVfWmwkW', name: 'Toyota Sienna', plate_number: 'BSG-9052', seating_capacity: 7, year: 2005, active: false, remarks: "" },
	{ documentId: 'qRGGi0m6LYYqmnkzYtsh', active: false, name: 'Ford Flex', plate_number: 'CLM-4052', seating_capacity: 6, year: 2011, remarks: "" },
];

export async function GET(req: NextRequest) {
	if (process.env.NODE_ENV !== "development") {
		return new Response("Not allowed", { status: 403 });
	}

	const { db } = await getFirebaseAdmin();
	const vehicles = db.collection(FirestoreCollections.Vehicles);
	
	for (const vehicle of vehiclesData) {
		try {
			const id = vehicle.documentId!;

			delete vehicle.documentId;
			await vehicles.doc(id).set(vehicle);
			console.log(`Imported vehicle: ${vehicle.name}`);
		} catch (e) {
			console.error(`Error importing vehicle ${vehicle.name}: ${e}`);
		}
	}
		
	return new Response("Done");
}