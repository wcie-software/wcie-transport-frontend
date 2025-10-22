import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebase";
import { ZodObject } from "zod";

export enum FirestoreCollections {
	Users = "users",
	Requests = "requests",
	UserRoles = "user-roles",
	Drivers = "drivers",
	Vehicles = "vehicles"
}

export async function addDocument(
	collectionName: FirestoreCollections,
	data: Record<string, any>,
	documentPath?: string,
) {
	if (!documentPath) {
		await addDoc(collection(db, collectionName), data);
	} else {
		const ref = doc(db, collectionName, documentPath);
		const snapshot = await getDoc(ref);
		if (!snapshot.exists()) {
			await setDoc(ref, data);
		}
	}
}

export async function updateDocument(
	collectionName: FirestoreCollections,
	documentPath: string,
	data: Record<string, any>
): Promise<boolean> {
	const ref = doc(db, collectionName, documentPath);
	try {
		await updateDoc(ref, data);
		return true;
	} catch (e) {
		return false;
	}
}

export async function getDocument(
	collectionName: FirestoreCollections,
	documentPath: string,
	schema: ZodObject,
): Promise<Object | null> {
	const docRef = doc(db, collectionName, documentPath);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		const result = schema.safeParse(docSnap.data());
		if (result.success) {
			return result.data;
		}
	}

	return null;
}

export async function getCollection(
	collectionName: FirestoreCollections,
	schema: ZodObject
): Promise<Object[]> {
	const collectionRef = collection(db, collectionName);
	const snapshot = await getDocs(collectionRef);

	const docs: Object[] = [];
	snapshot.forEach((doc) => {
		const result = schema.safeParse(doc.data());
		if (result.success) {
			docs.push(result.data);
		}
	});

	return docs;
}

export async function deleteDocument(
	collectionName: FirestoreCollections,
	documentPath: string
) {
	await deleteDoc(doc(db, collectionName, documentPath));
}