import { applicationDefault, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const app = !getApps().length
	? initializeApp({
		credential: applicationDefault(),
		projectId: process.env.FIREBASE_PROJECT_ID,
	})
	: getApp();
export const auth = getAuth(app);
