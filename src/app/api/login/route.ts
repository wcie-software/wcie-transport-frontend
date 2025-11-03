import { UserRoleSchema } from "@/app/models/user_role";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const { idToken } = await request.json();
	let uid: string;

	const { app, auth, db } = await getFirebaseAdmin();

	const expiresIn = 1000 * 60 * 60 * 24; // 1 day
	try {
		const decodedToken = await auth.verifyIdToken(idToken);
		uid = decodedToken.uid;
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
		
		let role;
		const userRoleDoc = db.collection(FirestoreCollections.UserRoles).doc(uid);
		const userRoleRef = await userRoleDoc.get();
		if (userRoleRef.exists) {
			const userRole = UserRoleSchema.safeParse(userRoleRef.data()).data;
			role = userRole?.role;
		}

		const response = new NextResponse(
			JSON.stringify({ role: role ?? "user" }),
			{ status: 200 }
		);
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