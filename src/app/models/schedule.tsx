import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const ScheduleSchema = BaseDocument.extend({
	timestamp: z.number(),
	schedule: z.record(z.string(), z.array(z.string())),
});

export type Schedule = z.infer<typeof ScheduleSchema>;