import * as z from "zod";

export const Location = z.object({
	latitude: z.number(),
	longitude: z.number()
});