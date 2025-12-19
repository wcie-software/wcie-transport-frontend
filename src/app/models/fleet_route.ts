import * as z from "zod";
import { BaseDocument } from "@/app/models/base";
import { Location } from "@/app/models/location";

const RequestPoint = z.object({
  id: z.string(),
  position: Location,
});

const DriverRouteSchema = z.object({
  driver_id: z.string(),
  assigned_vehicle_id: z.string(),
  route: z.array(RequestPoint),
});

export const DriverRoutesSchema = BaseDocument.extend({
  timestamp: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/), // mm/dd/yyyy
  routes: z.record(z.string(), z.array(DriverRouteSchema)),
});

export type DriverRoutes = z.infer<typeof DriverRoutesSchema>;
export type DriverRoute = z.infer<typeof DriverRouteSchema>;
