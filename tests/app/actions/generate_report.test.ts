import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ZodType } from "zod";
import { generateReports } from "@/app/actions/generate_report";
import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { PickupInfo, PickupInfoSchema } from "@/app/models/pickup_info";
import { FirestoreCollections } from "@/app/utils/firestore";

const mocks = vi.hoisted(() => ({
  getFirebaseAdmin: vi.fn(),
  queryCollection: vi.fn(),
}));

vi.mock("@/app/actions/firebase_server_setup", () => ({
  getFirebaseAdmin: mocks.getFirebaseAdmin,
}));
vi.mock("@/app/utils/firestore_admin", () => ({
  FirestoreAdminHelper: class {
    queryCollection = mocks.queryCollection;
  },
}));

function request(overrides: Partial<TransportRequest> = {}): TransportRequest {
  return TransportRequestSchema.parse({
    documentId: "request-1",
    full_name: "Test Passenger",
    phone_number: "+17805551234",
    address: "Test address",
    google_maps_link: "https://maps.google.com/",
    coordinates: { latitude: 53.5, longitude: -113.5 },
    service_number: 1,
    no_of_seats: 4,
    no_of_children: 1,
    timestamp: "2026/02/07 12:00:00",
    status: "normal",
    ...overrides,
  });
}

function pickup(overrides: Partial<PickupInfo> = {}): PickupInfo {
  return PickupInfoSchema.parse({
    documentId: "pickup-1",
    transport_id: "request-1",
    user_phone_number: "+17805551234",
    pickup_time: "2026/02/08",
    passengers_picked: 2,
    failure_reason: null,
    ...overrides,
  });
}

// A small in-memory query double exercises the action's actual filters without
// Firebase credentials or production reads. Validate fixture rows like the helper.
function seed(requests: TransportRequest[] = [], pickups: PickupInfo[] = []) {
  mocks.queryCollection.mockImplementation(async (
    collection: FirestoreCollections,
    schema: ZodType,
    clauses: { field: string; operator: string; value: string | string[] }[],
  ) => {
    const rows = collection === FirestoreCollections.Requests ? requests : pickups;
    return rows.filter((row) => clauses.every(({ field, operator, value }) => {
      const actual = (row as unknown as Record<string, string>)[field];
      if (operator === "in") return (value as string[]).includes(actual);
      if (operator === ">=") return actual >= value;
      if (operator === "<") return actual < value;
      throw new Error(`Unexpected operator: ${operator}`);
    })).map((row) => schema.parse(row));
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getFirebaseAdmin.mockResolvedValue({ db: {} });
  seed();
});

describe("generateReports service dates", () => {
  test("a single Sunday keeps its selected key and preceding submission window", async () => {
    seed([request()]);
    const result = await generateReports("2-8-2026", "2-8-2026");
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0]).toMatchObject({ sundayKey: "2-8-2026", totalRequests: 1 });
    expect(mocks.queryCollection).toHaveBeenCalledWith(
      FirestoreCollections.Requests,
      TransportRequestSchema,
      [
        { field: "timestamp", operator: ">=", value: "2026/02/01" },
        { field: "timestamp", operator: "<", value: "2026/02/08" },
      ],
      "timestamp",
    );
  });

  test("adjacent Sundays have disjoint windows and Sunday submissions roll forward", async () => {
    seed([
      request({ documentId: "before-window", timestamp: "2026/01/31 23:59:59" }),
      request({ documentId: "window-start", timestamp: "2026/02/01 00:00:00" }),
      request({ documentId: "saturday", timestamp: "2026/02/07 23:59:59" }),
      request({ documentId: "sunday", timestamp: "2026/02/08 00:00:00" }),
      request({ documentId: "after-window", timestamp: "2026/02/15 00:00:00" }),
    ]);
    const result = await generateReports("2-8-2026", "2-15-2026");
    expect(result.data?.map(({ sundayKey, totalRequests }) => ({ sundayKey, totalRequests })))
      .toEqual([
        { sundayKey: "2-8-2026", totalRequests: 2 },
        { sundayKey: "2-15-2026", totalRequests: 1 },
      ]);
  });

  test.each([
    ["3-1-2026", "3-22-2026", ["3-1-2026", "3-8-2026", "3-15-2026", "3-22-2026"]],
    ["10-25-2026", "11-8-2026", ["10-25-2026", "11-1-2026", "11-8-2026"]],
    ["12-28-2025", "1-11-2026", ["12-28-2025", "1-4-2026", "1-11-2026"]],
  ])("iterates inclusive Sundays from %s to %s", async (start, end, keys) => {
    const result = await generateReports(start, end);
    expect(result.data?.map((r) => r.sundayKey)).toEqual(keys);
    expect(result.data?.every((r) => r.totalRequests === 0 && r.pickupRate === 0)).toBe(true);
  });

  test.each([
    ["not-a-date", "2-8-2026"],
    ["2-30-2026", "3-8-2026"],
    ["2-9-2026", "2-15-2026"],
    ["2-8-2026", "2-10-2026"],
    ["2-15-2026", "2-8-2026"],
  ])("rejects invalid range %s — %s before accessing Firestore", async (start, end) => {
    expect(await generateReports(start, end)).toMatchObject({ success: false, message: expect.any(String) });
    expect(mocks.getFirebaseAdmin).not.toHaveBeenCalled();
  });
});

