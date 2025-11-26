"use client"

import { Driver } from "@/app/models/driver";
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
			<div className="my-8 bg-tertiary rounded-lg px-4">
				{tableData.map((driver, i) => (
					<div
						key={driver.documentId}
						className="border-b-[0.2px] last:border-0 border-gray-600 py-8 flex flex-row justify-between items-start gap-12"
					>
						<div>
							<h2 className="font-semibold text-xl mb-4">{driver.full_name}</h2>
							<div className="flex flex-wrap justify-between gap-6">
								{Object.entries(header).map(([key, name]) => (
									<div>
										<h3 className="text-gray-400">{name}</h3>
										<p className="max-w-sm">{driver[key as keyof object]}</p>
									</div>
								))}
							</div>
						</div>
						<div className="flex flex-row items-center gap-3.5">
							<div
								className="cursor-pointer flex flex-row items-center gap-2 border border-tertiary py-2 px-2.5 rounded-md"
								onClick={() => {
									setPopupOpen(true);
									setCurrentlyEditing(i);
									}
								}
							>
								<PencilIcon width={20} height={20} />
								<p>Edit</p>
							</div>
							<div
								className="cursor-pointer flex flex-row items-center gap-2 bg-deleteRed py-2 px-2.5 rounded-md"
								onClick={() => {
									firestore.deleteDocument(FirestoreCollections.Drivers, tableData[i].documentId!);
									setTableData(tableData.filter((r, index) => index != i));
								}}
							>
								<TrashIcon width={20} height={20} />
								<p>Delete</p>
							</div>
						</div>
					</div>
				))}
			</div>

			<PopupForm open={popupOpen} onClose={() => setPopupOpen(false)}>
				<SchemaForm
					schema={currentlyEditing !== -1
						? tableData[currentlyEditing]
						: { full_name: "", phone_number: "", email: "", address: "", driver_license_class: "Class 5", comments: ""} as Driver }
					labels={{
						"phone_number": "Phone Number",
						"full_name": "Full Name",
						"email": "Email",
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
							firestore.addDocument(FirestoreCollections.Drivers, newDriver);
						}
						
						setCurrentlyEditing(-1);
						setPopupOpen(false);
					}}
				/>
			</PopupForm>
		</div>
	);
}