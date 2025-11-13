import * as z from "zod";
import { BaseSchema } from "@/app/models/base";

export const Vehicle = BaseSchema.extend({
	name: z.string(),
	year: z.int(),
	plate_number: z.string(),
	last_maintenance_date: z.optional(z.date()),
	maintenance_type: z.optional(z.string()),
	maintenance_receipt_amount: z.optional(z.number()),
	last_fuel_date: z.optional(z.date()),
	fuel_cost: z.optional(z.number()),
	remarks: z.optional(z.string()),
});