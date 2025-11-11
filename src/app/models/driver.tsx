import * as z from "zod";

export const DriverSchema = z.object({
	uid: z.string(),
	driver_license_class: z.int(),
	email: z.optional(z.email()),
	comments: z.optional(z.string())
});

export type Driver = z.infer<typeof DriverSchema>;