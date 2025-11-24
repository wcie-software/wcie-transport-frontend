"use client";

import { Schedule } from "@/app/models/schedule";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import { db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { useState } from "react";
import { ScheduleForm } from "./schedule_form";
import { Chip } from "@mui/material";
import { NUMBER_SUFFIX } from "@/app/utils/constants";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export function ScheduleView({ schedules, driverNames }:
	{ schedules: Schedule[], driverNames: string[] }
) {
	const monthGroups = schedules.reduce((acc: Record<string, Schedule[]>, schedule) => {
		const d = new Date(schedule.timestamp);
		// e.g. "March 2025"
		const monthKey = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
		(acc[monthKey] ??= []).push(schedule);

		return acc;
	}, {});
	// const sortedMonthKeys = Object.keys(monthGroups).sort((a, b) => {
	// 	// sort months descending (newest first) by parsing "Month Year"
	// 	const toDate = (k: string) => new Date(k);
	// 	return toDate(b).getTime() - toDate(a).getTime();
	// });

	const firestore = new FirestoreHelper(db);

	const [popupOpen, setPopupOpen] = useState(false);

	return (
		<div className="w-full mt-12 mx-4">
			<PrimaryButton onClick={() => { setPopupOpen(true); }} >
				Add Schedule
			</PrimaryButton>

			<div className="mt-8">
				{Object.entries(monthGroups).map(([month, schedules]) => (
					<div key={month} className="space-y-6">
						<h2 className="text-xl font-semibold mb-2">{month}</h2>
						<div className="space-y-4">
							{schedules.map((schedule) => {
								const date = new Date(schedule.timestamp);
								return (
									<div key={schedule.timestamp}>
										<h3 className="text-lg font-medium flex flex-row gap-1.5 items-baseline">
											<span>{new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(date)}</span>
											<PencilIcon width={16} height={16}/>
											<TrashIcon width={16} height={16}/>
										</h3>
										{Object.entries(schedule.schedule).map(([service, drivers]) => {
											return (
												<div key={service} className="mb-2 space-y-1">
													<h4 className="text-md">{service}{NUMBER_SUFFIX[parseInt(service)]} Service</h4>
													<div className="flex flex-wrap gap-2">
														{drivers.length > 0
															? drivers.map((driver) => 
																<Chip className="bg-tertiary" color="warning" key={driver} label={driver} />
															)
															: <span className="text-sm italic text-gray-500">No drivers assigned</span>
														}
													</div>
												</div>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>
				))}
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