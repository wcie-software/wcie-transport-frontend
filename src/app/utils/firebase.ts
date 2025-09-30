import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

export const app = initializeApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

auth.useDeviceLanguage();

if (process.env.NODE_ENV === "development") {
	connectAuthEmulator(auth, "http://127.0.0.1:9099");
	connectFirestoreEmulator(db, "127.0.0.1", 8080);
}