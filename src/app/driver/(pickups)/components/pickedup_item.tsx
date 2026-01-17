import { TransportRequest } from "@/app/models/request";
import { ChevronRightIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export function PickedUpItem({ item }: { item: TransportRequest }) {
    return (
        <div className="bg-card-dark/40 rounded-xl border border-white/5 p-4 flex items-center justify-between opacity-80">
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
                    <h4 className="font-bold text-slate-200">{item.full_name}</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                            {item.status === "successful" ? "Picked Up" : "Failed"}
                        </span>
                        {/* <span className="text-[10px] text-slate-600">•</span> */}
                        {/* <span className="text-[10px] text-slate-500 font-mono">08:1k5 AM</span> */}
                    </div>
                </div>
            </div>
            <div className="text-right flex flex-col gap-2 items-end">
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                    {item.status === "successful" ? "Verified" : "No Show"}
                </p>
                <ChevronRightIcon className="text-tertiary" width={24} height={24} />
            </div>
        </div>
    );
}