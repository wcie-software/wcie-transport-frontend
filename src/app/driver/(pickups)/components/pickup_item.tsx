import { CheckCircleIcon, ExclamationCircleIcon, MapIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/outline";
import PrimaryButton from "@/app/ui/components/primary_button";
import { TransportRequest } from "@/app/models/request";
import Link from "next/link";

export default function PickupItem({ pickup }: { pickup: TransportRequest }) {
    return (
        <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Seats</span>
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{pickup.no_of_seats}</span>
                        </div>
                        <h3 className="text-xl font-bold">{pickup.full_name}</h3>
                    </div>
                    <Link href={`tel:${pickup.phone_number}`} className="size-10 flex items-center justify-center bg-primary text-white rounded-full active:scale-95 transition-transform shadow-lg shadow-primary/20">
                        <PhoneIcon width={20} height={20} />
                    </Link>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                    <MapPinIcon className="text-primary" width={24} height={24} />
                    <p className="text-sm leading-snug">{pickup.address}</p>
                </div>
                <div className="w-full h-24 bg-center bg-cover rounded-lg border border-white/10" style={{ backgroundImage: "url(/map.png)" }}>
                    <Link className="w-full h-full bg-black/30 flex items-center justify-center" href={pickup.google_maps_link}>
                        <span className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                            <span> <MapIcon width={24} height={24} /> </span> Open Maps
                        </span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <PrimaryButton>
                        <span className="flex flex-row gap-2">
                            <CheckCircleIcon width={24} height={24} />
                            Confirm Pickup
                        </span>
                    </PrimaryButton>
                    <PrimaryButton outline>
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