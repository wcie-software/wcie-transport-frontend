"use server";

import { getFirebaseAdmin } from "./firebase_server_setup";

export async function updateUsername(uid: string, username: string) {
  const { auth } = await getFirebaseAdmin();

  try {
    auth.updateUser(uid, {
      displayName: username,
    });
  } catch (e) {
    console.warn(
      `[actions/update_username.ts] Unable to update user '${uid}''s name.`,
    );
  }
}
