"use client"

import { Vehicle } from "@/app/models/vehicle";
import { DetailList } from "@/app/ui/components/detail_list";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import SchemaForm from "@/app/ui/components/schema_form";
import { db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { TruckIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function VehiclesView({ body }: { body: Vehicle[] }) {
	const firestore = new FirestoreHelper(db);

	const [tableData, setTableData] = useState(body);
	const [popupOpen, setPopupOpen] = useState(false);
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	return (
		<div>
			<PrimaryButton onClick={() => setPopupOpen(true)}>
				Add Vehicle
			</PrimaryButton>

			<DetailList
				header={{
					"plate_number": "License Plate",
					"year": "Model",
					"fuel_cost": "Cost of Fuel ($)",
					"last_fuel_date": "Last Fueled",
					"maintenance_type": "Maintenance Type",
					"maintenance_receipt_amount": "Maintenance Cost ($)",
					"last_maintenance_date": "Last Maintained",
					"remarks": "Remarks"
				}}
				body={tableData}
				idColumn="documentId"
				titleColumn="name"
				titleIcon={<TruckIcon width={20} height={20} />}
				onEdit={(i) => {
					setPopupOpen(true);
					setCurrentlyEditing(i);
				}}
				onDelete={(i) => {
					firestore.deleteDocument(FirestoreCollections.Drivers, tableData[i].documentId!);
					setTableData(tableData.filter((r, index) => index != i));
				}}
			/>

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