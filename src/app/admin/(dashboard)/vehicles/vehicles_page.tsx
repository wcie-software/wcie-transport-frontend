"use client"

import { Vehicle, VehicleSchema } from "@/app/models/vehicle";
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

	const today = new Date().toLocaleDateString().replaceAll("/", "-");

	return (
		<div>
			<PrimaryButton onClick={() => setPopupOpen(true)}>
				Add Vehicle
			</PrimaryButton>

			<DetailList
				header={{
					"plate_number": "License Plate",
					"year": "Model",
					"seating_capacity": "Seating Capacity",
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
					firestore.deleteDocument(FirestoreCollections.Vehicles, tableData[i].documentId!);
					setTableData(tableData.filter((r, index) => index != i));
				}}
			/>

			<PopupForm open={popupOpen} onClose={() => {setPopupOpen(false); setCurrentlyEditing(-1); }}>
				<SchemaForm
					schema={currentlyEditing !== -1
						? tableData[currentlyEditing]
						: { documentId: "", name: "", plate_number: "", year: 2025, seating_capacity: 4, remarks: "", fuel_cost: 0, last_fuel_date: today, maintenance_type: "", maintenance_receipt_amount: 0, last_maintenance_date: today } as Vehicle }
					customLabels={{"name": "Vehicle Name"}}
					onSubmitted={(obj) => {
						const newVehicle = VehicleSchema.parse(obj);
						if (currentlyEditing !== -1) {
							setTableData(tableData.map((r, i) => {
								if (i === currentlyEditing) {
									return { ...r, ...newVehicle };
								}
								return r;
							}));
							firestore.updateDocument(FirestoreCollections.Vehicles, newVehicle.documentId!, newVehicle);
						} else {
							setTableData([...tableData, newVehicle]);
							firestore.addDocument(FirestoreCollections.Vehicles, newVehicle);
						}
						
						setCurrentlyEditing(-1);
						setPopupOpen(false);
					}}
				/>
			</PopupForm>
		</div>
	);
}