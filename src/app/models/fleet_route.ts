import * as z from "zod";
import { BaseDocument } from "@/app/models/base";
import { LocationSchema } from "@/app/models/location";

const RequestPoint = z.object({
  id: z.string(),
  position: LocationSchema,
});

const DriverRouteSchema = z.object({
  driver_id: z.string(),
  assigned_vehicle_id: z.string(),
  service_number: z.coerce.number().min(1),
  route: z.array(RequestPoint),
  estimated_route_time: z.coerce.number().min(0).default(0),
});

export const DriverRoutesSchema = BaseDocument.extend({
  timestamp: z.string(),
  routes: z.array(DriverRouteSchema),
});

export type DriverRoutes = z.infer<typeof DriverRoutesSchema>;
export type DriverRoute = z.infer<typeof DriverRouteSchema>;
