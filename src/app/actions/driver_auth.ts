"use server";

import { Driver } from "@/app/models/driver";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { FirebaseAuthError, UserRecord } from "firebase-admin/auth";

/**
 * Create a driver account
 *
 * @param {Driver} driver
 * @returns {string} UID of new driver account
 */
export async function createDriverAccount(driver: Driver): Promise<string> {
  const { auth } = await getFirebaseAdmin();

  let d: UserRecord | null = null;
  try {
    d = await auth.createUser({
      displayName: driver.full_name,
      email: driver.email,
      emailVerified: true,
      phoneNumber: driver.phone_number,
      uid: driver.documentId,
    });
  } catch (e) {
    if (e instanceof FirebaseAuthError) {
      if (e.code === "auth/phone-number-already-exists") {
        d = await auth.getUserByPhoneNumber(driver.phone_number);
      } else if (e.code === "auth/email-already-exists") {
        d = await auth.getUserByEmail(driver.email);
      }
    }
  }

  if (d) {
    await auth.setCustomUserClaims(d.uid, { role: "driver" });
    return d.uid;
  } else {
    throw new Error(
      "Unable to create driver's account. Please check your network.",
    );
  }
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
