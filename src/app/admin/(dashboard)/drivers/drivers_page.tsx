"use client"

import { Driver } from "@/app/models/driver";
import { DetailList } from "@/app/ui/components/detail_list";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import SchemaForm from "@/app/ui/components/schema_form";
import { db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { UserIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { toast } from "sonner";

export default function DriversPage({ body }: { body: Driver[] }) {
	const firestore = new FirestoreHelper(db);

	const [data, setData] = useState(body);
	const [popupOpen, setPopupOpen] = useState(false);
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	return (
		<div>
			<PrimaryButton onClick={() => setPopupOpen(true)}>
				Add Driver
			</PrimaryButton>

			<DetailList
				body={data}
				header={{
					"phone_number": "Phone Number",
					"email": "Email",
					"address": "Address",
					"driver_license_class": "Driver License Class",
					"comments": "Comments",
				}}
				idColumn="documentId"
				titleColumn="full_name"
				titleIcon={<UserIcon width={20} height={20} />}
				onEdit={(i) => {
					setPopupOpen(true);
					setCurrentlyEditing(i);
				}}
				onDelete={async (i) => {
					const success = await firestore.deleteDocument(FirestoreCollections.Drivers, data[i].documentId!);
					const driverName = data[i].full_name;
					if (success) {
						setData(data.filter((r, index) => index != i));
						toast.success(`Removed '${driverName}'.`);
					} else {
						toast.error(`Failed to remove '${driverName}'.`);
					}
				}}
			/>

			<PopupForm open={popupOpen} onClose={() => { setPopupOpen(false); setCurrentlyEditing(-1); }}>
				<SchemaForm
					schema={currentlyEditing !== -1
						? data[currentlyEditing]
						: { full_name: "", phone_number: "", email: "", address: "", driver_license_class: "Class 5", comments: "" } as Driver}
					hiddenColumns={["documentId", "location"]}
					suggestedValues={{ "driver_license_class": Array.from({ length: 7 }).map((v, i) => `Class ${i + 1}`), }}
					onSubmitted={async (obj) => {
						const newDriver = obj as Driver;
						if (currentlyEditing !== -1) {
							const success = await firestore.updateDocument(FirestoreCollections.Drivers, newDriver.documentId!, newDriver);
							const driverName = data[currentlyEditing].full_name;
							if (success) {
								setData(data.map((r, i) => {
									if (i === currentlyEditing) {
										return { ...r, ...newDriver };
									}
									return r;
								}));
								toast.success(`Updated '${driverName}'.`);
							} else {
								toast.error(`Failed to update '${driverName}'. Try again.`);
							}
						} else {
							const success = await firestore.addDocument(FirestoreCollections.Drivers, newDriver);
							const driverName = newDriver.full_name;
							if (success) {
								setData([...data, newDriver]);
								toast.success(`Added '${driverName}'.`);
							} else {
								toast.error(`Failed to add '${driverName}'. Try again.`);
							}
						}

						setCurrentlyEditing(-1);
						setPopupOpen(false);
					}}
				/>
			</PopupForm>
		</div>
	);
}