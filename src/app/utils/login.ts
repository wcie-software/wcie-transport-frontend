"use server"

import { UserRole, UserRoleSchema } from "@/app/models/user_role";
import { SESSION_COOKIE_KEY, USER_ROLE_COOKIE_KEY } from "@/app/utils/constants";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { Auth } from "firebase-admin/auth";
import { Firestore } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export enum LoginError {
	invalidToken,
	cookieCreationFailed,
}

async function verifyToken(idToken: string, auth: Auth): Promise<string | null> {
	try {
		const decodedToken = await auth.verifyIdToken(idToken);
		return decodedToken.uid;
	} catch (e) {
		console.error("Invalid idToken or user needs to sign in again.\n" + e);
		return null;
	}	
}

async function getUserRole(uid: string, db: Firestore): Promise<UserRole["role"]> {
	const userRoleDoc = db.collection(FirestoreCollections.UserRoles).doc(uid);
	const userRoleRef = await userRoleDoc.get();
	if (userRoleRef.exists) {
		const userRole = UserRoleSchema.safeParse(userRoleRef.data());
		if (userRole.success) {
			return userRole!.data.role;
		}
	}

	return "user";
}

export async function userLogin(idToken: string, expiresIn = 1000 * 60 * 60 * 24): Promise<UserRole["role"]> {
	const { app, auth, db } = await getFirebaseAdmin();

	const uid = await verifyToken(idToken, auth);
	if (!uid) {
		console.error("Invalid idToken or user needs to sign in again.");
		throw LoginError.invalidToken;
	}
	
	try {
		const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
		(await cookies()).set(SESSION_COOKIE_KEY, sessionCookie, {
			maxAge: expiresIn / 1000,
			httpOnly: true,
			secure: true,
			sameSite: "lax"
		});

		return await getUserRole(uid, db);
	} catch (e) {
		console.error("Bad idToken. Could not create cookie.");
		throw LoginError.cookieCreationFailed;
	}
}

export async function adminLogin(idToken: string): Promise<boolean> {
	const expiresIn4H = 1000 * 60 * 60 * 4;
	const userRole = await userLogin(idToken, expiresIn4H);

	const c = await cookies();
	c.set(USER_ROLE_COOKIE_KEY, userRole, {
		maxAge: expiresIn4H / 1000,
		httpOnly: true,
		secure: true,
		sameSite: "strict",
	});
	
	return (userRole == "admin");
}

export async function isAdmin(): Promise<boolean> {
	const c = await cookies();
	const role = c.get(USER_ROLE_COOKIE_KEY);

	return c.has(SESSION_COOKIE_KEY)
		&& role != undefined
		&& role.value === "admin";
}