import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { SESSION_COOKIE_KEY, USER_ROLE_COOKIE_KEY } from "@/app/utils/constants";

export async function proxy(request: NextRequest) {
	const basePath = request.nextUrl.pathname.split("/")[1];
	const adminLogin = basePath === "admin";
	const loginURL = adminLogin ? "/admin" : "/login";

	const sessionCookie = request.cookies.get(SESSION_COOKIE_KEY);
	if (!sessionCookie) {
		console.warn("Session cookie does not exist.");
		return NextResponse.redirect(new URL(loginURL, request.url));
	}

	const { app, auth, db } = await getFirebaseAdmin();
	try {
		await auth.verifySessionCookie(sessionCookie.value);
		
		// Check if user is trying to access admin page, but doesn't have required privilege
		const userRole = request.cookies.get(USER_ROLE_COOKIE_KEY);
		if ((!userRole || userRole.value !== "admin") && adminLogin) {
			console.log("Not an admin because " + (userRole ? "role is not admin" : "cookie does not exit"));
			return NextResponse.redirect(new URL(loginURL, request.url));
		}

		return NextResponse.next();
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
		"/admin/:path+",
	]
}
