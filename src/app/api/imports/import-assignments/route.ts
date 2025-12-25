import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest } from "next/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { DriverRoutes } from "@/app/models/fleet_route";

const assignmentsData: DriverRoutes[] = [
  {
    documentId: "11-2-2025",
    timestamp: "11/02/2025",
    routes: {
      "1": [
        {
          assigned_vehicle_id: "GCeUkavrmXxE52JPAEaK",
          driver_id: "iEvi3KStL2zm5HDRrTjO",
          route: [
            {
              id: "iEvi3KStL2zm5HDRrTjO",
              position: {
                latitude: 53.5227487,
                longitude: -113.70093849999999,
              },
            },
            {
              id: "hDv7lcEXTt0Uta7Hif7M",
              position: {
                latitude: 53.5142692,
                longitude: -113.70090289999999,
              },
            },
            {
              id: "heGtosgpdNCyPY0ZdUjY",
              position: {
                latitude: 53.6391816,
                longitude: -113.4413299,
              },
            },
            {
              id: "ccexNRSfxZ22BvyyjEGo",
              position: {
                latitude: 53.6086472,
                longitude: -113.41133389999999,
              },
            },
            {
              id: "eo36eaO6Y0kGbv0XH229",
              position: {
                latitude: 53.592434399999995,
                longitude: -113.38898119999999,
              },
            },
            {
              id: "pMrKBYjJmnuDK1hOMdS4",
              position: {
                latitude: 53.5459943,
                longitude: -113.47891039999999,
              },
            },
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
          ],
        },
        {
          assigned_vehicle_id: "UAJGnZ8rNa6wDVfWmwkW",
          driver_id: "zUNPU84ndF3rU3zmsULZ",
          route: [
            {
              id: "zUNPU84ndF3rU3zmsULZ",
              position: {
                latitude: 53.4005478,
                longitude: -113.5864838,
              },
            },
            {
              id: "H8Xzah68buQ8ywuJEN9u",
              position: {
                latitude: 53.4212628,
                longitude: -113.43482549999999,
              },
            },
            {
              id: "1ZfXuxXSLkBwLfzT8dJB",
              position: {
                latitude: 53.4411926,
                longitude: -113.3839718,
              },
            },
            {
              id: "eRsaf9BZT5JcxHQ2HjeM",
              position: {
                latitude: 53.5385074,
                longitude: -113.4942986,
              },
            },
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
          ],
        },
      ],
      "2": [
        {
          assigned_vehicle_id: "GCeUkavrmXxE52JPAEaK",
          driver_id: "sn51LHT3z6LB7VvjxHb6",
          route: [
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
            {
              id: "hPQhL9WeXofCjJF1cd2w",
              position: {
                latitude: 53.5982756,
                longitude: -113.4845477,
              },
            },
            {
              id: "1ePYpawQlMrVjEyS2eUI",
              position: {
                latitude: 53.632868599999995,
                longitude: -113.52280959999999,
              },
            },
            {
              id: "dLJ6jETbNEatOUzJhmBd",
              position: {
                latitude: 53.5424861,
                longitude: -113.5854844,
              },
            },
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
          ],
        },
      ],
    },
  },
  {
    documentId: "11-30-2025",
    timestamp: "11/30/2025",
    routes: {
      "1": [
        {
          assigned_vehicle_id: "ICZI7QOAQk3vak9ibTtY",
          driver_id: "O5aN49VxKCi7yDneQ7aP",
          route: [
            {
              id: "O5aN49VxKCi7yDneQ7aP",
              position: {
                latitude: 53.4006751,
                longitude: -113.5394281,
              },
            },
            {
              id: "xU2YFKqNNpazsjiSsB0X",
              position: {
                latitude: 53.4212628,
                longitude: -113.43482549999999,
              },
            },
            {
              id: "uzlCab8dpcPFwufMGDj9",
              position: {
                latitude: 53.4487149,
                longitude: -113.4946566,
              },
            },
            {
              id: "7HPtCmuJ0VP0jXQYWbfo",
              position: {
                latitude: 53.537681299999996,
                longitude: -113.49962169999999,
              },
            },
            {
              id: "PIP8il2HYMvQqUYgLGtT",
              position: {
                latitude: 53.5385074,
                longitude: -113.4942986,
              },
            },
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
          ],
        },
        {
          assigned_vehicle_id: "GCeUkavrmXxE52JPAEaK",
          driver_id: "7nuBxYPDskRA2HvKUS65",
          route: [
            {
              id: "7nuBxYPDskRA2HvKUS65",
              position: {
                latitude: 53.609786299999996,
                longitude: -113.4156156,
              },
            },
            {
              id: "sy4ppOcJBC2GyWhikxks",
              position: {
                latitude: 53.6086472,
                longitude: -113.41133389999999,
              },
            },
            {
              id: "L5cHGJSnuT3a65dHoN4j",
              position: {
                latitude: 53.582992,
                longitude: -113.3920983,
              },
            },
            {
              id: "t4R6lGmtiqV8tTLw8Ggz",
              position: {
                latitude: 53.5459943,
                longitude: -113.47891039999999,
              },
            },
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
          ],
        },
        {
          assigned_vehicle_id: "UAJGnZ8rNa6wDVfWmwkW",
          driver_id: "WMUubGhdaB0iakCbR9J8",
          route: [
            {
              id: "WMUubGhdaB0iakCbR9J8",
              position: {
                latitude: 53.6274973,
                longitude: -113.4013944,
              },
            },
            {
              id: "iZNuAWfVcsZMrrs5UmAD",
              position: {
                latitude: 53.634602,
                longitude: -113.4325988,
              },
            },
            {
              id: "slG5TPLKxKwptaT059Ig",
              position: {
                latitude: 53.5424861,
                longitude: -113.5854844,
              },
            },
            {
              id: "mnD7jiOudob0rwBwT1As",
              position: {
                latitude: 53.5505516,
                longitude: -113.5071325,
              },
            },
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
          ],
        },
      ],
      "2": [
        {
          assigned_vehicle_id: "ICZI7QOAQk3vak9ibTtY",
          driver_id: "cLBbpJ5hgmocG7qcLMdH",
          route: [
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
            {
              id: "uUE07YeL6ugIqjC35Itj",
              position: {
                latitude: 53.522520500000006,
                longitude: -113.530915,
              },
            },
            {
              id: "7xEYqwFZ2odZlwJZgBYe",
              position: {
                latitude: 53.5219281,
                longitude: -113.53061699999999,
              },
            },
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
          ],
        },
        {
          assigned_vehicle_id: "GCeUkavrmXxE52JPAEaK",
          driver_id: "zUNPU84ndF3rU3zmsULZ",
          route: [
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
            {
              id: "8lqppCaIm0ClMNsItnxL",
              position: {
                latitude: 53.5982756,
                longitude: -113.4845477,
              },
            },
            {
              id: "nrMOfJFxP7E59TFoiu1R",
              position: {
                latitude: 53.6417687,
                longitude: -113.4589275,
              },
            },
            {
              id: "CZJWcdFAgylvizKOZdDj",
              position: {
                latitude: 53.6326355,
                longitude: -113.41271239999999,
              },
            },
            {
              id: "origin",
              position: {
                latitude: 53.5461888,
                longitude: -113.4886912,
              },
            },
          ],
        },
      ],
    },
  },
];

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not allowed", { status: 403 });
  }

  const { db } = await getFirebaseAdmin();
  const schedules = db.collection(FirestoreCollections.Assignments);

  for (const a of assignmentsData) {
    const id = a.documentId!;
    delete a.documentId;

    try {
      await schedules.doc(id).set(a);
    } catch (e) {
      console.error("Error importing assignments", String(e));
    }
  }

  return new Response("Done");
}
