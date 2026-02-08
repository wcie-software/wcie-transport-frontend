/**
 * Single draggable request item used in the route editor lists.
 */
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

export default function AssignmentsRouteEditorItem({
  id,
  label,
  seats,
  disabled,
}: {
  id: string;
  label: string;
  seats: number;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !!disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={clsx(
        "flex items-center justify-between rounded-lg border border-transparent px-3 py-2 min-h-10 text-xs",
        {
          "bg-tertiary cursor-grab": !disabled,
          "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700":
            disabled,
          "shadow-sm border-primary": isDragging,
        }
      )}
      {...attributes}
      {...listeners}
    >
      <span className="truncate">{label}</span>
      <span className="text-[10px] text-gray-500">{seats} seats</span>
    </li>
  );
}