describe("generateReports counts and pickup enrichment", () => {
  test("status buckets match requests and exclude cancelled passengers", async () => {
    seed([
      request({ documentId: "successful-1", status: "successful" }),
      request({ documentId: "successful-2", status: "successful", service_number: 2 }),
      request({ documentId: "failed", status: "failed" }),
      request({ documentId: "cancelled", status: "cancelled" }),
      request({ documentId: "pending", status: "normal" }),
    ]);
    const result = await generateReports("2-8-2026", "2-8-2026");
    expect(result.data![0]).toEqual({
      sundayKey: "2-8-2026", totalRequests: 5, adults: 15, children: 5,
      picked: 2, notPicked: 1, pending: 1, cancelled: 1,
      firstService: 1, secondService: 1, pickupRate: 0.4,
      totalPassengersPicked: 8,
    });
  });

  test.each(["2026/02/08", "2026/02/09", "2026/02/07"])(
    "uses actual passengers confirmed on %s instead of requested seats", async (pickup_time) => {
      seed([request({ status: "successful" })], [pickup({ pickup_time })]);
      const result = await generateReports("2-8-2026", "2-8-2026");
      expect(result.data![0].totalPassengersPicked).toBe(2);
      expect(mocks.queryCollection).toHaveBeenCalledWith(
        FirestoreCollections.PickupInfo, PickupInfoSchema,
        [{ field: "transport_id", operator: "in", value: ["request-1"] }],
      );
    },
  );

  test("ignores unrelated and failed confirmations; missing pickups fall back to seats", async () => {
    seed([request({ status: "successful" })], [
      pickup({ transport_id: "unrelated", passengers_picked: 100 }),
      pickup({ failure_reason: "Not found", passengers_picked: 0 }),
    ]);
    const result = await generateReports("2-8-2026", "2-8-2026");
    expect(result.data![0].totalPassengersPicked).toBe(4);
  });

  test("preserves a recorded zero instead of falling back to seats", async () => {
    seed([request({ status: "successful" })], [pickup({ passengers_picked: 0 })]);
    expect((await generateReports("2-8-2026", "2-8-2026")).data![0].totalPassengersPicked).toBe(0);
  });

  test("uses the latest successful confirmation once when duplicates exist", async () => {
    seed([request({ status: "successful" })], [
      pickup({ pickup_time: "2026/02/08", passengers_picked: 1 }),
      pickup({ pickup_time: "2026/02/10", passengers_picked: 0, failure_reason: "No show" }),
      pickup({ pickup_time: "2026/02/09", passengers_picked: 3 }),
    ]);
    expect((await generateReports("2-8-2026", "2-8-2026")).data![0].totalPassengersPicked).toBe(3);
  });

  test("batches pickup joins within Firestore's 30-value limit", async () => {
    const requests = Array.from({ length: 65 }, (_, i) =>
      request({ documentId: `request-${i}`, status: "successful" }),
    );
    seed(requests, requests.map((r) => pickup({ transport_id: r.documentId! })));
    const result = await generateReports("2-8-2026", "2-8-2026");
    const pickupQueries = mocks.queryCollection.mock.calls.filter(([collection]) =>
      collection === FirestoreCollections.PickupInfo,
    );
    expect(pickupQueries.map(([, , clauses]) => clauses[0].value.length)).toEqual([30, 30, 5]);
    expect(result.data![0].totalPassengersPicked).toBe(130);
  });

  test("does not query pickups when no requests succeeded", async () => {
    seed([request()]);
    await generateReports("2-8-2026", "2-8-2026");
    expect(mocks.queryCollection).toHaveBeenCalledTimes(1);
  });

  test("falls back to seats for a legacy successful request without an ID", async () => {
    seed([request({ documentId: undefined, status: "successful" })]);
    expect((await generateReports("2-8-2026", "2-8-2026")).data![0].totalPassengersPicked).toBe(4);
    expect(mocks.queryCollection).toHaveBeenCalledTimes(1);
  });

  test("returns a user-facing error when Firestore fails", async () => {
    const error = new Error("Firestore unavailable");
    mocks.queryCollection.mockRejectedValue(error);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(await generateReports("2-8-2026", "2-8-2026")).toEqual({
        success: false, message: "Failed to generate reports. Please try again.",
      });
      expect(log).toHaveBeenCalledWith("generate_report.ts ERROR:", error);
    } finally {
      log.mockRestore();
    }
  });
});
