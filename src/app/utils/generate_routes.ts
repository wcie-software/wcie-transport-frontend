"use server";

import { cookies } from "next/headers";
import { ADMIN_ID_TOKEN_COOKIE_KEY } from "./constants";

interface RouteResponse {
  title: "Success" | "Error";
  message: string;
}

export async function generateRoutes(
  timestamp: string
): Promise<{ success: boolean; message?: string }> {
  const idToken = (await cookies()).get(ADMIN_ID_TOKEN_COOKIE_KEY);
  if (!idToken) {
    return { success: false, message: "Please refresh the page and re-login." };
  }

  const res = await fetch(
    "https://find-optimal-routes-dsplgp4a2a-uc.a.run.app",
    {
      method: "POST",
      body: JSON.stringify({ timestamp: timestamp }),
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": idToken.value,
      },
    }
  );

  try {
    const routeResponse = (await res.json()) as RouteResponse;
    if (res.ok && routeResponse.title === "Success") {
      return { success: true };
    } else {
      return {
        success: false,
        message: "Failed to generate routes: " + routeResponse.message,
      };
    }
  } catch (e) {
    console.error(`generate_route.ts ERROR: ${e}`);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later",
    };
  }
}
