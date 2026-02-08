# Admin Route Editor – File Guide

Authored by Codex (GPT-5) as part of the route editor implementation.

This document explains how the Admin Route Editor is structured and how the pieces fit together.

## Data Flow Overview

1. `AssignmentsView` renders the editor and passes server-fetched data (drivers, requests, routes).
2. `AssignmentsRouteEditor` uses `useAssignmentsRouteEditor` to:
   - build editable state
   - handle drag-and-drop
   - emit updated routes for the map
3. The editor UI is split into reusable components for rows, droppable lists, and sections.
4. `saveCustomRoutes` persists only the current service routes to Firestore.

## File Map

### `src/app/admin/(dashboard)/assignments/views/assignments_view.tsx`
Top-level client view for the Assignments page. It:
- hosts the map, control panel, and route editor
- keeps `displayRoutes` in state for live map updates
- passes `onRoutesChange` to the editor

### `src/app/admin/(dashboard)/assignments/views/components/assignments_route_editor.tsx`
UI shell for the route editor. It:
- renders the header + actions (Save/Reset)
- wires DnD (`DndContext`) to the logic hook
- composes route sections for drivers + unassigned

### `src/app/admin/(dashboard)/assignments/views/components/use_assignments_route_editor.ts`
All logic/state for the route editor. It:
- builds editable state from `routes`, `driversList`, `requests`
- maintains `editableRoutes` + `unassignedIds`
- rebuilds `currentRoutes` for the map/legend
- handles drag-and-drop reorder/move behavior
- exposes `reset` and `isDirty` helpers

### `src/app/admin/(dashboard)/assignments/views/components/assignments_route_editor_section.tsx`
Reusable section component for a single list. It:
- renders the header and count area
- wraps items in `SortableContext`
- handles empty-state label

### `src/app/admin/(dashboard)/assignments/views/components/assignments_route_editor_item.tsx`
Single draggable request item. It:
- uses `useSortable`
- renders request name + seat count
- applies drag/disabled styling

### `src/app/admin/(dashboard)/assignments/views/components/assignments_route_editor_droppable_list.tsx`
Light wrapper for droppable lists. It:
- uses `useDroppable`
- adds a highlight ring when dragging over

### `src/app/actions/save_custom_routes.ts`
Server action to persist edits. It:
- fetches the existing weekly document
- replaces only the selected service’s routes
- writes back to `assigned-routes/{timestamp}`

## Key Assumptions

- Only transport requests are draggable. Non-request points remain fixed.
- Service 1 uses driver location as the starting point when no route exists.
- Other services default to origin → requests → origin.
- Saving only overwrites routes for the current service number.
