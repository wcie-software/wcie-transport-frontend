import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { Driver, DriverSchema } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirestoreCollections } from "@/app/utils/firestore";
import { FirestoreAdminHelper } from "@/app/utils/firestore_admin";
import {
  formatSundayKey,
  getNearestSunday,
  getWeekRange,
  parseSundayKey,
} from "@/app/utils/util";
import { Schedule, ScheduleSchema } from "@/app/models/schedule";
import { DriverRoutes, DriverRoutesSchema } from "@/app/models/fleet_route";
import AssignmentsView from "@/app/admin/(dashboard)/assignments/views/assignments_view";
import { Vehicle, VehicleSchema } from "@/app/models/vehicle";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ timestamp?: string; service_number?: string }>;
}) {
  const params = await searchParams;

  // Resolve the service Sunday for this view. A submission window for
  // service Sunday S is [S-7 00:00, S 00:00), so Sunday submissions roll
  // to the *next* Sunday. Parse the canonical M-D-YYYY key when provided,
  // otherwise fall back to the nearest upcoming Sunday.
  let serviceSunday: Date;
  const parsedSunday = params?.timestamp
    ? parseSundayKey(params.timestamp)
    : null;
  if (parsedSunday) {
    serviceSunday = parsedSunday;
  } else {
    serviceSunday = getNearestSunday(new Date());
  }

  // M-D-YYYY canonical Sunday key used for schedule/assignment docs.
  const timestamp = formatSundayKey(serviceSunday);

  // Submission window for this service Sunday: [S-7, S) in Edmonton time.
  const { start: rangeStart, end: rangeEnd } = getWeekRange(serviceSunday);

  const service = parseInt(params?.service_number ?? "1");
  const serviceNumber = isNaN(service) ? 1 : service;

  const { db } = await getFirebaseAdmin();
  const fdb = new FirestoreAdminHelper(db);

  // Get all requests that fall within the time range and are for that service
  const requestsList = (
    await fdb.queryCollection<TransportRequest>(
      FirestoreCollections.Requests,
      TransportRequestSchema,
      [
        { field: "service_number", operator: "==", value: serviceNumber },
        {
          field: "timestamp",
          operator: ">=",
          value: rangeStart,
        },
        {
          field: "timestamp",
          operator: "<",
          value: rangeEnd,
        },
      ],
      "timestamp", // Sort by time
    )
  ).filter((t) => t.status != "cancelled"); // Don't include cancelled

  let driverList: Driver[] = [];
  // Get driver schedule for this week
  const schedule = await fdb.getDocument<Schedule>(
    FirestoreCollections.Schedules,
    ScheduleSchema,
    timestamp,
  );

  const serviceNumberString = String(serviceNumber);
  if (schedule && serviceNumberString in schedule.schedule) {
    // Get drivers that are in this schedule
    driverList = await fdb.getDocuments<Driver>(
      FirestoreCollections.Drivers,
      DriverSchema,
      schedule.schedule[serviceNumberString],
    );
  }

  // Get route for this week
  const driverRoutes = await fdb.getDocument<DriverRoutes>(
    FirestoreCollections.Assignments,
    DriverRoutesSchema,
    timestamp,
  );
  // Get only routes for the particular service
  const routes = driverRoutes?.routes.filter(
    (r) => r.service_number == serviceNumber,
  );

  let validRoute = true;
  // If routes have been generated, get the vehicles assigned to each driver
  const assignedVehicles: Record<string, Vehicle> = {};
  if (routes) {
    const vehicleIdToDriverId: Record<string, string> = {};
    for (const r of routes) {
      if (!r.assigned_vehicle_id || !r.driver_id) {
        validRoute = false;
        break;
      }

      // Vehicle to driver map
      vehicleIdToDriverId[r.assigned_vehicle_id] = r.driver_id;
    }

    if (validRoute) {
      // Get the vehicles pertaining to the chosen drivers
      const vehicles = await fdb.getDocuments<Vehicle>(
        FirestoreCollections.Vehicles,
        VehicleSchema,
        Object.keys(vehicleIdToDriverId),
      );

      vehicles.forEach((v) => {
        try {
          const driverId = vehicleIdToDriverId[v.documentId!];
          // Driver to vehicle details map
          assignedVehicles[driverId] = v;
        } catch (e) {
          console.warn(
            `[Assignments Page] WARNING: Retrieved vehicle '${v.name}' that does not exist in generated route '${driverRoutes?.documentId}'`,
          );
        }
      });
    }
  }

  return (
    <div className="w-full h-screen">
      <AssignmentsView
        timestamp={timestamp}
        driversList={driverList}
        assignedVehicles={assignedVehicles}
        requestsList={requestsList}
        routes={validRoute ? routes : undefined}
      />
    </div>
  );
}
