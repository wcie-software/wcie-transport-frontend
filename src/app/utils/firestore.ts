import { doc, getDoc, getDocFromServer, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebase";
import Coordinates from "@/app/models/coordinates";
import { User } from "firebase/auth";

const USER_COLLECTION = "users";

export async function addUser(user: User): Promise<void> {
	if (!user.phoneNumber) {
		// TODO: Throw error
		return;
	}

	const userRef = doc(db, USER_COLLECTION, user.uid);
	const userSnap = await getDoc(userRef);

	if (!userSnap.exists()) {
		await setDoc(userRef, { phoneNumber: user.phoneNumber! });
	}
}

export async function getUserLocation(uid: string): Promise<string> {
	const userRef = doc(db, USER_COLLECTION, uid);
	const userSnap = await getDocFromServer(userRef);

	if (userSnap.exists()) {
		const data = userSnap.data();
		if ("address" in data) {
			return data["address"] as string;
		}
	}

	return "";
}

export async function setUserLocation(
	uid: string, coordinates: Coordinates, address: string
): Promise<void> {
	const userRef = doc(db, USER_COLLECTION, uid);
	await updateDoc(userRef, {
		address: address,
		location: {
			"latitude": coordinates.latitude,
			"longitude": coordinates.longitude
		}
	});
}
