"use client";

import { Schedule } from "@/app/models/schedule";
import PopupForm from "@/app/ui/components/popup_form";
import PrimaryButton from "@/app/ui/components/primary_button";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Checkbox, ListItemText, MenuItem, Select } from "@mui/material";
import { useState } from "react";

export function ScheduleView({ schedules, driverNames }:
	{ schedules: Schedule[], driverNames: string[] }
) {
	const nearestSunday = new Date();
	nearestSunday.setDate(nearestSunday.getDate() + (7 - nearestSunday.getDay()));

	const lastSunday = new Date(nearestSunday);
	lastSunday.setDate(lastSunday.getDate() - 7);

	const [popupOpen, setPopupOpen] = useState(false);
	const [chosenDate, setChosenDate] = useState<Date>(nearestSunday);
	const [selectedDrivers, setSelectedDrivers] = useState<Record<number, string[]>>({
		1: [],
		2: [],
	});

	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	const parseDate = (dateStr: string) => {
		try {
			const [year, month, day] = dateStr.split('-').map(Number);
			return new Date(year, month - 1, day);
		} catch {
			return null;
		}
	}

	function formSubmitted(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!isNaN(chosenDate.getTime())
			&& chosenDate.getDay() === 0
			&& selectedDrivers[1].length > 0
			&& selectedDrivers[2].length > 0
		) {
			const newSchedule: Schedule = {
				date: formatDate(chosenDate),
				schedule: {
					1: selectedDrivers[1],
					2: selectedDrivers[2],
				},
			};
			console.log("New Schedule:", newSchedule);
			setPopupOpen(false);
		}
	}

	return (
		<div className="w-full mt-12 mx-4">
			<PrimaryButton
				onClick={() => {
					setChosenDate(nearestSunday);
					setPopupOpen(true);
				}}
			>
				Add Schedule
			</PrimaryButton>

			<div>
				Schedules
			</div>

			<PopupForm open={popupOpen} onClose={() => setPopupOpen(false)}>
				<form className="flex flex-col gap-2" onSubmit={formSubmitted}>
					<div className="flex flex-col gap-0.5">
						<label htmlFor="date" className="text-xs">Week</label>
						<input
							className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-foreground"
							type="date"
							name="date"
							id="date"
							min={formatDate(lastSunday)}
							value={formatDate(chosenDate)}
							step={7}
							onChange={(e) => {
								const selectedDate = parseDate(e.target.value);
								if (selectedDate && selectedDate.getDay() === 0) {
									setChosenDate(selectedDate);
								}
							}}
						/>
					</div>
					{Array.from({ length: 2 }).map((_, index) => {
						const serviceNumber = index + 1;
						const suffix: Record<number, string> = { 1: "st", 2: "nd", 3: "rd", 4: "th" };

						return (
							<div key={index} className="flex flex-col gap-0.5 py-2 items-baseline justify-start">
								<label htmlFor={`drivers-${serviceNumber}`} className="text-xs">
									Select {serviceNumber}{suffix[serviceNumber]} Service Drivers
								</label>
								<Select
									className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded p-0 pe-2 outline-0 text-foreground"
									sx={{ color: "inherit"}}
									name={`drivers-${serviceNumber}`}
									id={`drivers-${serviceNumber}`}
									IconComponent={() => <ChevronDownIcon width={20} height={20} />}
									multiple
									value={selectedDrivers[serviceNumber] || []}
									onChange={(e) => {
										const value = e.target.value;
										setSelectedDrivers({
											...selectedDrivers,
											[serviceNumber]: typeof value === 'string' ? value.split(',') : value,
										});
									}}
									MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
									renderValue={(selected) => selected.join(", ") || "No Drivers Selected"}
									displayEmpty
								>
									{driverNames.map((name) => (
										<MenuItem key={name} value={name}>
											<Checkbox checked={selectedDrivers[serviceNumber].includes(name)} />
											<ListItemText primary={name} />
										</MenuItem>
									))}
								</Select>
							</div>
						);
					})}
					<div className="ml-auto">
						<PrimaryButton type="submit">
							Done
						</PrimaryButton>
					</div>
				</form>
			</PopupForm>
		</div>
	);
}