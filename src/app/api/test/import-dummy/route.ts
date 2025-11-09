import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest, NextResponse } from "next/server";
import { parse } from "@fast-csv/parse";
import { createReadStream } from "fs";
import { FirestoreCollections } from "@/app/utils/firestore";

export async function GET(req: NextRequest) {
	const { app, auth, db } = await getFirebaseAdmin();
	const requests = db.collection(FirestoreCollections.Requests);
	
	createReadStream(process.cwd() + "/src/test/data/requests.csv")
		.pipe(parse({ headers: true, delimiter: "," }))
		.on("error", error => {
			return new Response(String(error), {status: 500})
		})
		.on("data", row =>  requests.add(row))
		.on("end", (rowCount: number) => `Parsed ${rowCount} rows`);
		
	return new Response("Done")
}