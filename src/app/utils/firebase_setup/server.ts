"use server"

import { initializeServerApp, initializeApp, FirebaseServerApp } from "firebase/app";
import { App, applicationDefault, getApps, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { Auth as AdminAuth, getAuth as getAdminAuth } from "firebase-admin/auth";
import { Firestore as AdminFirestore, getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { connectFirestoreEmulator, Firestore, getFirestore } from "firebase/firestore";
import { headers, cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export async function getFirebaseServer(): Promise<{
	app: FirebaseServerApp,
	auth: Auth,
	db: Firestore
}> {
	const headerObj = await headers();
	const cookieObj = await cookies();

	const idToken = cookieObj.get("session");
	const uid = headerObj.get("X-Proxy-UID");

	if (!idToken?.value || !uid) {
		return redirect("/login", RedirectType.replace);
	}

	const app = initializeServerApp(
		initializeApp(),
		{ authIdToken: idToken.value, releaseOnDeref: headerObj }
	);
	const auth = getAuth(app);
	const db = getFirestore(app);

	if (process.env.NODE_ENV === "development") {
		connectAuthEmulator(auth, "http://127.0.0.1:9099");
		connectFirestoreEmulator(db, "127.0.0.1", 8080);
	}

	return { app, auth, db };
}

export async function getFirebaseAdmin(): Promise<{
	app: App,
	auth: AdminAuth,
	db: AdminFirestore
}> {
	const apps = getApps();
	const app = apps.length == 0
		? initializeAdminApp({
			credential: applicationDefault(),
			projectId: process.env.FIREBASE_PROJECT_ID,
		})
		: apps[0];
	const auth = getAdminAuth(app);
	const adminDB = getAdminFirestore(app);

	return { app: app, auth: auth, db: adminDB };
}
