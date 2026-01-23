import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { Constants } from "@/app/utils/util";

// Middleware for enforcing proper authorization
export async function proxy(request: NextRequest) {
  const basePath = request.nextUrl.pathname.split("/")[1];
  const adminLogin = basePath === "admin";
  const loginURL = adminLogin ? "/admin" : "/login";

  const sessionCookie = request.cookies.get(Constants.SESSION_COOKIE_KEY);
  // User has never signed in before (or session has expired)
  if (!sessionCookie) {
    console.warn("Session cookie does not exist.");
    return NextResponse.redirect(new URL(loginURL, request.url));
  }

  const { auth } = await getFirebaseAdmin();
  try {
    const { uid } = await auth.verifySessionCookie(sessionCookie.value);

    // Check if user is trying to access admin page, but doesn't have required privilege
    const isAdmin = request.cookies.get(Constants.IS_ADMIN_COOKIE_KEY);
    if ((!isAdmin || isAdmin.value !== "TRUE") && adminLogin) {
      console.log(
        "Not an admin because " +
        (isAdmin ? "role is not admin" : "cookie does not exit")
      );
      return NextResponse.redirect(new URL(loginURL, request.url));
    } else if (!adminLogin && isAdmin?.value === "TRUE") {
      console.log("Admin trying to access non-admin page");
      // Force admin to login as user, if accessing a non-admin page
      return NextResponse.redirect(new URL(loginURL, request.url));
    }

    const res = NextResponse.next();
    res.headers.set(Constants.UID_HEADER_KEY, uid);

    return res;
  } catch (e) {
    console.error("A session cookie exists, but it's invalid. " + e);

    const redirect = NextResponse.redirect(new URL(loginURL, request.url));
    // Delete invalid session cookie
    redirect.cookies.delete(Constants.SESSION_COOKIE_KEY);

    return redirect;
  }
}

export const config = {
  matcher: ["/request/:path*", "/admin/:path+", "/driver/:path*"],
};
