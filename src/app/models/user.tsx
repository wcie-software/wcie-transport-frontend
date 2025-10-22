import * as z from "zod";

const Location = z.object({
	latitude: z.number(),
	longitude: z.number()
});

const LocationDetails = z.object({
	googleMapsUri: z.url(),
	location: Location,
});

export const TransportUser = z.looseObject({
	address: z.string(),
	phone_number: z.string(),
	location_details: LocationDetails
});

type TransportUser = z.infer<typeof TransportUser>;