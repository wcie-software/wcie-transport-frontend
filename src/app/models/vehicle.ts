import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const VehicleSchema = BaseDocument.extend({
	name: z.string().min(1),
	year: z.coerce.number().min(2000),
	plate_number: z.string().max(8).min(6),
	active: z.transform((val: string) => {
		const v = String(val).toLowerCase();
		return ["true", "yes", "y"].includes(v);
	}).default(true),
	seating_capacity: z.coerce.number().min(2).default(4),
	remarks: z.string().default(""),
	fuel_cost: z.optional(z.coerce.number().min(0)),
	last_fuel_date: z.optional(z.string()),
	maintenance_type: z.optional(z.string()),
	maintenance_receipt_amount: z.optional(z.coerce.number().min(0)),
	last_maintenance_date: z.optional(z.string()),
});

export type Vehicle = z.infer<typeof VehicleSchema>;