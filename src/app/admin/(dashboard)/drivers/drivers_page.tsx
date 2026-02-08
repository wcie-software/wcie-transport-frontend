"use client"

import { Driver, DriverSchema } from "@/app/models/driver";
import { DetailList } from "@/app/ui/components/detail_list";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import SchemaForm from "@/app/ui/components/schema_form";
import { createDriverAccount, updateDriverAccount } from "@/app/actions/driver_auth";
import { db } from "@/app/utils/firebase_client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { getPlaceDetails, getPlacePredictions } from "@/app/actions/google_maps";
import { UserIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { toast } from "sonner";
import { Location } from "@/app/models/location";

export default function DriversPage({ body }: { body: Driver[] }) {
	const firestore = new FirestoreHelper(db);

	const [data, setData] = useState(body);
	const [popupOpen, setPopupOpen] = useState(false);
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	async function getAddressCoordinates(address: string): Promise<{ fullAddress: string, coordinates: Location }> {
		// Get first suggestion
		const place = (await getPlacePredictions(address))[0];
		// Get coordinates of place
		const coord = (await getPlaceDetails(place.id)).location;

		return { fullAddress: place.text, coordinates: coord };
	}

	async function addDriver(driver: Driver) {
		try {
			const uid = await createDriverAccount(driver);
			driver.documentId = uid; // Document id should match uid
		} catch (e) {
			toast.error("Failed to add new driver. " + String(e));
			return;
		}

		try {
			// Guess driver's location from provided address
			const { fullAddress, coordinates } = await getAddressCoordinates(driver.address);
			driver.address = fullAddress;
			driver.location = coordinates;
		} catch (e) {
			toast.error("Failed to get driver's location. " + String(e));
			return;
		}

		const success = await firestore.addDocument(
			FirestoreCollections.Drivers, driver, driver.documentId);

		const driverName = driver.full_name;
		if (success) {
			setData([...data, driver]); // Update ui
			toast.success(`Added '${driverName}'.`);
		} else {
			toast.error(`Failed to add '${driverName}'. Driver might already be added`);
		}
	}

	async function updateDriver(driver: Driver) {
		try {
			await updateDriverAccount(driver);
		} catch (e) {
			toast.error("Failed to update driver's details. " + String(e));
			return;
		}

		// If there's been a change in address
		if (driver.address != data[currentlyEditing].address) {
			// Update location details
			try {
				const { fullAddress, coordinates } = await getAddressCoordinates(driver.address);
				driver.address = fullAddress;
				driver.location = coordinates;
			} catch (e) {
				toast.error("Failed to get driver's location. Please check it is spelled correctly.");
				return;
			}
		}

		const success = await firestore.updateDocument(
			FirestoreCollections.Drivers, driver.documentId!, driver);

		const driverName = driver.full_name;
		if (success) {
			// Update ui
			setData(data.map((r, i) => {
				// Only change value of newly updated record
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
						// Update ui
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
					isNew={currentlyEditing === -1}
					obj={currentlyEditing !== -1 ? data[currentlyEditing] : DriverSchema.shape}
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