import * as z from "zod";

// All documents store in firestore inherit from this model
// This is so access to the document id is easy
export const BaseDocument = z.object({
	documentId: z.optional(z.string())
});