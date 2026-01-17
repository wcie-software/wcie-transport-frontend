"use server";

import { Driver } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirebaseAuthError } from "firebase-admin/auth";

/**
 * Create a driver account
 * 
 * @param {Driver} driver 
 * @returns {string} UID of new driver account
 */
export async function createDriverAccount(driver: Driver): Promise<string> {
    const { auth } = await getFirebaseAdmin();

    const d = await auth.createUser({
        displayName: driver.full_name,
        email: driver.email,
        emailVerified: true,
        phoneNumber: driver.phone_number,
        uid: driver.documentId
    });
    await auth.setCustomUserClaims(d.uid, { role: "driver" });

    return d.uid;
}

/**
 * Updates driver account. It assumes that the db documentId is the same
 * as the driver's uid. If that's not the case, the function creates
 * a new driver account
 * 
 * @param {Driver} driver 
 */
export async function updateDriverAccount(driver: Driver) {
    const { auth } = await getFirebaseAdmin();

    try {
        await auth.updateUser(driver.documentId!, {
            displayName: driver.full_name,
            email: driver.email,
            phoneNumber: driver.phone_number,
        });
    } catch (e) {
        if (e instanceof FirebaseAuthError && e.code === "auth/user-not-found") {
            await createDriverAccount(driver);
            // Try again
            updateDriverAccount(driver);
        } else {
            throw e; // Rethrow error
        }
    }
}
