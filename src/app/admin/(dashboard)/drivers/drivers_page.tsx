"use client"

import { Driver, DriverSchema } from "@/app/models/driver";
import { DetailList } from "@/app/ui/components/detail_list";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import SchemaForm from "@/app/ui/components/schema_form";
import { createDriverAccount, updateDriverAccount } from "@/app/utils/driver_auth";
import { db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { getPlaceDetails, getPlacePredictions } from "@/app/utils/google_maps";
import { UserIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { toast } from "sonner";

export default function DriversPage({ body }: { body: Driver[] }) {
	const firestore = new FirestoreHelper(db);

	const [data, setData] = useState(body);
	const [popupOpen, setPopupOpen] = useState(false);
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	async function getAddressCoordinates(address: string) {
		// Get first suggestion
		const placeId = (await getPlacePredictions(address))[0].id;
		// Get coordinates of place
		return (await getPlaceDetails(placeId)).location;
	}

	async function addDriver(driver: Driver) {
		const uid = await createDriverAccount(driver);
		driver.documentId = uid; // Document id should match uid
		driver.location = await getAddressCoordinates(driver.address);

		const success = await firestore.addDocument(
			FirestoreCollections.Drivers, driver, uid);

		const driverName = driver.full_name;
		if (success) {
			setData([...data, driver]);
			toast.success(`Added '${driverName}'.`);
		} else {
			toast.error(`Failed to add '${driverName}'. Driver might already be added`);
		}
	}

	async function updateDriver(driver: Driver) {
		await updateDriverAccount(driver);

		// If there's been a change in address
		if (driver.address != data[currentlyEditing].address) {
			// Update coordinates
			driver.location = await getAddressCoordinates(driver.address);
		}

		const success = await firestore.updateDocument(
			FirestoreCollections.Drivers, driver.documentId!, driver);

		const driverName = driver.full_name;
		if (success) {
			setData(data.map((r, i) => {
				if (i === currentlyEditing) {
					return { ...r, ...driver };
				}
				return r;
			}));
			toast.success(`Updated '${driverName}'.`);
		} else {
			toast.error(`Failed to update '${driverName}'. Try again.`);
		}
	}

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
					schema={DriverSchema}
					obj={currentlyEditing !== -1
						? data[currentlyEditing]
						: { full_name: "", phone_number: "", email: "", address: "", driver_license_class: "Class 5", comments: "" } as Driver}
					hiddenColumns={["documentId", "location"]}
					suggestedValues={{ "driver_license_class": Array.from({ length: 7 }).map((v, i) => `Class ${i + 1}`), }}
					onSubmitted={async (obj) => {
						const newDriver = DriverSchema.parse(obj);

						if (currentlyEditing !== -1) {
							updateDriver(newDriver);
						} else {
							addDriver(newDriver);
						}

						setCurrentlyEditing(-1);
						setPopupOpen(false);
					}}
				/>
			</PopupForm>
		</div>
	);
}