import { User } from "firebase/auth";

type LocationInputSectionProps = {
  user: User;
  defaultAddress: string | null;
  onInputChange: (value: string) => void;
};

export default function LocationInputSection({
  user,
  defaultAddress,
  onInputChange,
}: LocationInputSectionProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <h2 className="text-lg font-semibold">
        {user.displayName ? (
          <span>Hey {user.displayName}, what's your pickup location?</span>
        ) : (
          <span>Enter Your Pickup Location</span>
        )}
      </h2>
      <input
        type="text"
        className="outline-0 placeholder-gray-500 w-full truncate font-bold text-4xl"
        placeholder={defaultAddress ?? "12950 50 Street NW"}
        onChange={(event) => onInputChange(event.target.value)}
      />
    </div>
  );
}
