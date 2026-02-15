import * as z from "zod";
import { BaseDocument } from "@/app/models/base";
import { LocationSchema } from "@/app/models/location";
import { Constants } from "@/app/utils/util";

export const TransportRequestSchema = BaseDocument.extend({
  full_name: z.string().min(2),
  phone_number: z.string().startsWith("+1").length(12),
  userId: z.optional(z.string()),
  address: z.string(),
  google_maps_link: z.url(),
  coordinates: LocationSchema,
  service_number: z.coerce.number().min(1).max(Constants.NUMBER_OF_SERVICES),
  no_of_seats: z.coerce.number().min(1),
  no_of_children: z.coerce.number().min(0).default(0),
  timestamp: z.string(),
  status: z
    .optional(z.enum(["normal", "cancelled", "failed", "successful"]))
    .default("normal"),
  // Ensure no of seats is always greater than number of children
}).refine((data) => data.no_of_children < data.no_of_seats, {
  error: "Not enough seats to accommodate number of children",
  path: ["no_of_children"],
});

export type TransportRequest = z.infer<typeof TransportRequestSchema>;
