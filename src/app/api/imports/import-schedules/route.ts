import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest } from "next/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { Schedule } from "@/app/models/schedule";

const schedulesData: Schedule[] = [
  {
    documentId: "11-2-2025",
    timestamp: 1762063200000,
    schedule: {
      "1": [
        "sn51LHT3z6LB7VvjxHb6",
        "iEvi3KStL2zm5HDRrTjO",
        "zUNPU84ndF3rU3zmsULZ",
      ],
      "2": ["un0pagZN77SBvo3skRfU", "sn51LHT3z6LB7VvjxHb6"],
    },
  },
  {
    documentId: "11-9-2025",
    timestamp: 1762671600000,
    schedule: {
      "1": [
        "sn51LHT3z6LB7VvjxHb6",
        "iEvi3KStL2zm5HDRrTjO",
        "WMUubGhdaB0iakCbR9J8",
      ],
      "2": ["O5aN49VxKCi7yDneQ7aP", "6qynSYjIwiK8Y5XfnHti"],
    },
  },
  {
    documentId: "11-16-2025",
    timestamp: 1763276400000,
    schedule: {
      "1": [
        "O5aN49VxKCi7yDneQ7aP",
        "zUNPU84ndF3rU3zmsULZ",
        "WMUubGhdaB0iakCbR9J8",
      ],
      "2": ["O5aN49VxKCi7yDneQ7aP", "6qynSYjIwiK8Y5XfnHti"],
    },
  },
  {
    documentId: "11-23-2025",
    timestamp: 1763881200000,
    schedule: {
      "1": [
        "sn51LHT3z6LB7VvjxHb6",
        "7nuBxYPDskRA2HvKUS65",
        "iEvi3KStL2zm5HDRrTjO",
      ],
      "2": ["un0pagZN77SBvo3skRfU", "cLBbpJ5hgmocG7qcLMdH"],
    },
  },
  {
    documentId: "11-30-2025",
    timestamp: 1764566564904,
    schedule: {
      "1": [
        "O5aN49VxKCi7yDneQ7aP",
        "7nuBxYPDskRA2HvKUS65",
        "WMUubGhdaB0iakCbR9J8",
      ],
      "2": ["zUNPU84ndF3rU3zmsULZ", "cLBbpJ5hgmocG7qcLMdH"],
    },
  },
  {
    documentId: "12-7-2025",
    timestamp: 1765133940000,
    schedule: {
      "1": [
        "O7GrbqQ4W3gttT06tHKA",
        "O5aN49VxKCi7yDneQ7aP",
        "WMUubGhdaB0iakCbR9J8",
      ],
      "2": [
        "un0pagZN77SBvo3skRfU",
        "sn51LHT3z6LB7VvjxHb6",
        "cLBbpJ5hgmocG7qcLMdH",
      ],
    },
  },
  {
    documentId: "12-14-2025",
    timestamp: 1765775555598,
    schedule: {
      "1": [
        "6qynSYjIwiK8Y5XfnHti",
        "O5aN49VxKCi7yDneQ7aP",
        "7nuBxYPDskRA2HvKUS65",
      ],
      "2": [
        "cLBbpJ5hgmocG7qcLMdH",
        "O7GrbqQ4W3gttT06tHKA",
        "WMUubGhdaB0iakCbR9J8",
      ],
    },
  },
];

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not allowed", { status: 403 });
  }

  const { db } = await getFirebaseAdmin();
  const schedules = db.collection(FirestoreCollections.Schedules);

  for (const s of schedulesData) {
    const id = s.documentId!;
    delete s.documentId;

    try {
      await schedules.doc(id).set(s);
    } catch (e) {
      console.error("Error importing schedule", String(e));
    }
  }

  return new Response("Done");
}
