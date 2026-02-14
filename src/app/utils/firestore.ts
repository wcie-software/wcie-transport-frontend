import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  Firestore,
} from "firebase/firestore";
import { ZodType } from "zod";

export enum FirestoreCollections {
  Users = "users",
  Requests = "requests",
  Admins = "admins",
  Drivers = "drivers",
  Vehicles = "vehicles",
  Schedules = "schedules",
  Assignments = "assigned-routes",
  PickupInfo = "pickup_info",
}

// Create, get, update and delete documents in a firestore database
export class FirestoreHelper {
  _db: Firestore;

  constructor(db: Firestore) {
    this._db = db;
  }

  /**
   * Adds a new document to the specified collection.
   * If `allowUpdating` is true, it will overwrite/update an existing document
   * @param collectionName Name of the collection (table) to store document (row)
   * @param data Data to store
   * @param documentPath Name of document (If empty, a system-generated name is given)
   * @param allowUpdating Whether to allow overwriting/updating existing documents
   * @returns If `allowUpdating` is false, "false" would be returned if the document with the same name already exists.
   */
  async addDocument(
    collectionName: FirestoreCollections,
    data: Record<string, any>,
    documentPath?: string,
    allowUpdating: boolean = false,
  ): Promise<boolean> {
    const d = { ...data };
    // See `models/base.tsx`
    // Avoid saving the document's id. This is normally the same as `documentPath`
    if ("documentId" in d) {
      delete d["documentId"];
    }

    // If no name was specified
    if (!documentPath) {
      await addDoc(collection(this._db, collectionName), d);
      return true;
    } else {
      const ref = doc(this._db, collectionName, documentPath);
      if (allowUpdating) {
        await setDoc(ref, d);
        return true;
      } else {
        const snapshot = await getDoc(ref);
        // Check if document exists
        if (!snapshot.exists()) {
          await setDoc(ref, d);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Update an existing document, if it exists
   * @param collectionName Name of the collection that contains the document
   * @param documentPath Name of document
   * @param data Data to update document with
   * @returns "false" if document does not exist or there was an error updating the document, "true" otherwise
   */
  async updateDocument(
    collectionName: FirestoreCollections,
    documentPath: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    const ref = doc(this._db, collectionName, documentPath);
    try {
      const d = { ...data };
      // See `models/base.tsx`
      // Avoid saving the document's id. This is normally the same as `documentPath`
      if ("documentId" in d) {
        delete d["documentId"];
      }

      await updateDoc(ref, d);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get document from `collectionName` with name `documentPath` as `schema`
   * @param collectionName Name of the collection that contains the document
   * @param documentPath Name of document
   * @param schema Type of document / Schema of table
   * @returns The document in the specified type, if it exists and conforms to `schema`
   */
  async getDocument<Type>(
    collectionName: FirestoreCollections,
    documentPath: string,
    schema: ZodType<Type>,
  ): Promise<Type | null> {
    const docRef = doc(this._db, collectionName, documentPath);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Set documentId to the document's id
      // See `models/base.tsx` for reason
      data["documentId"] = docSnap.id;

      // Attempt to parse the JSON data to the specified scheme
      const result = schema.safeParse(data);
      if (result.success) {
        return result.data as Type;
      } else {
        console.warn(
          `Failed to parse data from '${collectionName}/${documentPath}'`,
          data,
        );
      }
    }

    return null;
  }

  /**
   * Get all documents in `collectionName`.
   * Note: If a document does not conform to `schema`, it keeps going.
   * @param collectionName Name of collection
   * @param schema Table schema
   * @returns List of documents in the collection
   */
  async getCollection<Type>(
    collectionName: FirestoreCollections,
    schema: ZodType<Type>,
  ): Promise<Type[]> {
    const collectionRef = collection(this._db, collectionName);
    const snapshot = await getDocs(collectionRef);

    const docs: Type[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Set documentId to the document's id
      // See `models/base.tsx` for reason
      data["documentId"] = doc.id;

      const result = schema.safeParse(data);
      if (result.success) {
        docs.push(result.data as Type);
      } else {
        console.warn(
          `Failed to parse data from '${collectionName}/${doc.id}'`,
          data,
        );
      }
    });

    return docs;
  }

  /**
   * Deletes an existing document
   * @param collectionName Name of collection
   * @param documentPath Document name
   * @returns Whether deletion was successful
   */
  async deleteDocument(
    collectionName: FirestoreCollections,
    documentPath: string,
  ): Promise<boolean> {
    try {
      await deleteDoc(doc(this._db, collectionName, documentPath));
      return true;
    } catch (e) {
      console.error(
        `Document ${collectionName}/${documentPath} properly does not exist: ${e}`,
      );
      return false;
    }
  }
}
