"use client";

import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

export default function AssignmentsRouteEditorDroppableList({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <ul
      ref={setNodeRef}
      id={id}
      className={clsx(className, { "ring-1 ring-primary": isOver })}
    >
      {children}
    </ul>
  );
}
