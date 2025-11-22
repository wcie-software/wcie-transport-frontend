import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

const ServiceSchedule = z.object({
	service_number: z.int(),
	driver_ids: z.array(z.string()),
});

export const ScheduleSchema = BaseDocument.extend({
	date: z.string(),
	schedule: z.array(ServiceSchedule),
});