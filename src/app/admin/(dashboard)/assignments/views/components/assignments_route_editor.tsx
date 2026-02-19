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
    <div className="hidden md:flex absolute z-500 mx-4 mb-2 right-0 bottom-0 flex-col gap-0 min-w-0 bg-background rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm h-[90vh]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className="space-y-4 overflow-y-auto">
          {editableRoutes.map((route) => {
            const driver = driversList.find(
              (d) => d.documentId === route.driverId,
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
              {invalidRequestIds.size === 1 ? "" : "s"} missing coordinates
              cannot be dragged.
            </p>
          )}
        </div>
      </DndContext>

      <div className="flex flex-col gap-4 items-center p-4">
        <p
          className={clsx("text-[10px] font-mono uppercase", {
            "text-gray-400": !isDirty,
            "text-amber-500": isDirty,
          })}
        >
          {isDirty ? "Unsaved changes" : "No changes made"}
        </p>

        <div className="w-full flex flex-row items-stretch justify-center gap-2 h-8">
          <PrimaryButton disabled={!isDirty || isSaving} onClick={handleSave}>
            Save
          </PrimaryButton>
          <PrimaryButton
            outline
            disabled={!isDirty || isSaving}
            onClick={reset}
          >
            Reset
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
