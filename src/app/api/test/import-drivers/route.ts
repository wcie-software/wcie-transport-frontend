import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest } from "next/server";
import { parse } from "@fast-csv/parse";
import { createReadStream } from "fs";
import { FirestoreCollections } from "@/app/utils/firestore";
import { getPlaceDetails, getPlacePredictions } from "@/app/utils/google_maps";

export async function GET(req: NextRequest) {
	if (process.env.NODE_ENV !== "development") {
		return new Response("Not allowed", { status: 403 });
	}

	const { app, auth, db } = await getFirebaseAdmin();
	const drivers = db.collection(FirestoreCollections.Drivers);
	
	createReadStream(process.cwd() + "/src/test/data/drivers.csv")
		.pipe(parse({ headers: true, delimiter: "," }))
		.on("error", error => {
			console.error(error);
		})
		.on("data", async row => {
			const full_name = String(row["FirstName"]).trim() + " " + String(row["LastName"]).trim();
			const email = row["Email Address"];
			const phone_number = "+1" + row["Phone number"];
			const address = row["Address"] + " " + row["Postal Code"];
			const driver_license_class = row["Driver's License classification"];
			const comments = row["Comments"] || "";

			const place = (await getPlacePredictions(address))[0];
			const placeDetails = await getPlaceDetails(place.id);

			try {
				await drivers.add({
					full_name: full_name,
					email: email,
					phone_number: phone_number,
					address: place.text,
					location: placeDetails.location,
					driver_license_class: driver_license_class,
					comments: comments,
				});
				console.log(`Imported driver: ${full_name}`);
			} catch (e) {
				console.error(`Error importing driver ${full_name}: ${e}`);
			}
		})
		.on("end", (rowCount: number) => `Parsed ${rowCount} rows`);
		
	return new Response("Done");
}