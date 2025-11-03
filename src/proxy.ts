import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "./app/utils/firebase_setup/server";

export async function proxy(request: NextRequest) {
	const sessionCookie = request.cookies.get("session");
	if (!sessionCookie) {
		console.warn("Session cookie does not exist.");
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const { app, auth, db } = await getFirebaseAdmin();
	try {
		const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);

		const res = NextResponse.next();
		res.headers.set("X-Proxy-UID", decodedClaims.uid);

		return res;
	} catch (e) {
		console.error("A session cookie exists, but it's invalid. " + e);

		const redirect = NextResponse.redirect(new URL("/login", request.url));
		redirect.cookies.delete("session");

		return redirect;
	}
}

export const config = {
	matcher: "/request/:path*"
}
