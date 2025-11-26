"use client";

import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Checkbox, ListItemText, MenuItem, Select } from "@mui/material";
import { Schedule } from "@/app/models/schedule";
import { useState } from "react";
import PrimaryButton from "@/app/ui/components/primary_button";
import { NUMBER_SUFFIX } from "@/app/utils/constants";

export function ScheduleForm({ defaultSchedule, driverOptions, onSubmitted, numberOfServices = 2}: {
	defaultSchedule?: Schedule,
	driverOptions: Record<string, string>,
	onSubmitted: (schedule: Schedule) => void,
	numberOfServices?: number
}) {
	const nearestSunday = new Date();
	nearestSunday.setDate(nearestSunday.getDate() + (7 - nearestSunday.getDay()));

	const [chosenDate, setChosenDate] = useState<Date>(new Date(defaultSchedule?.timestamp ?? nearestSunday));
	const [selectedDrivers, setSelectedDrivers] = useState<Record<number, string[]>>({
		1: defaultSchedule?.schedule["1"].map((id) => driverOptions[id]) ?? [],
		2: defaultSchedule?.schedule["2"].map((id) => driverOptions[id]) ?? [],
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

		const getIdFromName = (name: string) => {
			return Object.entries(driverOptions).find(([, fullName]) => fullName === name)![0];
		}

		if (!isNaN(chosenDate.getTime())
			&& chosenDate.getDay() === 0
			&& selectedDrivers[1]?.length > 0
			&& selectedDrivers[2]?.length > 0
		) {
			const schedule: Schedule = {
				timestamp: chosenDate.getTime(),
				schedule: {
					"1": selectedDrivers[1].map(getIdFromName),
					"2": selectedDrivers[2].map(getIdFromName),
				},
			};
			onSubmitted(schedule);

			// Reset form data
			setChosenDate(nearestSunday);
			setSelectedDrivers({});
		};
	}


	return (
		<form className="flex flex-col gap-2" onSubmit={formSubmitted}>
			<div className="flex flex-col gap-0.5">
				<label htmlFor="date" className="text-xs">Week</label>
				<input
					className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-foreground"
					type="date"
					name="date"
					id="date"
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
			{Array.from({ length: numberOfServices }).map((_, index) => {
				const serviceNumber = index + 1;

				return (
					<div key={index} className="flex flex-col gap-0.5 py-2 items-baseline justify-start">
						<label htmlFor={`drivers-${serviceNumber}`} className="text-xs">
							Select {serviceNumber}{NUMBER_SUFFIX[serviceNumber]} Service Drivers
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
							{Object.values(driverOptions).map((name) => (
								<MenuItem key={name} value={name}>
									<Checkbox
										checked={serviceNumber in selectedDrivers && selectedDrivers[serviceNumber].includes(name)}
									/>
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
	);
}