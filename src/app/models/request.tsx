import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const TransportRequestSchema = BaseDocument.extend({
	full_name: z.string(),
	phone_number: z.string(),
	address: z.string(),
	google_maps_link: z.url(),
	service_number: z.coerce.number(),
	no_of_seats: z.coerce.number(),
	no_of_children: z.coerce.number().default(0),
	timestamp: z.codec(
		z.string(),
		z.int(),
		{
			decode: (str) => {
				const d = new Date(str);
				if (isNaN(d.getTime())) {
					return parseInt(str) * 1000;
				}
				return d.getTime();
			},
			encode: (integer) => String(integer)
		}
	)
});


export type TransportRequest = z.infer<typeof TransportRequestSchema>;
