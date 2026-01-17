import { CheckCircleIcon, ExclamationCircleIcon, MapIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/outline";
import PrimaryButton from "@/app/ui/components/primary_button";
import { TransportRequest } from "@/app/models/request";
import Link from "next/link";
import { NUMBER_SUFFIX } from "@/app/utils/constants";

export default function PickupItem({ pickup, active }: { pickup: TransportRequest, active: boolean }) {
    const color = active ? "primary" : "gray-500";
    return (
        <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className={`flex flex-row w-fit items-center gap-1 bg-${color}/20 px-2 py-0.5 rounded`}>
                            <span><UserIcon className={`text-${color}`} width={12} height={12} /></span>
                            <span className="text-slate-400 text-xs font-semibold">{pickup.no_of_seats}</span>
                        </div>
                        <h3 className="mt-1 text-xl font-bold">{pickup.full_name} ({pickup.service_number}{NUMBER_SUFFIX[pickup.service_number]} service)</h3>
                    </div>
                    <Link href={active ? `tel:${pickup.phone_number}` : "#"} className={`bg-${color} size-10 flex items-center justify-center text-white rounded-full active:scale-95 transition-transform shadow-lg shadow-primary/20`}>
                        <PhoneIcon width={20} height={20} />
                    </Link>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                    <MapPinIcon className={`text-${color}`} width={24} height={24} />
                    <p className="text-sm leading-snug">{pickup.address}</p>
                </div>
                {active &&
                    <div className="w-full h-24 bg-center bg-cover rounded-lg border border-white/10" style={{ backgroundImage: "url(/map.png)" }}>
                        <Link className="w-full h-full bg-black/30 flex items-center justify-center" href={pickup.google_maps_link}>
                            <span className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                                <span> <MapIcon width={24} height={24} /> </span> Open Maps
                            </span>
                        </Link>
                    </div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <PrimaryButton disabled={!active}>
                        <span className="flex flex-row gap-2">
                            <CheckCircleIcon width={24} height={24} />
                            Confirm Pickup
                        </span>
                    </PrimaryButton>
                    <PrimaryButton outline disabled={!active}>
                        <span className="flex flex-row gap-2">
                            <ExclamationCircleIcon width={24} height={24} />
                            Failed to Pickup
                        </span>
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}