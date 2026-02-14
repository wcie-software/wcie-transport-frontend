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
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { TransportRequest } from "@/app/models/request";
import { toTimestamp } from "@/app/utils/util";
import LocationInputSection from "@/app/(user)/request/components/location_input_section";
import PlaceResultsList from "@/app/(user)/request/components/place_results_list";
import RequestDetailsModal from "@/app/(user)/request/components/request_details_modal";

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
      toast.error(`Error: '${e}'. Please try again.`);
      // console.error(e);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 items-start justify-start max-w-2xl w-full mx-4">
        {user ? (
          <>
            <LocationInputSection
              user={user}
              defaultAddress={defaultAddress}
              onInputChange={(value) => {
                const text = value.trim();
                if (text.length > 0) {
                  search(text);
                } else {
                  setPlaces([]);
                }
              }}
            />
            <PlaceResultsList
              places={places}
              onSelectPlace={async (p) => {
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
            />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>

      <RequestDetailsModal
        open={selectedPlace != null}
        onClose={() => setSelectedPlace(null)}
        user={user}
        selectedPlace={selectedPlace}
        onSubmitted={submit}
      />
    </>
  );
}
