import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const PickupInfoSchema = BaseDocument.extend({
    transport_id: z.string(),
    user_phone_number: z.string(),
    pickup_time: z.string(),
    passengers_picked: z.optional(z.coerce.number()),
    failure_reason: z.optional(z.string()),
});

export type PickupInfo = z.infer<typeof PickupInfoSchema>;
