"use server";

import { SESSION_COOKIE_KEY, IS_ADMIN_COOKIE_KEY } from "@/app/utils/constants";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
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
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });
    (await cookies()).set(SESSION_COOKIE_KEY, sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
    });

    console.log("Created session cookie");
    return result;
  } catch (e) {
    console.error("Bad idToken. Could not create cookie.");
    throw LoginError.cookieCreationFailed;
  }
}

export async function adminLogin(idToken: string): Promise<boolean> {
  const expiresIn7Days = 1000 * 60 * 60 * 24 * 7;

  const { role } = await userLogin(idToken, expiresIn7Days);
  const isAdmin = role === "admin";

  if (isAdmin) {
    const c = await cookies();
    // Indicator that lets the middleware know that user is admin
    c.set(IS_ADMIN_COOKIE_KEY, "TRUE", {
      maxAge: expiresIn7Days / 1000,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
  }

  return isAdmin;
}

export async function logout(): Promise<void> {
  const c = await cookies();

  c.delete(SESSION_COOKIE_KEY);
  c.delete(IS_ADMIN_COOKIE_KEY);
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();

  return (
    c.has(SESSION_COOKIE_KEY) && c.get(IS_ADMIN_COOKIE_KEY)?.value == "TRUE"
  );
}
