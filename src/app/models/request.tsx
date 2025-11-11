import * as z from "zod";

export const TransportRequestSchema = z.object({
	full_name: z.string(),
	phone_number: z.string(),
	address: z.string(),
	google_maps_link: z.url(),
	service_number: z.coerce.number(),
	no_of_children: z.nullable(z.coerce.number()),
	no_of_seats: z.coerce.number(),
	timestamp: z.string()
});

export type TransportRequest = z.infer<typeof TransportRequestSchema>;
