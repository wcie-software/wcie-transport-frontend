"use client";

import { Schedule } from "@/app/models/schedule";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import { db } from "@/app/utils/firebase_setup/client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { useState } from "react";
import { ScheduleForm } from "./schedule_form";
import { NUMBER_SUFFIX } from "@/app/utils/constants";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export function ScheduleView({ schedulesByMonth, driverInfo }:
	{ schedulesByMonth: Record<string, Schedule[]>, driverInfo: Record<string, string> }
) {
	const firestore = new FirestoreHelper(db);

	const [popupOpen, setPopupOpen] = useState(false);
	const [scheduleGroups, setSchedules] = useState<Record<string, Schedule[]>>(schedulesByMonth);
	const [currentSchedule, setCurrentSchedule] = useState<Schedule>();

	const documentKey = (schedule: Schedule) =>
		new Date(schedule.timestamp).toLocaleDateString().replaceAll("/", "-");
	const monthKey = (schedule: Schedule) =>
		new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(schedule.timestamp));

	async function addNewSchedule(schedule: Schedule) {
		const mk = monthKey(schedule);

		const added = await firestore.addDocument(
			FirestoreCollections.Schedules,
			schedule,
			documentKey(schedule),
		);

		if (added) {
			// TODO: Sort schedules by timestamp
			setSchedules({
				...scheduleGroups,
				[mk]: [...(scheduleGroups[mk] || []), schedule],
			});
		} else {
			// TODO: Show error
		}
	}

	async function updateSchedule(schedule: Schedule) {
		if (!currentSchedule) return;

		// Disallow changing date
		const updatedSchedule = { ...schedule, timestamp: currentSchedule.timestamp };
		const mk = monthKey(updatedSchedule);

		const updated = await firestore.updateDocument(
			FirestoreCollections.Schedules,
			documentKey(updatedSchedule),
			updatedSchedule,
		);

		if (updated) {
			setSchedules({
				...scheduleGroups,
				[mk]: scheduleGroups[mk].map((s) =>
					s.timestamp === schedule.timestamp ? updatedSchedule : s
				),
			})
		} else {
			// TODO: Show error
		}
	}

	return (
		<div className="w-full mt-12 mx-4">
			<PrimaryButton onClick={() => { setPopupOpen(true); }} >
				Add Schedule
			</PrimaryButton>

			<div className="my-8 space-y-6">
				{Object.entries(scheduleGroups).map(([month, schedules]) => (
					<div key={month} className="space-y-3">
						<h2 className="text-xl font-semibold mb-2">{month}</h2>
						<div className="space-y-5">
							{schedules.map((schedule) => {
								const date = new Date(schedule.timestamp);
								return (
									<div key={schedule.timestamp}>
										<h3 className="text-lg font-medium flex flex-row gap-1.5 items-baseline">
											<span>{new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(date)}</span>
											<PencilIcon
											 	cursor="pointer"
												width={16}
												height={16}
												onClick={() => {
													setCurrentSchedule(schedule);
													setPopupOpen(true);
												}}
											/>
											<TrashIcon
											 	cursor="pointer"
												width={16}
												height={16}
												onClick={() => {
													firestore.deleteDocument(FirestoreCollections.Schedules, documentKey(schedule));
													setSchedules({
														...scheduleGroups,
														[month]: scheduleGroups[month].filter(s => s.timestamp !== schedule.timestamp)
													});
												}}
											/>
										</h3>
										{Object.entries(schedule.schedule).map(([service, drivers], i) => {
											return (
												<div key={service} className="mb-2 space-y-0.5">
													<h4 className="text-md">{service}{NUMBER_SUFFIX[parseInt(service)]} Service</h4>
													<div className="flex flex-wrap gap-2">
														{drivers.length > 0
															? drivers.map((driver) => 
																<p className="bg-tertiary text-white px-2.5 py-1 rounded-full" key={`${driver}-${i}`}>
																	{driverInfo[driver]}
																</p>
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
						<hr className="m-auto text-tertiary"/>
					</div>
				))}
			</div>
			
			<PopupForm open={popupOpen} onClose={() => setPopupOpen(false)}>
				<ScheduleForm
					defaultSchedule={currentSchedule}
				 	driverOptions={driverInfo}
					onSubmitted={async (schedule) => {
						setPopupOpen(false);

						if (!currentSchedule) {
							addNewSchedule(schedule);
						} else {
							updateSchedule(schedule);
							setCurrentSchedule(undefined);
						}
					}
				}/>
			</PopupForm>
		</div>
	);
}