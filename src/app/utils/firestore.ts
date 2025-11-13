import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, Firestore } from "firebase/firestore";
import { ZodObject } from "zod";

 export enum FirestoreCollections {
	Users = "users",
	Requests = "requests",
	UserRoles = "user-roles",
	Drivers = "drivers",
	Vehicles = "vehicles"
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
	) {
		if (!documentPath) {
			await addDoc(collection(this._db, collectionName), data);
		} else {
			const ref = doc(this._db, collectionName, documentPath);
			const snapshot = await getDoc(ref);
			if (!snapshot.exists()) {
				await setDoc(ref, data);
			}
		}
	}

	 async updateDocument(
		collectionName: FirestoreCollections,
		documentPath: string,
		data: Record<string, any>
	): Promise<boolean> {
		const ref = doc(this._db, collectionName, documentPath);
		try {
			await updateDoc(ref, data);
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
			data["id"] = docSnap.id;

			const result = schema.safeParse(data);
			if (result.success) {
				return result.data as Type;
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
			data["id"] = doc.id;

			const result = schema.safeParse(data);
			if (result.success) {
				docs.push(result.data as Type);
			}
		});

		return docs;
	}

	 async deleteDocument(
		collectionName: FirestoreCollections,
		documentPath: string
	) {
		await deleteDoc(doc(this._db, collectionName, documentPath));
	}
}
