"use server";

interface RouteResponse {
  title: "Success" | "Error";
  message: string;
}

export async function generateRoutes(
  timestamp: string,
  idToken: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(
    "https://find-optimal-routes-dsplgp4a2a-uc.a.run.app",
    {
      method: "POST",
      body: JSON.stringify({ timestamp: timestamp }),
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": idToken,
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
