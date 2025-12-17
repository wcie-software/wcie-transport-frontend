import { Firestore, Query, WhereFilterOp, FieldPath } from "firebase-admin/firestore";
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
	schema: ZodObject<any>,
	documentIds: string[],
	orderByField?: string,
	orderByDirection: "asc" | "desc" = "desc",
) {
	const collection = db.collection(collectionName);
	let query = collection.where(FieldPath.documentId(), "in", documentIds);
	if (orderByField) {
		query = query.orderBy(orderByField, orderByDirection);
	}

	const results = await query.get();
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

export async function getDocument<Type>(
	db: Firestore,
	collectionName: FirestoreCollections,
	schema: ZodObject<any>,
	documentId: string
) {
	const doc = await getDocuments<Type>(db, collectionName, schema, [documentId]);
	if (doc.length > 0) {
		return doc[0];
	} else {
		return undefined;
	}
}

export interface WhereClause {
	field: string;
	operator: WhereFilterOp;
	value: any;
}

export async function queryCollection<Type>(
	db: Firestore,
	collectionName: FirestoreCollections,
	schema: ZodObject<any>,
	whereClauses: WhereClause[] = [],
	orderByField?: string,
	orderByDirection: "asc" | "desc" = "desc",
): Promise<Type[]> {
	let query: Query = db.collection(collectionName);
	for (const clause of whereClauses) {
		query = query.where(clause.field, clause.operator, clause.value);
	}

	if (orderByField) {
		query = query.orderBy(orderByField, orderByDirection);
	}

	const results = await query.get();
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