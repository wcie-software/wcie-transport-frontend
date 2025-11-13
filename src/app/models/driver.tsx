import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const DriverSchema = BaseDocument.extend({
	uid: z.string(),
	driver_license_class: z.int(),
	email: z.optional(z.email()),
	comments: z.optional(z.string())
});

export type Driver = z.infer<typeof DriverSchema>;