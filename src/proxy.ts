import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";

export async function proxy(request: NextRequest) {
	const basePath = request.nextUrl.pathname.split("/")[1];
	const adminLogin = basePath === "admin";
	const loginURL = adminLogin ? "/admin-login" : "/login";

	const sessionCookie = request.cookies.get("session");
	if (!sessionCookie) {
		console.warn("Session cookie does not exist.");
		return NextResponse.redirect(new URL(loginURL, request.url));
	}

	const { app, auth, db } = await getFirebaseAdmin();
	try {
		const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
		
		// Check if user is trying to access admin page, but doesn't have required privilege
		const userRole = request.cookies.get(`X-${decodedClaims.uid}-Role`);
		if ((!userRole || userRole.value !== "admin") && adminLogin) {
			return NextResponse.redirect(new URL(loginURL, request.url));
		}

		const res = NextResponse.next();
		res.headers.set("X-Proxy-UID", decodedClaims.uid);

		return res;
	} catch (e) {
		console.error("A session cookie exists, but it's invalid. " + e);

		const redirect = NextResponse.redirect(new URL(loginURL, request.url));
		redirect.cookies.delete("session");

		return redirect;
	}
}

export const config = {
	matcher: [
		"/request/:path*",
		"/admin/:path*",
	]
}
