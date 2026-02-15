"use server";

import { Place } from "@/app/models/place";
import { LocationDetails, LocationDetailsSchema } from "@/app/models/user";

export async function getPlacePredictions(query: string): Promise<Place[]> {
  const endpoint = "https://places.googleapis.com/v1/places:autocomplete";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Goog-FieldMask":
        "suggestions.placePrediction.text.text,suggestions.placePrediction.placeId",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
    },
    body: JSON.stringify({
      input: query,
      includedRegionCodes: ["ca"],
    }),
  });

  const body = await response.json();
  if (!("suggestions" in body)) {
    throw new Error("Could not access Google Maps server.");
  }

  const suggestions: Place[] = [];
  for (const suggestion of body["suggestions"]) {
    const prediction = suggestion["placePrediction"];
    const id = prediction["placeId"];
    const text = prediction["text"]["text"];

    suggestions.push({ id: id, text: text });
  }

  return suggestions;
}

export async function getPlaceDetails(
  placeId: string,
): Promise<LocationDetails> {
  const endpoint = "https://places.googleapis.com/v1/places";

  const response = await fetch(`${endpoint}/${placeId}?regionCode=ca`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Goog-FieldMask": "location,googleMapsUri",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
    },
  });

  if (response.ok) {
    return LocationDetailsSchema.parse(await response.json());
  } else {
    throw new Error("Could not access Google Maps server.");
  }
}
