import { redirect, RedirectType } from "next/navigation";
import { headers, cookies } from "next/headers";
import AddressPage from "@/app/(user)/request/pages/address";
import { TransportUser, TransportUserSchema } from "@/app/models/user";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { getFirebaseServer } from "@/app/utils/firebase_setup/server";

export default async function Request() {
	const headerObj = await headers();
	const cookieObj = await cookies();

	const idToken = cookieObj.get("session");
	const uid = headerObj.get("X-Proxy-UID");

	if (!idToken?.value || !uid) {
		return redirect("/login", RedirectType.replace);
	}

	const { app, auth, db } = await getFirebaseServer(idToken.value, headerObj);

	await auth.authStateReady();
	if (!auth.currentUser) {
		console.warn("Couldn't sign in on server.");
		return redirect("/login", RedirectType.replace);
	}

	const firestore = new FirestoreHelper(db);
	const transportUser = await firestore.getDocument<TransportUser>(
		FirestoreCollections.Users,
		uid,
		TransportUserSchema
	);

	return (
		<div className="max-w-2xl w-full">
			<AddressPage defaultAddress={transportUser?.address} />
		</div>
	);
}
