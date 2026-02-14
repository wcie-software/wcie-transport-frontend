import { Place } from "@/app/models/place";
import { MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

type PlaceResultsListProps = {
  places: Place[];
  onSelectPlace: (place: Place) => void | Promise<void>;
};

export default function PlaceResultsList({
  places,
  onSelectPlace,
}: PlaceResultsListProps) {
  return (
    <ul className="w-full">
      {places.map((p) => (
        <li
          key={p.id}
          className="group cursor-pointer p-2 hover:bg-tertiary w-full flex flex-row items-center gap-1.5"
          onClick={async () => {
            await onSelectPlace(p);
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
  );
}
