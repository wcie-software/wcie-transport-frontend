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

export function ScheduleView({ schedulesByMonth, driverInfo }: {
	schedulesByMonth: Record<string, Schedule[]>,
	driverInfo: Record<string, string>
}) {
	const firestore = new FirestoreHelper(db);

	const [popupOpen, setPopupOpen] = useState(false);
	const [scheduleGroups, setSchedules] = useState<Record<string, Schedule[]>>(schedulesByMonth);
	const [currentSchedule, setCurrentSchedule] = useState<Schedule>();

	const documentKey = (schedule: Schedule) =>
		new Date(schedule.timestamp).toLocaleDateString().replaceAll("/", "-");
	const monthKey = (schedule: Schedule) =>
		new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "America/Edmonton" }).format(new Date(schedule.timestamp));

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
		<div className="w-full mt-12">
			<PrimaryButton onClick={() => { setPopupOpen(true); }} >
				Add Schedule
			</PrimaryButton>

			<div className="my-8 space-y-6">
				{Object.entries(scheduleGroups).map(([month, schedules]) => (
					<div key={month} className="space-y-3">
						<h2 className="text-2xl font-semibold mb-6">{month}</h2>
						<div className="space-y-6">
							{schedules.map((schedule) => {
								const date = new Date(schedule.timestamp);
								return (
									<div key={schedule.timestamp} className="flex flex-col gap-6 bg-tertiary rounded-lg p-4">
										<div className="flex flex-row justify-between gap-1.5 items-baseline">
											<h3 className="text-xl font-medium">
												{new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "America/Edmonton" }).format(date)}
											</h3>
											<div className="flex flex-row items-center gap-3.5">
												<div
													className="cursor-pointer flex flex-row items-center gap-2 border border-tertiary py-2 px-2.5 rounded-md"
													onClick={() => {
														setCurrentSchedule(schedule);
														setPopupOpen(true);
													}}
												>
													<PencilIcon width={20} height={20} />
													<p>Edit</p>
												</div>
												<div
													className="cursor-pointer flex flex-row items-center gap-2 bg-deleteRed py-2 px-2.5 rounded-md text-white"
													onClick={() => {
														firestore.deleteDocument(FirestoreCollections.Schedules, documentKey(schedule));
														setSchedules({
															...scheduleGroups,
															[month]: scheduleGroups[month].filter(s => s.timestamp !== schedule.timestamp)
														});
													}}
												>
													<TrashIcon width={20} height={20} />
													<p>Delete</p>
												</div>
											</div>
										</div>
										<div className="flex flex-row justify-between items-start">
											{Object.entries(schedule.schedule).map(([service, drivers], i) => {
												return (
													<div key={service} className="mb-2 flex flex-col items-baseline gap-2">
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
									</div>
								);
							})}
						</div>
						<hr className="mx-auto mt-6 text-tertiary"/>
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