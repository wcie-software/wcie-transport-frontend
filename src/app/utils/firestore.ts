import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, Firestore } from "firebase/firestore";
import { ZodObject } from "zod";

export enum FirestoreCollections {
	Users = "users",
	Requests = "requests",
	Admins = "admins",
	Drivers = "drivers",
	Vehicles = "vehicles",
	Schedules = "schedules",
}

export class FirestoreHelper {
	_db: Firestore;

	constructor(db: Firestore) {
		this._db = db;
	}

	async addDocument(
		collectionName: FirestoreCollections,
		data: Record<string, any>,
		documentPath?: string,
	): Promise<boolean> {
		const d = { ...data };
		if ("documentId" in d) { // See `models/base.tsx`
			delete d["documentId"];
		}

		if (!documentPath) {
			await addDoc(collection(this._db, collectionName), d);
			return true;
		} else {
			const ref = doc(this._db, collectionName, documentPath);
			const snapshot = await getDoc(ref);
			if (!snapshot.exists()) {
				await setDoc(ref, d);
				return true;
			}
		}

		return false;
	}

	async updateDocument(
		collectionName: FirestoreCollections,
		documentPath: string,
		data: Record<string, any>
	): Promise<boolean> {
		const ref = doc(this._db, collectionName, documentPath);
		try {
			const d = { ...data };
			if ("documentId" in d) { // See `models/base.tsx`
				delete d["documentId"];
			}

			await updateDoc(ref, d);
			return true;
		} catch (e) {
			return false;
		}
	}

	async getDocument<Type>(
		collectionName: FirestoreCollections,
		documentPath: string,
		schema: ZodObject,
	): Promise<Type | null> {
		const docRef = doc(this._db, collectionName, documentPath);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			data["documentId"] = docSnap.id;

			const result = schema.safeParse(data);
			if (result.success) {
				return result.data as Type;
			} else {
				console.log(`Failed to parse data from '${collectionName} collection'`, data);
			}
		}

		return null;
	}

	async getCollection<Type>(
		collectionName: FirestoreCollections,
		schema: ZodObject
	): Promise<Type[]> {
		const collectionRef = collection(this._db, collectionName);
		const snapshot = await getDocs(collectionRef);

		const docs: Type[] = [];
		snapshot.forEach((doc) => {
			const data = doc.data();
			data["documentId"] = doc.id;

			const result = schema.safeParse(data);
			if (result.success) {
				docs.push(result.data as Type);
			} else {
				console.log(`Failed to parse data from '${collectionName} collection'`, data);
			}
		});

		return docs;
	}

	async deleteDocument(
		collectionName: FirestoreCollections,
		documentPath: string
	): Promise<boolean> {
		try {
			await deleteDoc(doc(this._db, collectionName, documentPath));
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	}
}
