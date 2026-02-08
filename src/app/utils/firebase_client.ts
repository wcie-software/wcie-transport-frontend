import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// Singleton pattern
export const app = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  ? initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    }) // While in dev
  : initializeApp(); // Prod
export const auth = getAuth(app);
export const db = getFirestore(app);

auth.useDeviceLanguage();

// Connect to emulator in dev mode
if (process.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
