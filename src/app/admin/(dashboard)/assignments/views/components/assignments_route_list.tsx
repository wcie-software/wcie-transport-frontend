"use client";

import { Driver } from "@/app/models/driver";
import { DriverRoute } from "@/app/models/fleet_route";
import { Vehicle } from "@/app/models/vehicle";
import { stringToColor } from "@/app/utils/util";
import { useState } from "react";
import PopupForm from "@/app/ui/components/popup_form";
import Table from "@/app/ui/components/table";
import { TransportRequest } from "@/app/models/request";

interface AssignmentsRouteListProps {
    routes?: DriverRoute[];
    driversList: Driver[];
    assignedVehicles?: Record<string, Vehicle>;
    requests: TransportRequest[];
}

export default function AssignmentsRouteList({
    routes,
    driversList,
    assignedVehicles,
    requests,
}: AssignmentsRouteListProps) {
    const [selectedRoute, setSelectedRoute] = useState<DriverRoute | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    if (!routes) return null;

    let totalRouteTime = 0;
    for (const r of routes) {
        totalRouteTime += r.estimated_route_time || 0;
    }

    const selectedRouteRequests = selectedRoute?.route
        .map((point) => requests.find((r) => r.documentId === point.id))
        .filter((r): r is TransportRequest => !!r) || [];

    return (
        <>
            <div className="min-w-xs p-4 bg-background rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
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
                                className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-colors"
                                key={r.driver_id}
                                onClick={() => {
                                    setSelectedDriver(driver);
                                    setSelectedRoute(r);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    {/* Coloured circle */}
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: stringToColor(r.driver_id ?? ""),
                                        }}
                                    ></span>
                                    <p className="text-sm font-medium">
                                        {driver.full_name} - {assignedVehicle}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {r.estimated_route_time} min
                                </p>
                            </div>
                        );
                    })}
                </ul>

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Total Route Time</span>
                    <span className="text-sm font-bold">{totalRouteTime} min</span>
                </div>
            </div>

            <PopupForm
                open={selectedRoute != null}
                title={`Route Details – ${selectedDriver?.full_name}`}
                onClose={() => {
                    setSelectedRoute(null);
                    setSelectedDriver(null);
                }}
            >
                <Table
                    headerMap={{
                        full_name: "Name",
                        no_of_seats: "Seats",
                        phone_number: "Phone",
                        address: "Address",
                    }}
                    fieldStyle={(k, v, i) => {
                        if (k === "full_name") {
                            switch (requests[i].status) {
                                case "failed":
                                    return "text-red-400 line-through";
                                default:
                                    return "text-foreground";
                            }
                        }
                    }}
                    body={selectedRouteRequests}
                />
            </PopupForm>
        </>
    );
}
