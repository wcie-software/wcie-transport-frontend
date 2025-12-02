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
	no_of_children: z.coerce.number().min(0).default(0),
	timestamp: z.string()
}).refine((data) => data.no_of_children < data.no_of_seats, {
	error: "Not enough seats to accommodate number of children",
	path: ["no_of_children"]
});


export type TransportRequest = z.infer<typeof TransportRequestSchema>;
