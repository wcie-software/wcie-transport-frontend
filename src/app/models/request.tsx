import * as z from "zod";
import { BaseDocument } from "@/app/models/base";
import { Location } from "@/app/models/location";

export const TransportRequestSchema = BaseDocument.extend({
	full_name: z.string(),
	phone_number: z.string().startsWith("+1").length(12),
	address: z.string(),
	google_maps_link: z.url(),
	coordinates: z.optional(Location),
	service_number: z.coerce.number().min(1),
	no_of_seats: z.coerce.number().min(1),
	no_of_children: z.coerce.number().default(0),
	timestamp: z.string().regex(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/), // mm/dd/yyyy hh:mm:ss
});


export type TransportRequest = z.infer<typeof TransportRequestSchema>;
