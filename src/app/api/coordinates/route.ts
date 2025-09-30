import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const endpoint = "https://places.googleapis.com/v1/places";

	const placeId = request.nextUrl.searchParams.get("placeId");
	if (!placeId) {
		return new Response("Missing 'placeId' parameter", {status: 403});
	}

	try {
		const response = await fetch(`${endpoint}/${placeId}?regionCode=ca`, {
			method: "GET",
			headers: {
				"Accept": "application/json",
				"X-Goog-FieldMask": "location",
				"X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
			},
		});
		const body = await response.json();
		return NextResponse.json(body["location"]);
	} catch (e) {
		console.error(e);
		return NextResponse.error();
	}
}