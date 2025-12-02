import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const ScheduleSchema = BaseDocument.extend({
	timestamp: z.number().min(1735714800000), // Can't be below 1st Jan. 2025 12:00 AM
	schedule: z.record(
		z.string().min(1).max(2), // Service number: 1, ... 99
		z.array(z.string()).min(1) // Array of at least length 1
	),
});

export type Schedule = z.infer<typeof ScheduleSchema>;