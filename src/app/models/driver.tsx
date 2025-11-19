import * as z from "zod";
import { BaseDocument } from "@/app/models/base";
import { Location } from "@/app/models/location";

export const DriverSchema = BaseDocument.extend({
	full_name: z.string(),
	phone_number: z.string(),
	address: z.optional(z.string()),
	location: z.optional(Location),
	driver_license_class: z.string(),
	comments: z.string().default(""),
});

export type Driver = z.infer<typeof DriverSchema>;