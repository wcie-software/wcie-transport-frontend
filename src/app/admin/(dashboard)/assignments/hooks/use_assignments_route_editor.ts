/**
 * Route editor state + behaviors (DnD, derived routes, reset).
 * Exposes a small API for the UI shell to render and control.
 */
"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { Location } from "@/app/models/location";
import { Driver } from "@/app/models/driver";
import { DriverRoute } from "@/app/models/fleet_route";
import { TransportRequest } from "@/app/models/request";

const ORIGIN_POINT = {
  id: "origin",
  position: { latitude: 53.5461888, longitude: -113.4886912 },
};

type RequestPoint = {
  id: string;
  position: Location;
};

export type EditableRoute = {
  driverId: string;
  assignedVehicleId: string;
  estimatedRouteTime: number;
  fixedPrefix: RequestPoint[];
  fixedSuffix: RequestPoint[];
  requestIds: string[];
};

export type AssignmentsRouteEditorState = {
  editableRoutes: EditableRoute[];
  unassignedIds: string[];
  invalidRequestIds: Set<string>;
  requestsById: Map<string, TransportRequest>;
  currentRoutes: DriverRoute[];
  isDirty: boolean;
  reset: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  setDirty: (value: boolean) => void;
};

function driverContainerId(driverId: string) {
  return `driver:${driverId}`;
}

