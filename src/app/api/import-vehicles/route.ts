import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest } from "next/server";
import { parse } from "@fast-csv/parse";
import { createReadStream } from "fs";
import { FirestoreCollections } from "@/app/utils/firestore";
import { Vehicle } from "@/app/models/vehicle";

export async function GET(req: NextRequest) {
	const { app, auth, db } = await getFirebaseAdmin();
	const vehicles = db.collection(FirestoreCollections.Vehicles);
	
	createReadStream(process.cwd() + "/src/test/data/vehicles.csv")
		.pipe(parse({ headers: true, delimiter: "," }))
		.on("error", error => {
			console.error(error);
		})
		.on("data", async row => {
			const name = row["Vehicle Name"];
			const year = parseInt(row["Model"]);
			const plate_number = row["License Plate"];
			const remarks = row["Remarks"] || "";
			const fuel_cost = row["Fuel Cost"] ? parseFloat(String(row["Fuel Cost"]).replace("$", "")) : null;
			const last_fuel_date = row["Fuel Date"] ? new Date(row["Fuel Date"]) : null;
			const maintenance_type = row["Maintenance Type"] || null;
			const last_maintenance_date = row["Maintenance Date"] ? new Date(row["Maintenance Date"]) : null;
			const maintenance_receipt_amount = row["Maintenance Receipt Amount"] ? parseFloat(String(row["Maintenance Receipt Amount"]).replace("$", "")) : null;

			try {
				await vehicles.add({
					name: name,
					year: year,
					plate_number: plate_number,
					remarks: remarks,
					fuel_cost: fuel_cost,
					last_fuel_date: last_fuel_date,
					maintenance_type: maintenance_type,
					last_maintenance_date: last_maintenance_date,
					maintenance_receipt_amount: maintenance_receipt_amount,
				} as Vehicle);
				console.log(`Imported vehicle: ${name}`);
			} catch (e) {
				console.error(`Error importing vehicle ${name}: ${e}`);
			}
		})
		.on("end", (rowCount: number) => `Parsed ${rowCount} rows`);
		
	return new Response("Done");
}