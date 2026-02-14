import {
  Firestore,
  Query,
  WhereFilterOp,
  FieldPath,
} from "firebase-admin/firestore";
import { FirestoreCollections } from "./firestore";
import { ZodType } from "zod";

/**
 * Server-side Firestore helper using firebase-admin.
 * Provides typed access to Firestore collections and documents with Zod schema validation.
 */
export class FirestoreAdminHelper {
  _db: Firestore;

  constructor(db: Firestore) {
    this._db = db;
  }

  /**
   * Get all documents in `collectionName`.
   * Note: If a document does not conform to `schema`, it is skipped.
   * @param collectionName Name of collection
   * @param schema Table schema
   * @param orderByField Field to order the results by (optional)
   * @param orderByDirection Direction to order the results ("asc" or "desc"). Defaults to descending order
   * @returns List of documents in the collection
   */
  async getCollection<Type>(
    collectionName: FirestoreCollections,
    schema: ZodType<Type>,
    orderByField?: string,
    orderByDirection: "asc" | "desc" = "desc",
  ): Promise<Type[]> {
    const collection = this._db.collection(collectionName);

    const results = await (
      orderByField
        ? // Sort documents by `orderField` in `orderDirection
          collection.orderBy(orderByField, orderByDirection)
        : collection
    ).get();

    if (!results.empty) {
      const list: Type[] = [];
      results.forEach((doc) => {
        const requestData = doc.data();
        // Set documentId to the document's id
        // See `models/base.tsx` for reason
        requestData.documentId = doc.id;

        const parsed = schema.safeParse(requestData);
        if (parsed.success) {
          list.push(parsed.data as Type);
        } else {
          console.warn(
            `Failed to parse '${collectionName}/${doc.id}' data:`,
            parsed.error,
          );
        }
      });

      return list;
    }

    return [];
  }

  /**
   * Get specified documents from `collectionName`
   * @param collectionName Name of the collection
   * @param schema Table schema
   * @param documentIds List of documents to retrieve
   * @param orderByField Optional field to order the results by
   * @param orderByDirection Direction to order the results ("asc" or "desc"). Defaults to descending order
   * @returns List of documents that exist and conform to `schema`
   */
  async getDocuments<Type>(
    collectionName: FirestoreCollections,
    schema: ZodType<Type>,
    documentIds: string[],
    orderByField?: string,
    orderByDirection: "asc" | "desc" = "desc",
  ): Promise<Type[]> {
    if (documentIds.length === 0) {
      return [];
    }
    const collection = this._db.collection(collectionName);
    let query = collection.where(FieldPath.documentId(), "in", documentIds);
    if (orderByField) {
      query = query.orderBy(orderByField, orderByDirection);
    }

    const results = await query.get();
    if (!results.empty) {
      const list: Type[] = [];
      results.forEach((doc) => {
        const requestData = doc.data();
        // Set documentId to the document's id
        // See `models/base.tsx` for reason
        requestData.documentId = doc.id;

        const parsed = schema.safeParse(requestData);
        if (parsed.success) {
          list.push(parsed.data as Type);
        } else {
          console.warn(
            `Failed to parse '${collectionName}/${doc.id}' data:`,
            parsed.error,
          );
        }
      });

      return list;
    }

    return [];
  }

  /**
   * Get a single document from `collectionName` by its name.
   * Underneath it passes a single document name to {@link getDocuments}.
   * @param collectionName Name of the collection
   * @param schema Table schema
   * @param documentId ID of the document to retrieve
   * @returns The document if it exists and conforms to `schema`, undefined otherwise
   */
  async getDocument<Type>(
    collectionName: FirestoreCollections,
    schema: ZodType<Type>,
    documentId: string,
  ): Promise<Type | undefined> {
    const doc = await this.getDocuments<Type>(collectionName, schema, [
      documentId,
    ]);
    if (doc.length > 0) {
      return doc[0];
    } else {
      return undefined;
    }
  }

  /**
   * Queries a collection with multiple where clauses.
   * @param collectionName Name of the collection
   * @param schema Table schema
   * @param whereClauses List of where clauses to AND together
   * @param orderByField Optional field to order the results by
   * @param orderByDirection Direction to order the results ("asc" or "desc"). Defaults to descending order
   * @returns List of documents matching the query that conform to `schema`
   */
  async queryCollection<Type>(
    collectionName: FirestoreCollections,
    schema: ZodType<Type>,
    whereClauses: { field: string; operator: WhereFilterOp; value: any }[] = [],
    orderByField?: string,
    orderByDirection: "asc" | "desc" = "desc",
  ): Promise<Type[]> {
    let query: Query = this._db.collection(collectionName);
    // And clauses together
    for (const clause of whereClauses) {
      query = query.where(clause.field, clause.operator, clause.value);
    }

    // Sort results by `orderField`
    if (orderByField) {
      query = query.orderBy(orderByField, orderByDirection);
    }

    const results = await query.get();
    if (!results.empty) {
      const list: Type[] = [];
      results.forEach((doc) => {
        const requestData = doc.data();
        requestData.documentId = doc.id;

        const parsed = schema.safeParse(requestData);
        if (parsed.success) {
          list.push(parsed.data as Type);
        } else {
          console.warn(
            `Failed to parse '${collectionName}/${doc.id}' data:`,
            parsed.error,
          );
        }
      });

      return list;
    }

    return [];
  }
}
