import { NextRequest } from "next/server";

export function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not allowed", { status: 403 });
  }

  const importUrls = [
    "/api/imports/import-drivers",
    "/api/imports/import-vehicles",
    "/api/imports/import-requests",
    "/api/imports/import-schedules",
    "/api/imports/import-assignments",
    "/api/imports/import-admin",
  ];

  importUrls.forEach(async (url) => {
    try {
      await fetch(`${req.nextUrl.origin}${url}`, {
        method: "GET",
      });
      console.log(`Called import route: ${url}`);
    } catch (e) {
      return new Response(`Error calling import route ${url}: ${e}`, {
        status: 500,
      });
    }
  });

  return new Response("Imports completed.");
}
