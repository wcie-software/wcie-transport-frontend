import { TransportRequest } from "@/app/models/request";
import { CheckCircleIcon, XCircleIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function PickedUpItem({ item }: { item: TransportRequest }) {
    return (
        <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-xl border border-gray-200 dark:border-white/10 p-4 flex items-center justify-between">
            <div className="flex flex-row gap-4 items-center">
                {item.status === "successful"
                    ? (
                        <div className="size-12 rounded-full bg-green-600/10 border border-green-600/30 flex items-center justify-center">
                            <CheckCircleIcon className="text-green-600" width={24} height={24} />
                        </div>
                    )
                    : (
                        <div className="size-12 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center">
                            <XCircleIcon className="text-red-600" width={24} height={24} />
                        </div>
                    )}
                <div>
                    <h4 className="font-bold text-foreground">{item.full_name}</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-mono">
                            {item.status === "successful" ? "Picked Up" : "Failed"}
                        </span>
                        {/* <span className="text-[10px] text-slate-600">•</span> */}
                        {/* <span className="text-[10px] text-slate-500 font-mono">08:1k5 AM</span> */}
                    </div>
                </div>
            </div>
            <div className="text-right flex flex-col gap-2 items-end">
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                    {item.status === "successful" ? "Verified" : "No Show"}
                </p>
                <div className="flex items-center gap-2">
                    <Link href={item.google_maps_link} target="_blank"
                        className="size-8 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 flex items-center justify-center active:scale-95 transition-transform"
                        title="Open in Google Maps">
                        <MapPinIcon className="text-slate-700 dark:text-slate-300" width={16} height={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
