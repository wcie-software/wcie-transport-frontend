"use client"

import { Vehicle } from "@/app/models/vehicle";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import SchemaForm from "@/app/ui/components/schema_form";
import Table from "@/app/ui/components/table";
import { db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function VehiclesPage({ header, body }: { header: Record<string, string>, body: Vehicle[] }) {
	const firestore = new FirestoreHelper(db);

	const [tableData, setTableData] = useState(body);
	const [popupOpen, setPopupOpen] = useState(false);
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	return (
		<div>
			<PrimaryButton onClick={() => setPopupOpen(true)}>
				Add Vehicle
			</PrimaryButton>
			<div className="mt-8" >
				<Table<Vehicle>
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
						: { documentId: "", name: "", plate_number: "", year: 2025, remarks: "", } as Vehicle }
					labels={{ // TODO: Add remainaing fields
						"name": "Vehicle Name",
						"plate_number": "License Plate",
						"year": "Model Year",
						"remarks": "Remarks"
					}}
					suggestedValues={{ "driver_license_class": Array.from({length: 7}).map((v, i) => `Class ${i+1}`), }}
					onSubmitted={(obj) => {
						const newVehicle = obj as Vehicle;
						if (currentlyEditing !== -1) {
							setTableData(tableData.map((r, i) => {
								if (i === currentlyEditing) {
									return { ...r, ...newVehicle };
								}
								return r;
							}));
							firestore.updateDocument(FirestoreCollections.Drivers, newVehicle.documentId!, newVehicle);
						} else {
							setTableData([...tableData, newVehicle]);
							firestore.addDocument(FirestoreCollections.Drivers, newVehicle);
						}
						
						setCurrentlyEditing(-1);
						setPopupOpen(false);
					}}
				/>
			</PopupForm>
		</div>
	);
}