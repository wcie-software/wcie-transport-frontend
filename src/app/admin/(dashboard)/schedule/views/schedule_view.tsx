"use client";

import { Schedule } from "@/app/models/schedule";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import { db } from "@/app/utils/firebase_client";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { useState } from "react";
import { ScheduleForm } from "./schedule_form";
import { Constants } from "@/app/utils/util";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

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
	const dateKey = (schedule: Schedule) => new Date(schedule.timestamp).toLocaleDateString();

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
			toast.success(`Schedule for ${dateKey(schedule)} added successfully.`);
		} else {
			toast.error("Failed to add schedule. Schedule already exists for this date.");
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
			toast.success(`Schedule for ${dateKey(schedule)} updated successfully.`);
		} else {
			toast.error("Failed to update schedule. Try again.");
		}
	}

	async function deleteSchedule(schedule: Schedule) {
		const deleted = await firestore.deleteDocument(FirestoreCollections.Schedules, documentKey(schedule));

		const month = monthKey(schedule);
		// Update ui
		setSchedules({
			...scheduleGroups,
			// Exclude just deleted schedule
			[month]: scheduleGroups[month].filter(s => s.timestamp !== schedule.timestamp)
		});

		if (deleted) {
			toast.success(`Schedule for ${dateKey(schedule)} deleted successfully.`);
		} else {
			toast.error(`Failed to delete schedule for ${dateKey(schedule)}.`);
		}
	}

	return (
		<div className="w-full mt-12">
			<PrimaryButton onClick={() => { setPopupOpen(true); }} >
				Add Schedule
			</PrimaryButton>

			<div className="my-8 space-y-6">
				{Object.entries(scheduleGroups).map(([month, schedules], index) => (
					<div key={month} className="space-y-3">
						{index !== 0 && <hr className="mx-auto mt-6 text-tertiary" />}
						<h2 className="text-2xl font-semibold mb-6">{month}</h2>
						<div className="space-y-6">
							{schedules.map((schedule) => {
								const date = new Date(schedule.timestamp);
								return (
									<div key={schedule.timestamp} className="flex flex-col gap-6 bg-tertiary rounded-lg p-4">
										{/* Header bar */}
										<div className="flex flex-row justify-between gap-1.5 items-baseline">
											{/* Date header */}
											<h3 className="text-xl font-medium">
												{new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "America/Edmonton" }).format(date)}
											</h3>
											{/* Edit and delete button */}
											<div className="flex flex-col md:flex-row items-center gap-3.5">
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
													onClick={() => deleteSchedule(schedule)}
												>
													<TrashIcon width={20} height={20} />
													<p>Delete</p>
												</div>
											</div>
										</div>
										<div className="flex flex-row justify-between items-start gap-2">
											{/* Chip items */}
											{Object.entries(schedule.schedule).map(([service, drivers], i) => (
												<div key={service} className="mb-2 flex flex-col items-baseline gap-2">
													<h4 className="text-md">{service}{Constants.NUMBER_SUFFIX[parseInt(service)]} Service</h4>
													<div className="flex flex-wrap gap-2">
														{drivers.length > 0
															? drivers.map((driver) =>
																<p
																	className="bg-tertiary text-foreground px-2.5 py-1 rounded-full"
																	key={`${driver}-${i}`}
																>
																	{driverInfo[driver]}
																</p>)
															: <span className="text-sm italic text-gray-500">No drivers assigned</span>
														}
													</div>
												</div>
											))}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>

			<PopupForm open={popupOpen} onClose={() => {
				setPopupOpen(false);
				// In case the user started editing, but exited
				setCurrentSchedule(undefined);
			}}>
				<ScheduleForm
					defaultSchedule={currentSchedule}
					driverOptions={driverInfo}
					onSubmitted={(schedule) => {
						setPopupOpen(false);

						if (!currentSchedule) {
							addNewSchedule(schedule);
						} else {
							updateSchedule(schedule);
							setCurrentSchedule(undefined);
						}
					}}
				/>
			</PopupForm>
		</div>
	);
}