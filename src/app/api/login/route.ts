import { auth } from "@/app/utils/firebase_setup/server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const { idToken } = await request.json();

	const expiresIn = 1000 * 60 * 60 * 24; // 1 day
	try {
		await auth.verifyIdToken(idToken);
	} catch (e) {
		return new Response(
			JSON.stringify({
				error: "Invalid idToken or user needs to sign in again.",
				errorMessage: String(e)
			}),
			{ status: 401 }
		);
	}
	
	try {
		const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
		const response = new NextResponse("OK", { status: 200 });
		response.cookies.set("session", sessionCookie, {
			maxAge: expiresIn / 1000,
			httpOnly: true,
			secure: true,
			sameSite: "lax"
		});

		return response;
	} catch (e) {
		return new Response(
			JSON.stringify({ error: "Bad idToken. Could not create cookie."}),
			{ status: 401 }
		)
	}
}