"use server";

import fs from 'fs';
import path from 'path';
import * as csv from '@fast-csv/parse';
import * as z from 'zod';

import { Driver, DriverSchema } from '@/app/models/driver';
import { DriverRoutes, DriverRoutesSchema } from '@/app/models/fleet_route';
import { TransportRequest, TransportRequestSchema } from '@/app/models/request';
import { Schedule, ScheduleSchema } from '@/app/models/schedule';
import { Vehicle, VehicleSchema } from '@/app/models/vehicle';
import { getFirebaseAdmin } from './firebase_setup/server';
import { FirestoreCollections } from '@/app/utils/firestore';
import { revalidatePath } from 'next/cache';

const DATA_DIR = path.join(process.cwd(), 'src/test/data');

/**
 * Parses a string containing a Python-style dictionary (e.g., "{'a': 1, 'b': True}")
 * into a valid JavaScript object.
 *
 * @param str - The Python-style dictionary string to parse.
 * @returns The parsed object, or null/undefined if parsing fails.
 */
function parsePythonJson(str: string): any {
    if (!str) return undefined;
    // Replace single quotes generally with double quotes
    // NOTE: This simple regex replacement assumes keys and string values don't contain escaped quotes or commas that break JSON.
    // For the specific dataset (coordinates, schedules), this should be sufficient.
    let jsonStr = str.replace(/'/g, '"');

    // Replace Python booleans/None
    jsonStr = jsonStr.replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null');

    try {
        return JSON.parse(jsonStr);
    } catch (error) {
        console.warn(`Failed to parse python-style JSON: ${str}`, error);
        return null;
    }
}

/**
 * Generic helper to read a CSV file and map valid rows to a specific Zod schema.
 *
 * @template T - The type of the model (inferred from schema).
 * @param fileName - The filename in `src/test/data`.
 * @param schema - The Zod schema to validate each row against.
 * @param transform - Optional callback to modify the raw CSV row (Record<string, string>) suitable for the schema.
 * @returns A promise resolving to an array of valid model objects.
 */
async function importCsvFile<T>(
    fileName: string,
    schema: z.ZodType<T>,
    transform: (row: any) => any = (r) => r
): Promise<T[]> {
    const filePath = path.join(DATA_DIR, fileName);
    const results: T[] = [];

    const parser = fs
        .createReadStream(filePath)
        .pipe(csv.parse({ headers: true }));

    for await (const row of parser) {
        try {
            const transformedRow = transform(row);
            // Parse using Zod to validate and coerce types
            const parsed = schema.parse(transformedRow);
            results.push(parsed);
        } catch (err) {
            console.error(`Validation error in ${fileName} for row:`, row, err);
            // We assume we want to skip invalid rows locally rather than crashing the whole process
        }
    }

    return results;
}

/**
 * Imports drivers from the test CSV data (drivers.csv).
 * Parses the 'location' field from a python-style JSON string.
 * @returns Array of Driver objects
 */
async function getDrivers(): Promise<Driver[]> {
    return importCsvFile('drivers.csv', DriverSchema, (row) => ({
        ...row,
        location: row.location ? parsePythonJson(row.location) : undefined,
    }));
}

/**
 * Imports transport requests from the test CSV data (requests.csv).
 * Parses the 'coordinates' field from a python-style JSON string.
 * @returns Array of TransportRequest objects
 */
async function getRequests(): Promise<TransportRequest[]> {
    return importCsvFile('requests.csv', TransportRequestSchema, (row) => ({
        ...row,
        coordinates: row.coordinates ? parsePythonJson(row.coordinates) : undefined,
        status: row.status ? row.status : "normal",
    } as TransportRequest));
}

/**
 * Imports schedules from the test CSV data (schedules.csv).
 * Parses the 'schedule' JSON object and converts 'timestamp' to a number.
 * @returns Array of Schedule objects
 */
async function getSchedules(): Promise<Schedule[]> {
    return importCsvFile('schedules.csv', ScheduleSchema, (row) => ({
        ...row,
        // Schema expects timestamp as number. 
        timestamp: row.timestamp ? Number(row.timestamp) : undefined,
        schedule: row.schedule ? parsePythonJson(row.schedule) : {},
    }));
}

/**
 * Imports vehicles from the test CSV data (vehicles.csv).
 * Handles conversion of optional numeric fields from empty strings to undefined.
 * @returns Array of Vehicle objects
 */
async function getVehicles(): Promise<Vehicle[]> {
    return importCsvFile('vehicles.csv', VehicleSchema, (row) => {
        // Helper to undefine empty strings so Zod treats them as optional/undefined
        const emptyToUndefined = (val: any) => (val === '' ? undefined : val);

        return {
            ...row,
            fuel_cost: emptyToUndefined(row.fuel_cost),
            maintenance_receipt_amount: emptyToUndefined(row.maintenance_receipt_amount),
            last_fuel_date: emptyToUndefined(row.last_fuel_date),
            last_maintenance_date: emptyToUndefined(row.last_maintenance_date),
            maintenance_type: emptyToUndefined(row.maintenance_type),
            // 'active' is handled effectively by the schema transform if it expects "True"/"False" strings
        };
    });
}

/**
 * Imports assigned routes from the test CSV data (assigned-routes.csv).
 * Parses the 'routes' JSON object.
 * @returns Array of DriverRoutes objects
 */
async function getAssignedRoutes(): Promise<DriverRoutes[]> {
    return importCsvFile('assigned-routes.csv', DriverRoutesSchema, (row) => ({
        ...row,
        routes: row.routes ? parsePythonJson(row.routes) : [],
    }));
}

async function createDriverAccount(driver: Driver) {
    const { auth } = await getFirebaseAdmin();

    try {
        const d = await auth.createUser({
            uid: driver.documentId,
            email: driver.email,
            phoneNumber: driver.phone_number,
            emailVerified: true,
            displayName: driver.full_name,
        });
        await auth.setCustomUserClaims(d.uid, { role: "driver" });
    } catch (e) {
        console.error("import_test_data.ts: Unable to create driver account for " + driver.full_name);
    }
}

/**
 * Creates a test admin account and adds it to the Admin collection in Firestore.
 * The function avoids creating multiple accounts by first checking if the Admin
 * collection is empty
 */
export async function createTestAdminAccount() {
    if (process.env.NODE_ENV !== "development") {
        return;
    }

    const { db, auth } = await getFirebaseAdmin();

    const admins = db.collection(FirestoreCollections.Admins);
    if ((await admins.get()).empty) {
        const admin = await auth.createUser({
            displayName: "Master Tester",
            email: "test@wcie.app",
            emailVerified: true,
        });
        await auth.setCustomUserClaims(admin.uid, { role: "admin" });

        admins.doc(admin.uid).set({ "email": admin.email });
    }
}

/**
 * Imports all test data (Drivers, Requests, Schedules, Vehicles) into Firestore.
 * This function reads from the local CSV files, parses them, and uploads them
 * to their respective Firestore collections using batch writes for efficiency.
 * Uploads are performed in parallel.
 */
export async function importTestData() {
    if (process.env.NODE_ENV !== "development") {
        return;
    }

    const { db } = await getFirebaseAdmin();

    const drivers = await getDrivers();
    const requests = await getRequests();
    const schedules = await getSchedules();
    const vehicles = await getVehicles();
    const assignments = await getAssignedRoutes();

    const uploadBatch = async <T extends { documentId?: string }>(
        collectionName: FirestoreCollections,
        items: T[]
    ) => {
        if (items.length === 0) return;

        const batch = db.batch();
        items.forEach((item) => {
            const data = { ...item };
            const ref = db.collection(collectionName).doc(data.documentId!);
            delete data.documentId;

            batch.set(ref, data);
        });

        await batch.commit();
        console.log(`Imported ${items.length} items into ${collectionName}`);
    };

    await Promise.all([
        uploadBatch(FirestoreCollections.Drivers, drivers),
        uploadBatch(FirestoreCollections.Requests, requests),
        uploadBatch(FirestoreCollections.Schedules, schedules),
        uploadBatch(FirestoreCollections.Vehicles, vehicles),
        uploadBatch(FirestoreCollections.Assignments, assignments),
    ]);

    revalidatePath("/admin");

    // Create accounts for each driver
    await Promise.all(drivers.map(d => createDriverAccount(d)));
}
