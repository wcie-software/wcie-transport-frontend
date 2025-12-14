import { Firestore } from "firebase-admin/firestore";
import { FirestoreCollections } from "./firestore";
import { ZodObject } from "zod";

export async function getCollection<Type>(
	db: Firestore,
	collectionName: FirestoreCollections,
	schema: ZodObject,
	orderByField?: string,
	orderByDirection: "asc" | "desc" = "desc",
): Promise<Type[]> {
	const collection = db.collection(collectionName);

	const results = await (orderByField ? collection.orderBy(orderByField, orderByDirection) : collection).get();
	if (!results.empty) {
		const list: Type[] = [];
		results.forEach(doc => {
			const requestData = doc.data();
			requestData.documentId = doc.id;

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

export async function getDocuments<Type>(
	db: Firestore,
	collectionName: FirestoreCollections,
	schema: ZodObject,
	
	orderByField?: string,
	orderByDirection: "asc" | "desc" = "desc",
): Promise<Type[]> {
	const collection = db.collection(collectionName);

	const results = await (orderByField ? collection.orderBy(orderByField, orderByDirection) : collection
).where("timestamp", "<=", "11/02/2025").where("timestamp", ">", "10/26/2025").where("service_number", "==", 1).get();
	if (!results.empty) {
		const list: Type[] = [];
		results.forEach(doc => {
			const requestData = doc.data();
			requestData.documentId = doc.id;

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