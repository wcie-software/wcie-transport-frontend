import * as z from "zod";

export const TransportRequest = z.object({
	fullName: z.string(),
	phoneNumber: z.string(),
	address: z.string(),
	googleMapsLink: z.url(),
	serviceNumber: z.int(),
	noOfChildren: z.nullable(z.int()),
	noOfSeats: z.int(),
	timestamp: z.date(),
});
