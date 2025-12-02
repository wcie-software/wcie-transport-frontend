import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

const RouteBatch = z.object({
	batch_no: z.coerce.number().min(0),
	rider_request_ids: z.array(z.string()),
});

const Route = z.object({
	assigned_driver_id: z.string(),
	batches: z.array(RouteBatch)
});

export const FleetRouteSchema = BaseDocument.extend({
	timestamp: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/), // mm/dd/yyyy
	routes: z.array(Route)
});

export type FleetRoute = z.infer<typeof FleetRouteSchema>;
