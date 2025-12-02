import * as z from "zod";

export const BaseDocument = z.object({
	documentId: z.optional(z.string())
});