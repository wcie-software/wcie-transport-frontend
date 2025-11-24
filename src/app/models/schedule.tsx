import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const ScheduleSchema = BaseDocument.extend({
	date: z.string(),
	schedule: z.record(z.number(), z.array(z.string())),
});

export type Schedule = z.infer<typeof ScheduleSchema>;