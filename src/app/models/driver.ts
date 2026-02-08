import * as z from "zod";
import { BaseDocument } from "@/app/models/base";
import { LocationSchema } from "@/app/models/location";

export const DriverSchema = BaseDocument.extend({
  full_name: z.string().min(5),
  email: z.email(),
  phone_number: z.string().startsWith("+1").length(12),
  address: z.string().min(4),
  location: z.optional(LocationSchema),
  driver_license_class: z.string().length(7).startsWith("Class "),
  comments: z.optional(z.string().default("")),
});

export type Driver = z.infer<typeof DriverSchema>;
