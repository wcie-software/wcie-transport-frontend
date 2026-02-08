"use server";

import {
  App,
  applicationDefault,
  getApps,
  initializeApp as initializeAdminApp,
} from "firebase-admin/app";
import {
  Auth as AdminAuth,
  getAuth as getAdminAuth,
} from "firebase-admin/auth";
import {
  Firestore as AdminFirestore,
  getFirestore as getAdminFirestore,
} from "firebase-admin/firestore";

// Singleton access to firebase on the server
export async function getFirebaseAdmin(): Promise<{
  app: App;
  auth: AdminAuth;
  db: AdminFirestore;
}> {
  const apps = getApps();
  const app =
    apps.length == 0
      ? initializeAdminApp({
          credential: applicationDefault(),
          projectId:
            process.env.FIREBASE_PROJECT_ID ||
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        })
      : apps[0];
  const auth = getAdminAuth(app);
  const adminDB = getAdminFirestore(app);

  // If in dev mode, ignore properties that have `undefined` as their value
  if (process.env.NODE_ENV === "development" && apps.length == 0) {
    adminDB.settings({ ignoreUndefinedProperties: true });
  }

  return { app: app, auth: auth, db: adminDB };
}
