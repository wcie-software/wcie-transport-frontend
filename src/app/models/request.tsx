import * as z from "zod";
import { BaseDocument } from "@/app/models/base";
import { Location } from "@/app/models/location";

export const TransportRequestSchema = BaseDocument.extend({
	full_name: z.string(),
	phone_number: z.string(),
	address: z.string(),
	google_maps_link: z.url(),
	coordinates: z.optional(Location),
	service_number: z.coerce.number(),
	no_of_seats: z.coerce.number(),
	no_of_children: z.coerce.number().default(0),
	timestamp: z.string(),
});


export type TransportRequest = z.infer<typeof TransportRequestSchema>;
