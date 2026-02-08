"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import AssignmentsRouteEditorDroppableList from "./assignments_route_editor_droppable_list";
import AssignmentsRouteEditorItem from "./assignments_route_editor_item";
import { TransportRequest } from "@/app/models/request";

export default function AssignmentsRouteEditorSection({
  droppableId,
  requestIds,
  requestsById,
  invalidRequestIds,
  emptyLabel,
  headerLeft,
  headerRight,
}: {
  droppableId: string;
  requestIds: string[];
  requestsById: Map<string, TransportRequest>;
  invalidRequestIds: Set<string>;
  emptyLabel: string;
  headerLeft: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="min-w-0">{headerLeft}</div>
        {headerRight ? (
          <div className="text-[10px] text-gray-500 truncate">{headerRight}</div>
        ) : null}
      </div>
      <SortableContext
        items={requestIds}
        strategy={verticalListSortingStrategy}
      >
        <AssignmentsRouteEditorDroppableList
          id={droppableId}
          className="min-h-10 space-y-2 rounded-lg p-2"
        >
          {requestIds.length === 0 && (
            <li className="text-[10px] text-gray-400">{emptyLabel}</li>
          )}
          {requestIds.map((id) => {
            const request = requestsById.get(id);
            if (!request) return null;
            const disabled = invalidRequestIds.has(id);
            return (
              <AssignmentsRouteEditorItem
                key={id}
                id={id}
                label={request.full_name}
                seats={request.no_of_seats}
                disabled={disabled}
              />
            );
          })}
        </AssignmentsRouteEditorDroppableList>
      </SortableContext>
    </div>
  );
}
