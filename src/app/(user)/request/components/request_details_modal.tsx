import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import { LocationDetails } from "@/app/models/user";
import { Constants } from "@/app/utils/util";
import PopupForm from "@/app/ui/components/popup_form";
import SchemaForm from "@/app/ui/components/schema_form";
import { User } from "firebase/auth";

type SelectedPlace = {
  text: string;
} & LocationDetails;

type RequestDetailsModalProps = {
  open: boolean;
  user: User | null;
  selectedPlace: SelectedPlace | null;
  onClose: () => void;
  onSubmitted: (requestObj: object) => Promise<void>;
};

export default function RequestDetailsModal({
  open,
  user,
  selectedPlace,
  onClose,
  onSubmitted,
}: RequestDetailsModalProps) {
  return (
    <PopupForm open={open} onClose={onClose}>
      <SchemaForm
        schema={TransportRequestSchema}
        obj={
          {
            full_name: user?.displayName ?? "",
            phone_number: user?.phoneNumber!,
            userId: user?.uid,
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
          "userId",
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
        onSubmitted={onSubmitted}
      />
    </PopupForm>
  );
}
