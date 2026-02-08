import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const PickupInfoSchema = BaseDocument.extend({
  transport_id: z.string(),
  user_phone_number: z.string(),
  pickup_time: z.string(),
  passengers_picked: z.coerce.number().default(0),
  failure_reason: z.nullable(z.string().min(1)),
});

export type PickupInfo = z.infer<typeof PickupInfoSchema>;
