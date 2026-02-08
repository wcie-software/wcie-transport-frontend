/**
 * Route editor UI shell. Owns layout and wires drag-and-drop to the logic hook.
 * Keeps presentation concerns here while state + behaviors live in
 * `use_assignments_route_editor.ts`.
 */
"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";
import PrimaryButton from "@/app/ui/components/primary_button";
import { Driver } from "@/app/models/driver";
import { DriverRoute } from "@/app/models/fleet_route";
import { TransportRequest } from "@/app/models/request";
import { Vehicle } from "@/app/models/vehicle";
import { saveCustomRoutes } from "@/app/actions/save_custom_routes";
import { stringToColor } from "@/app/utils/util";
import AssignmentsRouteEditorSection from "./assignments_route_editor_section";
import useAssignmentsRouteEditor from "../../hooks/use_assignments_route_editor";

type AssignmentsRouteEditorProps = {
  timestamp: string;
  serviceNumber: number;
  driversList: Driver[];
  assignedVehicles?: Record<string, Vehicle>;
  requests: TransportRequest[];
  routes?: DriverRoute[];
  onRoutesChange: (routes: DriverRoute[]) => void;
};

function driverContainerId(driverId: string) {
  return `driver:${driverId}`;
}

export default function AssignmentsRouteEditor({
  timestamp,
  serviceNumber,
  driversList,
  assignedVehicles,
  requests,
  routes,
  onRoutesChange,
}: AssignmentsRouteEditorProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [isSaving, setIsSaving] = useState(false);
  const {
    editableRoutes,
    unassignedIds,
    invalidRequestIds,
    requestsById,
    currentRoutes,
    isDirty,
    reset,
    onDragEnd,
    setDirty,
  } = useAssignmentsRouteEditor({
    serviceNumber,
    driversList,
    requests,
    routes,
    onRoutesChange,
  });

  async function handleSave() {
    setIsSaving(true);
    const res = await saveCustomRoutes(timestamp, serviceNumber, currentRoutes);
    if (res.success) {
      toast.success("Routes saved");
      setDirty(false);
    } else {
      toast.error(res.message ?? "Failed to save routes");
    }
    setIsSaving(false);
  }

  const unassignedLabel = "Unassigned";

  return (
    <div className="min-w-xs bg-background rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between gap-2">
        <span
          className={clsx("text-[10px] font-mono uppercase", {
            "text-gray-400": !isDirty,
            "text-amber-500": isDirty,
          })}
        >
          {isDirty ? "Unsaved changes" : "No changes made"}
        </span>
      </div>

      <div className="w-full mt-4 flex flex-row items-stretch justify-center gap-4 h-8">
        <PrimaryButton disabled={!isDirty || isSaving} onClick={handleSave}>
          Save
        </PrimaryButton>
        <PrimaryButton outline disabled={!isDirty || isSaving} onClick={reset}>
          Reset
        </PrimaryButton>
      </div>

			<hr className="w-full text-tertiary my-4" />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className="mt-4 space-y-4">
          {editableRoutes.map((route) => {
            const driver = driversList.find(
              (d) => d.documentId === route.driverId
            );
            const assignedVehicleName =
              route.assignedVehicleId && assignedVehicles
                ? assignedVehicles[route.driverId]?.name
                : "";

            return (
              <AssignmentsRouteEditorSection
                key={route.driverId}
                droppableId={driverContainerId(route.driverId)}
                requestIds={route.requestIds}
                requestsById={requestsById}
                invalidRequestIds={invalidRequestIds}
                emptyLabel="No requests assigned"
                headerLeft={
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: stringToColor(route.driverId) }}
                    ></span>
                    <span className="truncate">
                      {driver?.full_name ?? "Unknown Driver"}
                    </span>
                  </div>
                }
                headerRight={assignedVehicleName || "No vehicle assigned"}
              />
            );
          })}

          <AssignmentsRouteEditorSection
            droppableId="unassigned"
            requestIds={unassignedIds}
            requestsById={requestsById}
            invalidRequestIds={invalidRequestIds}
            emptyLabel="All requests assigned"
            headerLeft={<span>{unassignedLabel}</span>}
            headerRight={`${unassignedIds.length} request${
              unassignedIds.length === 1 ? "" : "s"
            }`}
          />

          {invalidRequestIds.size > 0 && (
            <p className="text-[10px] text-amber-500">
              {invalidRequestIds.size} request
              {invalidRequestIds.size === 1 ? "" : "s"} missing coordinates cannot
              be dragged.
            </p>
          )}
        </div>
      </DndContext>
    </div>
  );
}
