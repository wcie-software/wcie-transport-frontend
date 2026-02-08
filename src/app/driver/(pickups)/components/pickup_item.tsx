"use client";

import { BellAlertIcon, BellIcon, ChatBubbleLeftIcon, CheckCircleIcon, ExclamationCircleIcon, MapIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/outline";
import PrimaryButton from "@/app/ui/components/primary_button";
import { TransportRequest } from "@/app/models/request";
import Link from "next/link";
import { Constants, defaultFormatter } from "@/app/utils/util";
import { useState } from "react";
import PopupForm from "@/app/ui/components/popup_form";
import SchemaForm from "@/app/ui/components/schema_form";
import { PickupInfo, PickupInfoSchema } from "@/app/models/pickup_info";

export default function PickupItem({ pickup, active = false, onPickupSuccessful, onPickupFailed }:
    { pickup: TransportRequest, active: boolean, onPickupSuccessful?: (info: PickupInfo) => void, onPickupFailed?: (info: PickupInfo) => void }
) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<"successful" | "failed">("successful");

    const color = active ? "primary" : "tertiary";

    function handleConfirmed(info: object) {
        setIsModalOpen(false);
        const pickupInfo = info as PickupInfo;
        if (status === "successful") {
            onPickupSuccessful?.(pickupInfo);
        } else {
            onPickupFailed?.(pickupInfo);
        }
    }

    return (
        <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className={`flex flex-row w-fit items-center gap-1 bg-${color}/20 px-2 py-0.5 rounded`}>
                            <span><UserIcon className={`text-${color}`} width={12} height={12} /></span>
                            <span className="text-foreground text-xs font-semibold">{pickup.no_of_seats}</span>
                        </div>
                        <h3 className="mt-1 text-xl font-bold">{pickup.full_name} ({pickup.service_number}{Constants.NUMBER_SUFFIX[pickup.service_number]} service)</h3>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                        {/* <Link href={active ? `tel:${pickup.phone_number}` : ""} className={`border border-${color} size-10 flex items-center justify-center text-white rounded-full active:scale-95 transition-transform shadow-lg shadow-primary/20`}>
                            <BellAlertIcon width={20} height={20} />
                        </Link> */}
                        <Link href={active ? `tel:${pickup.phone_number}` : ""} className={`bg-${color} size-10 flex items-center justify-center text-white rounded-full active:scale-95 transition-transform shadow-lg shadow-primary/20`}>
                            <PhoneIcon width={20} height={20} />
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-foreground">
                    <MapPinIcon className={`text-${color}`} width={24} height={24} />
                    <p className="text-sm leading-snug">{pickup.address}</p>
                </div>
                {active &&
                    <div className="w-full h-24 bg-center bg-cover rounded-lg border border-white/10" style={{ backgroundImage: "url(/map.png)" }}>
                        <Link target="_blank" className="w-full h-full bg-black/30 flex items-center justify-center" href={pickup.google_maps_link}>
                            <span className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10 text-white">
                                <span> <MapIcon width={24} height={24} /> </span> Open Maps
                            </span>
                        </Link>
                    </div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <PrimaryButton disabled={!active} onClick={() => { setStatus("successful"); setIsModalOpen(true); }}>
                        <span className="flex flex-row gap-2">
                            <CheckCircleIcon width={24} height={24} />
                            Confirm Pickup
                        </span>
                    </PrimaryButton>
                    <PrimaryButton outline disabled={!active} onClick={() => { setStatus("failed"); setIsModalOpen(true); }}>
                        <span className="flex flex-row gap-2">
                            <ExclamationCircleIcon width={24} height={24} />
                            Failed to Pickup
                        </span>
                    </PrimaryButton>
                </div>
            </div>

            <PopupForm
                open={isModalOpen}
                title={status === "successful" ? "Confirm Pickup" : "Report Failed Pickup"}
                onClose={() => setIsModalOpen(false)}
            >
                <SchemaForm
                    obj={{
                        transport_id: pickup.documentId!,
                        user_phone_number: pickup.phone_number,
                        pickup_time: defaultFormatter(new Date()),
                        passengers_picked: pickup.no_of_seats,
                        failure_reason: "",
                    }}
                    schema={PickupInfoSchema}
                    hiddenColumns={[
                        "documentId",
                        "transport_id",
                        "pickup_time",
                        "user_phone_number",
                        ...(status === "successful" ? ["failure_reason"] : ["passengers_picked"])
                    ]}
                    onSubmitted={handleConfirmed}
                />
            </PopupForm>
        </div>
    );
}