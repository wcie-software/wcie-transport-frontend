import { initializeApp, applicationDefault, ServiceAccount, getApps, cert, AppOptions } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const initializeFirebaseAdmin = () => {
  const firebaseAdminApps = getApps();
  if (firebaseAdminApps.length > 0) {
    return firebaseAdminApps[0];
  }

  return initializeApp({
	credential: cert(process.env.FIREBASE_ADMIN_CRED_PATH!)
  });
}

export async function POST(req: NextRequest) {
	const app = initializeFirebaseAdmin();
	const auth = getAuth(app);

	const { idToken } = await req.json();
	const expiresIn = 60 * 60 * 24 * 1 * 1000; // 1 day
	
	try {
		const sessionCookie = await auth.createSessionCookie(idToken, {
			expiresIn: expiresIn
		});

		const c = await cookies();
		c.set("session", sessionCookie, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: "/",
			maxAge: expiresIn / 1000
		})

		return new NextResponse("OK");
	} catch (e) {
		// Invalid token
		console.error(e);
		return NextResponse.error();
	}
}