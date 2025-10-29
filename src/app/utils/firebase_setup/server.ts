import { initializeServerApp, initializeApp, FirebaseServerApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { connectFirestoreEmulator, Firestore, getFirestore } from "firebase/firestore";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";


export async function getFirebaseServer(idToken: string, header: ReadonlyHeaders): Promise<{
	app: FirebaseServerApp,
	auth: Auth,
	db: Firestore
}> {
	const app = initializeServerApp(
		initializeApp(),
		{ authIdToken: idToken, releaseOnDeref: header }
	);
	const auth = getAuth(app);
	const db = getFirestore(app);

	if (process.env.NODE_ENV === "development") {
		connectAuthEmulator(auth, "http://127.0.0.1:9099");
		connectFirestoreEmulator(db, "127.0.0.1", 8080);
	}

	return { app, auth, db };
}

