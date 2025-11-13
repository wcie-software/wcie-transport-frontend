import * as z from "zod";
import { Location } from "@/app/models/location";
import { BaseDocument } from "@/app/models/base";

export const LocationDetails = z.object({
	googleMapsUri: z.url(),
	location: Location,
});

export const TransportUserSchema = z.looseObject(BaseDocument.extend({
	address: z.string(),
	phone_number: z.string(),
	location_details: LocationDetails
}));

export type TransportUser = z.infer<typeof TransportUserSchema>;