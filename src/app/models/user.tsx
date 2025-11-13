import * as z from "zod";
import { BaseSchema } from "@/app/models/base";

const Location = z.object({
	latitude: z.number(),
	longitude: z.number()
});

export const LocationDetails = z.object({
	googleMapsUri: z.url(),
	location: Location,
});

export const TransportUserSchema = z.looseObject(BaseSchema.extend({
	address: z.string(),
	phone_number: z.string(),
	location_details: LocationDetails
}));

export type TransportUser = z.infer<typeof TransportUserSchema>;