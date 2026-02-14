"use client";

import { Place } from "@/app/models/place";
import {
  LocationDetails,
  TransportUser,
  TransportUserSchema,
} from "@/app/models/user";
import { auth, db } from "@/app/utils/firebase_client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import {
  getPlaceDetails,
  getPlacePredictions,
} from "@/app/actions/google_maps";
import { MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import PopupForm from "@/app/ui/components/popup_form";
import SchemaForm from "@/app/ui/components/schema_form";
import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { Constants, toTimestamp } from "@/app/utils/util";

type PlaceWithDetails = Place & LocationDetails;

export default function AddressPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDetails | null>(
    null,
  );

  // Get user's address from database and search for it automatically
  // This is called only once (or once the user's settings are loaded)
  useEffect(() => {
    if (user && !defaultAddress) {
      const firestore = new FirestoreHelper(db);
      firestore
        .getDocument<TransportUser>(
          FirestoreCollections.Users,
          user.uid,
          TransportUserSchema,
        )
        .then((transportUser) => {
          if (transportUser?.address) {
            setDefaultAddress(transportUser.address);
            search(transportUser.address);
          }
        });
    }
  }, [user, defaultAddress]);

  // Wait for user's details to be loaded from firebase
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
    } else {
      router.replace("/login");
    }
  });

  // Avoid calling function back-to-back by using a debouncer
  // A debouncer creates a timer that resets every time it's called
  // Once the timer hits zero, the function is called
  const search = useDebouncedCallback(async (q: string) => {
    try {
      const places = await getPlacePredictions(q);
      setPlaces(places);
    } catch (e) {
      toast.error(
        "Failed to load locations. Ensure you're connected to the internet.",
      );
      console.error(e);
    }
  }, 400);

  async function submit(requestObj: object) {
    const transportRequest = requestObj as TransportRequest;
    transportRequest.timestamp = toTimestamp(new Date());
    if (selectedPlace == null) {
      return;
    }

    // Send user's details to database
    const firestore = new FirestoreHelper(db);
    try {
      const success = await Promise.all([
        firestore.addDocument(
          FirestoreCollections.Users,
          {
            address: selectedPlace.text,
            phone_number: user!.phoneNumber!,
            location_details: {
              googleMapsUri: selectedPlace.googleMapsUri,
              location: selectedPlace.location,
            },
          } as TransportUser,
          user!.uid,
          true, // Allow updating
        ),
        firestore.addDocument(
          FirestoreCollections.Requests,
          transportRequest,
          `${transportRequest.phone_number}-${new Date().toLocaleDateString("en-CA")}`,
          true,
        ),
      ]);
      if (success.every((b) => b == true)) {
        router.replace("/success");
      } else {
        toast.error("Failed to save your request. Please try again.");
        setSelectedPlace(null);
      }
    } catch (e) {
      // toast.error(String(e));
      console.error(e);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 items-start justify-start max-w-2xl w-full mx-4">
        {user ? (
          <>
            <div className="flex flex-col gap-1.5 w-full">
              <h2 className="text-lg font-semibold">
                {user.displayName ? (
                  <span>
                    Hey {user.displayName}, what's your pickup location?
                  </span>
                ) : (
                  <span>Enter Your Pickup Location</span>
                )}
              </h2>
              <input
                type="text"
                className="outline-0 placeholder-gray-500 w-full truncate font-bold text-4xl"
                placeholder={defaultAddress ?? "12950 50 Street NW"}
                onChange={(event) => {
                  const text = event.target.value.trim();
                  if (text.length > 0) {
                    search(text);
                  } else {
                    setPlaces([]);
                  }
                }}
              />
            </div>
            <ul className="w-full">
              {places.map((p) => (
                <li
                  key={p.id}
                  className="group cursor-pointer p-2 hover:bg-tertiary w-full flex flex-row items-center gap-1.5"
                  onClick={async (_) => {
                    try {
                      const details = await getPlaceDetails(p.id);
                      setSelectedPlace({
                        ...p,
                        ...details,
                      } as PlaceWithDetails);
                    } catch (e) {
                      toast.error(String(e));
                    }
                  }}
                >
                  <MapPinIcon width={24} height={24} className="shrink-0" />
                  <p className="text-lg truncate">{p.text}</p>
                  <ArrowRightIcon
                    className="ml-auto outline-none hidden group-hover:block"
                    width={24}
                    height={24}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>

      <PopupForm
        open={selectedPlace != null}
        onClose={() => setSelectedPlace(null)}
      >
        <SchemaForm
          schema={TransportRequestSchema}
          obj={
            {
              full_name: user?.displayName ?? "",
              phone_number: user?.phoneNumber!,
              service_number: 1,
              no_of_seats: 1,
              no_of_children: 0,
              address: selectedPlace?.text,
              google_maps_link: selectedPlace?.googleMapsUri,
              coordinates: selectedPlace?.location,
              timestamp: "",
              status: "normal",
            } as TransportRequest
          }
          readonlyColumns={["address", "phone_number"]}
          hiddenColumns={[
            "google_maps_link",
            "coordinates",
            "timestamp",
            "status",
          ]}
          suggestedValues={{
            service_number: Array.from({
              length: Constants.NUMBER_OF_SERVICES,
            }).map((v, i) => String(i + 1)),
            no_of_seats: Array.from({ length: 6 }).map((v, i) => String(i + 1)),
            no_of_children: Array.from({ length: 6 }).map((v, i) => String(i)),
          }}
          customLabels={{
            no_of_seats:
              "How many people need pick up (including children and infants)?",
            no_of_children:
              "How many are under 6 years old (and will require a car seat)?",
            service_number: "Which service would you like to go for?",
          }}
          onSubmitted={submit}
        />
      </PopupForm>
    </>
  );
}
