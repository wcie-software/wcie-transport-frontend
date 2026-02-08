import * as z from "zod";

export const LocationSchema = z.object({
	latitude: z.number(),
	longitude: z.number()
});

export type Location = z.infer<typeof LocationSchema>;