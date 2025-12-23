import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { Admin } from "@/app/models/admin";

export async function GET() {
  const { auth, db } = await getFirebaseAdmin();

  // Create user
  const admin = await auth.createUser({
    email: "obaloluwa.odelana@gmail.com",
    emailVerified: true,
    displayName: "Obaloluwa Odelana",
  });
  // Make admin
  await auth.setCustomUserClaims(admin.uid, { role: "admin" });

  // Add to admin db
  await db
    .collection(FirestoreCollections.Admins)
    .doc(admin.uid)
    .set({ email: admin.email } as Admin);
}