export default function useAssignmentsRouteEditor({
  serviceNumber,
  driversList,
  requests,
  routes,
  onRoutesChange,
}: {
  serviceNumber: number;
  driversList: Driver[];
  requests: TransportRequest[];
  routes?: DriverRoute[];
  onRoutesChange: (routes: DriverRoute[]) => void;
}): AssignmentsRouteEditorState {
  // Map request id -> request object for fast lookups in render and rebuilds.
  const requestsById = useMemo(() => {
    const map = new Map<string, TransportRequest>();
    requests.forEach((r) => {
      if (r.documentId) {
        map.set(r.documentId, r);
      }
    });
    return map;
  }, [requests]);

  // Preserve original positions from existing routes (even if request coords are missing).
  const requestPositionsById = useMemo(() => {
    const map: Record<string, Location> = {};
    routes?.forEach((r) => {
      r.route.forEach((point) => {
        if (requestsById.has(point.id) && !map[point.id]) {
          map[point.id] = point.position;
        }
      });
    });
    return map;
  }, [routes, requestsById]);

  const [editableRoutes, setEditableRoutes] = useState<EditableRoute[]>([]);
  const [unassignedIds, setUnassignedIds] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Build initial editor state from existing routes and requests.
  // Produces fixed prefix/suffix points and a request-only order.
  function buildInitialState() {
    const usedRequestIds = new Set<string>();

    const builtRoutes: EditableRoute[] = driversList.map((driver) => {
      const driverId = driver.documentId!;
      const existingRoute = routes?.find((r) => r.driver_id === driverId);

      if (existingRoute) {
        const requestIds = existingRoute.route
          .map((p) => p.id)
          .filter((id) => requestsById.has(id));

        requestIds.forEach((id) => usedRequestIds.add(id));

        // If no request points exist, keep the entire route as fixed prefix.
        if (requestIds.length === 0) {
          return {
            driverId,
            assignedVehicleId: existingRoute.assigned_vehicle_id ?? "",
            estimatedRouteTime: existingRoute.estimated_route_time ?? 0,
            fixedPrefix: existingRoute.route,
            fixedSuffix: [],
            requestIds: [],
          };
        }

        // Split non-request points into fixed prefix/suffix so only requests are draggable.
        const firstIndex = existingRoute.route.findIndex((p) =>
          requestsById.has(p.id)
        );
        const lastIndex =
          existingRoute.route.length -
          1 -
          [...existingRoute.route]
            .reverse()
            .findIndex((p) => requestsById.has(p.id));

        const fixedPrefix = existingRoute.route.slice(0, firstIndex);
        const fixedSuffix = existingRoute.route.slice(lastIndex + 1);

        return {
          driverId,
          assignedVehicleId: existingRoute.assigned_vehicle_id ?? "",
          estimatedRouteTime: existingRoute.estimated_route_time ?? 0,
          fixedPrefix,
          fixedSuffix,
          requestIds,
        };
      }

      // New route defaults when no existing route is found.
      const driverLocationPoint =
        driver.location && serviceNumber === 1
          ? { id: driverId, position: driver.location }
          : ORIGIN_POINT;
      const suffixPoint = ORIGIN_POINT;

      return {
        driverId,
        assignedVehicleId: "",
        estimatedRouteTime: 0,
        fixedPrefix: [driverLocationPoint],
        fixedSuffix: [suffixPoint],
        requestIds: [],
      };
    });

    const unassigned = requests
      .map((r) => r.documentId!)
      .filter((id) => !usedRequestIds.has(id));

    return { builtRoutes, unassigned };
  }

  // Reset editor state any time upstream data changes (new week/service/routes).
  useEffect(() => {
    const { builtRoutes, unassigned } = buildInitialState();
    setEditableRoutes(builtRoutes);
    setUnassignedIds(unassigned);
    setIsDirty(false);
  }, [driversList, routes, requests, requestsById, serviceNumber]);

  // Requests without coordinates (or preserved positions) can't be placed on the map.
  const invalidRequestIds = useMemo(() => {
    return new Set(
      requests
        .filter((r) => !r.coordinates && !requestPositionsById[r.documentId!])
        .map((r) => r.documentId!)
    );
  }, [requests, requestPositionsById]);

  // Rebuild the `DriverRoute` array to update the map + legend immediately.
  const currentRoutes = useMemo(() => {
    return editableRoutes.map((route) => {
      const requestPoints = route.requestIds
        .map((id) => {
          const request = requestsById.get(id);
          const position =
            request?.coordinates || requestPositionsById[id] || null;
          if (!position) {
            return null;
          }
          return { id, position };
        })
        .filter((p): p is RequestPoint => !!p);

      return {
        driver_id: route.driverId,
        assigned_vehicle_id: route.assignedVehicleId ?? "",
        service_number: serviceNumber,
        estimated_route_time: route.estimatedRouteTime ?? 0,
        route: [...route.fixedPrefix, ...requestPoints, ...route.fixedSuffix],
      } satisfies DriverRoute;
    });
  }, [
    editableRoutes,
    requestsById,
    requestPositionsById,
    serviceNumber,
  ]);

  // Emit rebuilt routes so the map can render updated polylines.
  useEffect(() => {
    onRoutesChange(currentRoutes);
  }, [currentRoutes, onRoutesChange]);

  // Resolve which list contains a dragged item.
  function findContainerForItem(itemId: string) {
    if (unassignedIds.includes(itemId)) {
      return "unassigned";
    }
    const route = editableRoutes.find((r) => r.requestIds.includes(itemId));
    return route ? driverContainerId(route.driverId) : null;
  }

  function getDriverRouteIndexByContainer(containerId: string) {
    if (!containerId.startsWith("driver:")) return -1;
    const driverId = containerId.replace("driver:", "");
    return editableRoutes.findIndex((r) => r.driverId === driverId);
  }

  // Central DnD handler: reorder within list or move between lists.
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainerForItem(activeId) || activeId;
    const overContainer =
      findContainerForItem(overId) ||
      (overId.startsWith("driver:") || overId === "unassigned" ? overId : null);

    if (!overContainer || !activeContainer) return;
    // Work on shallow copies to avoid mutating state directly.
    const nextRoutes = editableRoutes.map((route) => ({
      ...route,
      requestIds: [...route.requestIds],
    }));
    const nextUnassigned = [...unassignedIds];

    const removeFromContainer = (containerId: string, itemId: string) => {
      if (containerId === "unassigned") {
        const index = nextUnassigned.indexOf(itemId);
        if (index !== -1) nextUnassigned.splice(index, 1);
        return;
      }
      const routeIndex = getDriverRouteIndexByContainer(containerId);
      if (routeIndex === -1) return;
      const ids = nextRoutes[routeIndex].requestIds;
      const index = ids.indexOf(itemId);
      if (index !== -1) ids.splice(index, 1);
    };

    const moveToContainer = (
      containerId: string,
      itemId: string,
      overId?: string
    ) => {
      if (containerId === "unassigned") {
        const index = overId ? nextUnassigned.indexOf(overId) : -1;
        if (index >= 0) {
          nextUnassigned.splice(index, 0, itemId);
        } else {
          nextUnassigned.push(itemId);
        }
        return;
      }

      const routeIndex = getDriverRouteIndexByContainer(containerId);
      if (routeIndex === -1) return;
      const ids = nextRoutes[routeIndex].requestIds;
      const index = overId ? ids.indexOf(overId) : -1;
      if (index >= 0) {
        ids.splice(index, 0, itemId);
      } else {
        ids.push(itemId);
      }
    };

    if (activeContainer === overContainer) {
      if (overId === overContainer) return;

      // Same list reorder.
      if (activeContainer === "unassigned") {
        const oldIndex = nextUnassigned.indexOf(activeId);
        const newIndex = nextUnassigned.indexOf(overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const updated = arrayMove(nextUnassigned, oldIndex, newIndex);
          setUnassignedIds(updated);
          setIsDirty(true);
        }
      } else {
        const routeIndex = getDriverRouteIndexByContainer(activeContainer);
        if (routeIndex === -1) return;
        const route = nextRoutes[routeIndex];
        const oldIndex = route.requestIds.indexOf(activeId);
        const newIndex = route.requestIds.indexOf(overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          route.requestIds = arrayMove(route.requestIds, oldIndex, newIndex);
          setEditableRoutes(nextRoutes);
          setIsDirty(true);
        }
      }
      return;
    }

    // Move between lists.
    removeFromContainer(activeContainer, activeId);
    moveToContainer(overContainer, activeId, overId === overContainer ? undefined : overId);
    setEditableRoutes(nextRoutes);
    setUnassignedIds(nextUnassigned);
    setIsDirty(true);
  }

  return {
    editableRoutes,
    unassignedIds,
    invalidRequestIds,
    requestsById,
    currentRoutes,
    isDirty,
    reset: () => {
      const { builtRoutes, unassigned } = buildInitialState();
      setEditableRoutes(builtRoutes);
      setUnassignedIds(unassigned);
      setIsDirty(false);
    },
    onDragEnd,
    setDirty: setIsDirty,
  };
}
