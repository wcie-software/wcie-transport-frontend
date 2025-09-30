// import { PlacesClient } from "@googlemaps/places";
import Place from "@/app/models/place";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const endpoint = "https://places.googleapis.com/v1/places:autocomplete";

	const q = request.nextUrl.searchParams.get("q");
	if (!q) {
		return new Response("Missing 'q' parameter", {status: 403});
	}

	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"X-Goog-FieldMask": "suggestions.placePrediction.text.text,suggestions.placePrediction.placeId",
				"X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
			},
			body: JSON.stringify({
				input: q,
				includedRegionCodes: ["ca"],
			}),
		});
		const body = await response.json();
		if (!("suggestions" in body)) {
			return NextResponse.json([]);
		}
		
		const suggestions: Place[] = [];
		for (const suggestion of body["suggestions"]) {
			const prediction = suggestion["placePrediction"];
			const id = prediction["placeId"];
			const text = prediction["text"]["text"];

			suggestions.push({placeId: id, text: text});
		}

		return NextResponse.json(suggestions);
	} catch(e) {
		console.error(e);
		return NextResponse.error();
	}
}