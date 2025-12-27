"use server";

import { SESSION_COOKIE_KEY, IS_ADMIN_COOKIE_KEY } from "@/app/utils/constants";
import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { Auth } from "firebase-admin/auth";
import { Firestore } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export enum LoginError {
  invalidToken,
  cookieCreationFailed,
}

async function verifyToken(
  idToken: string,
  auth: Auth
): Promise<string | null> {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (e) {
    console.error("Invalid idToken or user needs to sign in again.\n" + e);
    return null;
  }
}

async function checkIfAdmin(uid: string, db: Firestore): Promise<boolean> {
  const doc = db.collection(FirestoreCollections.Admins).doc(uid);
  const ref = await doc.get();

  return ref.exists;
}

export async function userLogin(
  idToken: string,
  expiresIn = 1000 * 60 * 60 * 24
): Promise<string> {
  const { auth } = await getFirebaseAdmin();

  const uid = await verifyToken(idToken, auth);
  if (!uid) {
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
      sameSite: "lax",
    });

    console.log("Created session cookie");
    return uid;
  } catch (e) {
    console.error("Bad idToken. Could not create cookie.");
    throw LoginError.cookieCreationFailed;
  }
}

export async function adminLogin(idToken: string): Promise<boolean> {
  const expiresIn7Days = 1000 * 60 * 60 * 24 * 7;
  const { db } = await getFirebaseAdmin();

  const uid = await userLogin(idToken, expiresIn7Days);
  const isAdmin = await checkIfAdmin(uid, db);

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
