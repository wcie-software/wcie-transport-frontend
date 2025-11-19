"use client"

import { Driver, DriverSchema } from "@/app/models/driver";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import SchemaForm from "@/app/ui/components/schema_form";
import Table from "@/app/ui/components/table";
import { db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function DriversPage({ header, body }: { header: Record<string, string>, body: Driver[] }) {
	const firestore = new FirestoreHelper(db);

	const [tableData, setTableData] = useState(body);
	const [popupOpen, setPopupOpen] = useState(false);
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	return (
		<div>
			<PrimaryButton onClick={() => setPopupOpen(true)}>
				Add Driver
			</PrimaryButton>
			<div className="mt-8" >
				<Table<Driver>
					headerMap={header}
					body={tableData}
					actionButtons={[
						{
							icon: <PencilIcon width={20} height={20}/>,
							onPressed: (i) => {
								setPopupOpen(true);
								setCurrentlyEditing(i);
							}
						},
						{
							icon: <TrashIcon width={20} height={20} />,
							onPressed: (i) => {
								firestore.deleteDocument(FirestoreCollections.Drivers, tableData[i].documentId!);
								setTableData(tableData.filter((r, index) => index != i));
							}
						}
					]}
				/>
			</div>

			<PopupForm open={popupOpen} onClose={() => setPopupOpen(false)}>
				<SchemaForm
					schema={currentlyEditing !== -1
						? tableData[currentlyEditing]
						: {documentId: "", full_name: "", address: "", driver_license_class: "Class 5", comments: ""} as Driver }
					labels={{
						"documentId": "Phone Number",
						"full_name": "Full Name",
						"address": "Address",
						"driver_license_class": "Driver License Class",
						"comments": "Comments"
					}}
					suggestedValues={{ "driver_license_class": Array.from({length: 7}).map((v, i) => `Class ${i+1}`), }}
					onSubmitted={(obj) => {
						const newDriver = obj as Driver;
						if (currentlyEditing !== -1) {
							setTableData(tableData.map((r, i) => {
								if (i === currentlyEditing) {
									return { ...r, ...newDriver };
								}
								return r;
							}));
							firestore.updateDocument(FirestoreCollections.Drivers, newDriver.documentId!, newDriver);
						} else {
							setTableData([...tableData, newDriver]);
							firestore.addDocument(FirestoreCollections.Drivers, newDriver, newDriver.documentId);
						}
						
						setCurrentlyEditing(-1);
						setPopupOpen(false);
					}}
				/>
			</PopupForm>
		</div>
	);
}