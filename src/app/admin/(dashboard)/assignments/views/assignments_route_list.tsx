import { Driver } from "@/app/models/driver";
import { DriverRoute } from "@/app/models/fleet_route";
import { Vehicle } from "@/app/models/vehicle";
import { stringToColor } from "@/app/utils/colors";

interface AssignmentsRouteListProps {
    routes?: DriverRoute[];
    driversList: Driver[];
    assignedVehicles?: Record<string, Vehicle>;
}

export default function AssignmentsRouteList({
    routes,
    driversList,
    assignedVehicles,
}: AssignmentsRouteListProps) {
    if (!routes) return null;

    let totalRouteTime = 0;
    for (const r of routes) {
        totalRouteTime += r.estimated_route_time || 0;
    }

    return (
        <div className="min-w-xs absolute bottom-0 left-0 m-4 p-4 z-[500] bg-background rounded-lg">
            <h3 className="font-semibold uppercase text-sm mb-3">Routes</h3>
            <ul className="space-y-3">
                {routes.map((r) => {
                    const driver = driversList.find(
                        (driver) => driver.documentId == r.driver_id
                    );
                    if (!driver) {
                        console.warn(
                            `[WARNING] AssignmentsRouteList: Route returned driver id '${r.driver_id}' not found in drivers list!`
                        );
                        return null;
                    }

                    const assignedVehicle = assignedVehicles
                        ? assignedVehicles[driver.documentId!].name
                        : "";

                    return (
                        <div
                            className="flex items-center justify-between"
                            key={r.driver_id}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor: stringToColor(r.driver_id ?? ""),
                                    }}
                                ></span>
                                <span className="text-sm font-medium">
                                    {driver.full_name} - {assignedVehicle}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                {r.estimated_route_time} min
                            </span>
                        </div>
                    );
                })}
            </ul>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-500">Total Route Time</span>
                <span className="text-sm font-bold">{totalRouteTime} min</span>
            </div>
        </div>
    );
}
