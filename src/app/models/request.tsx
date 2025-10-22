import * as z from "zod";

export const TransportRequest = z.object({
	full_name: z.string(),
	phone_number: z.string(),
	address: z.string(),
	google_maps_link: z.url(),
	service_number: z.int(),
	no_of_children: z.nullable(z.int()),
	no_of_seats: z.int(),
	timestamp: z.iso.datetime({local: true})
});
