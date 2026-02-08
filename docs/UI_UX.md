# UI/UX Design

This document outlines the design principles, color palette, and UI components used in the **WCIE Transport** application.

## Design Principles

- **Clarity and Efficiency**: The admin dashboard is designed to provide a clear overview of transportation requests and assignments, allowing for quick decision-making.
- **Responsiveness**: The application is built to work across different screen sizes, with a collapsible sidebar for mobile/tablet views.
- **Visual Feedback**: Icons and color-coded status indicators (e.g., for request status) help users quickly identify the state of the system.

## Color Palette

The application uses a clean, modern color palette defined in `src/app/globals.css`:

| Variable | HEX Code | Purpose |
| :--- | :--- | :--- |
| `--primary` | `#EC1C24` | Primary brand color, used for buttons, highlights, and icons. |
| `--background` | `#ffffff` | Main background color (light mode). |
| `--foreground` | `#101922` | Main text color. |
| `--tertiary` | `#686868` | Neutral accents and labels. |
| `--deleteRed` | `#d3493b` | Destructive actions (delete, cancel). |

*Note: The application supports Dark Mode via `@media (prefers-color-scheme: dark)`.*

## Typography

- **Primary Font**: Arial, Helvetica, sans-serif (System defaults for reliability).
- **Secondary Font**: PT Serif (used for branding in the sidebar via `--font-pt-serif`).

## Components

The UI is built using a combination of custom components and some MUI/Emotion elements.

### Key Shared Components (`src/app/ui/`)
- **`Table`**: Generic table component for displaying lists of data (requests, drivers, etc.).
- **`Sidebar`**: The main navigation for the admin dashboard.
- **`PopupForm`**: Modal-like component for adding or editing records.
- **`Button`**: Consistent styling for primary and secondary actions.

### Maps Integration
The application uses **React-Leaflet** for displaying maps and route visualizations.
- **`AssignmentsMap`**: Shows the routes for multiple drivers on a single map.
- **`RouteLines`**: Draws the path between pickup/drop-off points.

## User Flows

1.  **Request Submission**: (User) Users are directed to a **Fillout** form to input their details. Upon completion, the form calls a microservice that adds the user's data to the Firestore database.
2.  **Scheduling**: (Admin) Admins assign drivers to specific service numbers for the week.
3.  **Route Generation**: (Admin) Admins trigger a route optimization process (likely using Google Maps/Fleet Routing) to assign requests to drivers/vehicles.
4.  **Assignment Review**: (Admin) Admins review the generated routes and make manual adjustments if necessary.
5.  **Driver View**: (Driver) Drivers log in to see their specific routes and passenger details.
