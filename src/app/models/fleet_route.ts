import * as z from "zod";
import { BaseDocument } from "@/app/models/base";
import { Location } from "@/app/models/location";

const RequestPoint = z.object({
	request_id: z.string(),
	point: Location
})

const DriverRoute = z.object({
    driver_id: z.string(),
    assigned_vehicle_id: z.string(),
    service_number: z.int().min(1),
    route: z.array(RequestPoint)
});

export const DriverRoutesSchema = BaseDocument.extend({
	timestamp: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/), // mm/dd/yyyy
	routes: z.array(DriverRoute)
});

export type DriverRoutes = z.infer<typeof DriverRoutesSchema>;
