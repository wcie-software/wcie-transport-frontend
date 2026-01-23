"use server";

import { Constants } from "@/app/utils/util";
import { getFirebaseAdmin } from "@/app/actions/firebase_server_setup";
import { Auth } from "firebase-admin/auth";
import { cookies } from "next/headers";

export enum LoginError {
  invalidToken,
  cookieCreationFailed,
}

interface VerificationResult {
  uid: string;
  role: "user" | "driver" | "admin";
}

/**
 * Decodes the idToken to get the custom claim for the user.
 * The custom claim we're interested in is "role".
 * 
 * `auth.verifyIdToken` also ensures that the id token is valid.
 * @param idToken JWT
 * @param auth Auth object of firebase app
 * @returns Returns the user's id and role, if successful, otherwise, null
 */
async function verifyToken(
  idToken: string,
  auth: Auth
): Promise<VerificationResult | null> {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return { uid: decodedToken.uid, role: decodedToken["role"] ?? "user" };
  } catch (e) {
    console.error("Invalid idToken or user needs to sign in again.\n" + e);
    return null;
  }
}

/**
 * Creates a session cookie for the user
 * @param idToken JWT
 * @param expiresIn Specifies how long a user's session is for in milliseconds
 * @returns Returns the user's and role
 */
export async function userLogin(
  idToken: string,
  expiresIn = 1000 * 60 * 60 * 24
): Promise<VerificationResult> {
  const { auth } = await getFirebaseAdmin();

  const result = await verifyToken(idToken, auth);
  if (!result) {
    console.error("Invalid idToken or user needs to sign in again.");
    throw LoginError.invalidToken;
  }

  try {
    await logout(); // Clear any previous sessions

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    (await cookies()).set(Constants.SESSION_COOKIE_KEY, sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true, // Can't be modified by JS
      secure: true,
      path: "/", // Allows the cookie to be used on all paths
      sameSite: "strict", // Cookie can only be sent by this site (i.e., internal use only)
    });

    console.log("Created session cookie");
    return result;
  } catch (e) {
    console.error("Bad idToken. Could not create cookie.");
    await logout(); // Cleanup
    throw LoginError.cookieCreationFailed;
  }
}

/**
 * Creates a longer session cookie for the admin, as well as, set an admin cookie flag.
 * If the user is not an admin, this function "fails"
 * @param idToken JWT
 * @returns Whether the user is an admin
 */
export async function adminLogin(idToken: string): Promise<boolean> {
  const expiresIn7Days = 1000 * 60 * 60 * 24 * 7;

  const { role } = await userLogin(idToken, expiresIn7Days);
  const isAdmin = role === "admin";

  if (isAdmin) {
    const c = await cookies();
    // Indicator that lets the middleware know that user is admin
    c.set(Constants.IS_ADMIN_COOKIE_KEY, "TRUE", {
      maxAge: expiresIn7Days / 1000,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
  } else {
    await logout(); // Cleanup
  }

  return isAdmin;
}

/**
 * Server logout by deleting all session cookies.
 */
export async function logout(): Promise<void> {
  const c = await cookies();

  c.delete(Constants.SESSION_COOKIE_KEY);
  c.delete(Constants.IS_ADMIN_COOKIE_KEY);
}

/**
 * Checks for session cookie and admin flag
 * @returns Whether user's current session is an admin one
 */
export async function isAdmin(): Promise<boolean> {
  const c = await cookies();

  return (
    c.has(Constants.SESSION_COOKIE_KEY) && c.get(Constants.IS_ADMIN_COOKIE_KEY)?.value == "TRUE"
  );
}
