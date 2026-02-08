import * as z from "zod";
import { LocationSchema } from "@/app/models/location";
import { BaseDocument } from "@/app/models/base";

export const LocationDetails = z.object({
	googleMapsUri: z.url(),
	location: LocationSchema,
});

export const TransportUserSchema = BaseDocument.extend({
	address: z.string(),
	phone_number: z.string().startsWith("+1").length(12),
	location_details: LocationDetails
});

export type TransportUser = z.infer<typeof TransportUserSchema>;