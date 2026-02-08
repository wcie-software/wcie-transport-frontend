"use client"

import { Vehicle, VehicleSchema } from "@/app/models/vehicle";
import { DetailList } from "@/app/ui/components/detail_list";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import SchemaForm from "@/app/ui/components/schema_form";
import { db } from "@/app/utils/firebase_client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { TruckIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { toast } from "sonner";

export default function VehiclesView({ body }: { body: Vehicle[] }) {
	const firestore = new FirestoreHelper(db);

	const [tableData, setTableData] = useState(body);
	const [popupOpen, setPopupOpen] = useState(false);
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	// YYYY-MM-DD
	const today = new Date().toLocaleDateString("en-CA").replaceAll("/", "-");

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
				onDelete={async (i) => {
					const success = await firestore.deleteDocument(FirestoreCollections.Vehicles, tableData[i].documentId!);
					const vehicleName = tableData[i].name;
					if (success) {
						// Update ui (exclude recently deleted object)
						setTableData(tableData.filter((r, index) => index != i));
						toast.success(`Vehicle '${vehicleName}' deleted successfully.`);
					} else {
						toast.error(`Failed to delete vehicle '${vehicleName}'. Try again.`);
					}
				}}
			/>

			<PopupForm open={popupOpen} onClose={() => { setPopupOpen(false); setCurrentlyEditing(-1); }}>
				<SchemaForm
					isNew={currentlyEditing === -1}
					schema={VehicleSchema}
					obj={currentlyEditing !== -1 ? tableData[currentlyEditing] : VehicleSchema.shape}
					customLabels={{ "name": "Vehicle Name" }}
					suggestedValues={{
						"active": ["Yes", "No"]
					}}
					onSubmitted={async (obj) => {
						const v = VehicleSchema.parse(obj);
						if (currentlyEditing !== -1) {
							const success = await firestore.updateDocument(FirestoreCollections.Vehicles, v.documentId!, v);
							const vehicleName = tableData[currentlyEditing].name;
							if (success) {
								// Update ui
								setTableData(tableData.map((r, i) => {
									// Only update the edited object
									if (i === currentlyEditing) {
										// e.g., { name: "oba", name: "Oba" } = { name: "Oba" }
										return { ...r, ...v };
									}
									return r;
								}));
								toast.success(`Vehicle '${vehicleName}' updated successfully.`);
							} else {
								toast.error(`Failed to update vehicle '${vehicleName}'. Try again.`);
							}
						} else {
							const success = await firestore.addDocument(FirestoreCollections.Vehicles, v);
							const vehicleName = v.name;
							if (success) {
								setTableData([...tableData, v]); // Update ui
								toast.success(`Vehicle '${vehicleName}' added successfully.`);
							} else {
								toast.error(`Failed to add vehicle '${vehicleName}'. Try again.`);
							}
						}

						// Reset variables
						setCurrentlyEditing(-1);
						setPopupOpen(false);
					}}
				/>
			</PopupForm>
		</div>
	);
}