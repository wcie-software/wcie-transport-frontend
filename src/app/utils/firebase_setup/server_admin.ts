import { applicationDefault, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const app = !getApps().length
	? initializeApp({
		credential: applicationDefault(),
		projectId: process.env.FIREBASE_PROJECT_ID,
	})
	: getApp();
export const auth = getAuth(app);
export const adminDB = getFirestore(app);
