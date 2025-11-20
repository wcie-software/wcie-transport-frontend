import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const VehicleSchema = BaseDocument.extend({
	name: z.string(),
	year: z.int(),
	plate_number: z.string(),
	remarks: z.string().default(""),
	fuel_cost: z.nullable(z.coerce.number()),
	last_fuel_date: z.nullable(z.string()),
	maintenance_type: z.nullable(z.string()),
	maintenance_receipt_amount: z.nullable(z.coerce.number()),
	last_maintenance_date: z.nullable(z.string()),
});

export type Vehicle = z.infer<typeof VehicleSchema>;