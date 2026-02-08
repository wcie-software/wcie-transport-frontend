"use client";

import { TransportRequest } from "@/app/models/request";
import DateSelector from "./components/date_selector";
import PickupItem from "./components/pickup_item";
import { useState } from "react";
import { db } from "@/app/utils/firebase_client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { toast } from "sonner";
import { PickedUpItem } from "./components/pickedup_item";
import styles from "./pickup-view.module.css";
import { PickupInfo } from "@/app/models/pickup_info";

export default function PickupView({ transportRequests }: { transportRequests: TransportRequest[] }) {
    const [pickups, setPickups] = useState(transportRequests.filter(t => t.status === "normal"));
    const [pickedUp, setPickedUp] = useState(transportRequests.filter(t => t.status !== "normal"))

    async function updatePickupStatus(t: TransportRequest, info?: PickupInfo) {
        setPickups(pickups.filter(p => p.documentId !== t.documentId));
        setPickedUp([...pickedUp, t]);

        const fs = new FirestoreHelper(db);
        const updated = await fs.updateDocument(
            FirestoreCollections.Requests,
            t.documentId!,
            { status: t.status }
        );

        if (info) {
            await fs.addDocument(FirestoreCollections.PickupInfo, info);
        }

        if (!updated) {
            toast.error("Failed to update database. Please refresh the page")
        } else {
            toast.info(`${t.full_name}'s record was updated`)
        }
    }

    return (
        <div className="mt-8 mb-24 overflow-x-auto">
            <DateSelector />
            <div className="mt-4 space-y-4">
                {pickups.map((t, i) =>
                    <PickupItem
                        key={t.documentId}
                        pickup={t}
                        active={i === 0}
                        onPickupSuccessful={(info) => {
                            t.status = "successful";
                            updatePickupStatus(t, info);
                        }}
                        onPickupFailed={(info) => {
                            t.status = "failed";
                            updatePickupStatus(t, info);
                        }}
                    />)
                }
            </div>
            <div className="my-4">
                {pickedUp.length > 0 &&
                    <h2 className={`text-lg font-bold uppercase tracking-widest ${styles.sectionDivider}`}>Completed Pickups</h2>
                }
                <div className="mt-4 space-y-4">
                    {pickedUp.map(t => <PickedUpItem key={t.documentId} item={t} />)}
                </div>
            </div>
            {(pickups.length === 0 && pickedUp.length === 0) &&
                <p className="uppercase my-4 text-xs">No pickups</p>
            }
        </div >
    );
}