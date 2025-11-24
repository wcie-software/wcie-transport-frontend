"use client";

import { Schedule } from "@/app/models/schedule";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import { db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { useState } from "react";
import { ScheduleForm } from "./schedule_form";

export function ScheduleView({ schedules, driverNames }:
	{ schedules: Schedule[], driverNames: string[] }
) {
	const firestore = new FirestoreHelper(db)

	const [popupOpen, setPopupOpen] = useState(false);

	return (
		<div className="w-full mt-12 mx-4">
			<PrimaryButton onClick={() => { setPopupOpen(true); }} >
				Add Schedule
			</PrimaryButton>

			<div>
				Schedules
			</div>

			<PopupForm open={popupOpen} onClose={() => setPopupOpen(false)}>
				<ScheduleForm
				 	driverOptions={driverNames}
					onSubmitted={async (schedule) => {
						await firestore.addDocument(FirestoreCollections.Schedules, schedule)
						setPopupOpen(false);
					}
				}/>
			</PopupForm>
		</div>
	);
}