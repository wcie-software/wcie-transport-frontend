import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest, NextResponse } from "next/server";
import { parse } from "@fast-csv/parse";
import { createReadStream } from "fs";
import { FirestoreCollections } from "@/app/utils/firestore";

export async function GET(req: NextRequest) {
	if (process.env.NODE_ENV !== "development") {
		return new Response("Not allowed", { status: 403 });
	}

	const { app, auth, db } = await getFirebaseAdmin();
	const requests = db.collection(FirestoreCollections.Requests);
	
	createReadStream(process.cwd() + "/src/test/data/requests.csv")
		.pipe(parse({ headers: true, delimiter: "," }))
		.on("error", error => {
			return new Response(String(error), {status: 500})
		})
		.on("data", row => {
			const d = new Date(row["timestamp"]);
			const f = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"});

			row["timestamp"] = f.format(d).replaceAll(",", "");
			row["phone_number"] = `+${row["phone_number"]}`;
			requests.add(row);
		})
		.on("end", (rowCount: number) => `Parsed ${rowCount} rows`);
		
	return new Response("Done");
}