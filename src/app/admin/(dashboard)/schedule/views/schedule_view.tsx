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

export function ScheduleView({ scheduleGroups, driverInfo }:
	{ scheduleGroups: Record<string, Schedule[]>, driverInfo: Record<string, string> }
) {
	const firestore = new FirestoreHelper(db);

	const [popupOpen, setPopupOpen] = useState(false);
	const [schedules, setSchedules] = useState<Record<string, Schedule[]>>(scheduleGroups);

	return (
		<div className="w-full mt-12 mx-4">
			<PrimaryButton onClick={() => { setPopupOpen(true); }} >
				Add Schedule
			</PrimaryButton>

			<div className="my-8 space-y-6">
				{Object.entries(schedules).map(([month, schedules]) => (
					<div key={month} className="space-y-3">
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
				 	driverOptions={driverInfo}
					onSubmitted={async (schedule) => {
						const d = new Date(schedule.timestamp);

						const added = await firestore.addDocument(
							FirestoreCollections.Schedules,
							schedule,
							d.toLocaleDateString().replaceAll("/", "-"),
						);
						setPopupOpen(false);

						if (added) {
							const monthKey = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
							const newMonthSchedules = schedules[monthKey] || [];
							newMonthSchedules.push(schedule);
							
							// TODO: Sort schedules by timestamp
							setSchedules({
								...schedules,
								[monthKey]: newMonthSchedules,
							});
						} else {
							// TDOD: Show error
						}
					}
				}/>
			</PopupForm>
		</div>
	);
}