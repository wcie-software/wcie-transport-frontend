import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const DriverSchema = BaseDocument.extend({
	phone_number: z.string(),
	driver_license_class: z.int(),
	comments: z.optional(z.string())
});

export type Driver = z.infer<typeof DriverSchema>;