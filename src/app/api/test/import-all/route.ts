import { NextRequest } from "next/server";

export function GET(req: NextRequest) {
	const importUrls = [
		"/api/test/import-drivers",
		"/api/test/import-vehicles",
		"/api/test/import-requests",
	];

	importUrls.forEach(async (url) => {
		try {
			await fetch(`${req.nextUrl.origin}${url}`, {
				method: "GET",
			});
			console.log(`Called import route: ${url}`);
		} catch (e) {
			return new Response(`Error calling import route ${url}: ${e}`, { status: 500 });
		}
	});

	return new Response("Imports completed.");
}