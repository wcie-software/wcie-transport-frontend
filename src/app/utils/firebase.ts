import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

let config = (process.env.FIREBASE_WEBAPP_CONFIG)
	? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG!)
	: {
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);

auth.useDeviceLanguage();

// connectAuthEmulator(auth, "http://127.0.0.1:9099");
// connectFirestoreEmulator(db, "127.0.0.1", 8080);