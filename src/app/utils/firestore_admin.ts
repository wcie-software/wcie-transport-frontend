import { Firestore } from "firebase-admin/firestore";
import { FirestoreCollections } from "./firestore";
import { ZodObject } from "zod";

export async function getCollection<Type>(
	db: Firestore, collectionName: FirestoreCollections, schema: ZodObject
): Promise<Type[]> {
	const collection = await db.collection(collectionName).get();
	if (!collection.empty) {
		const list: Type[] = [];

		collection.forEach(doc => {
			const requestData = doc.data();
			requestData.id = doc.id;

			const parsed = schema.safeParse(requestData);
			if (parsed.success) {
				list.push(parsed.data as Type);
			} else {
				console.error("Failed to parse request data:", parsed.error);
			}
		});

		return list;
	}

	return [];
}