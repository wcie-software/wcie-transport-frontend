import * as z from "zod";

export const Driver = z.object({
	uid: z.string(),
	driver_license_class: z.int(),
	email: z.optional(z.email()),
	comments: z.optional(z.string())
});