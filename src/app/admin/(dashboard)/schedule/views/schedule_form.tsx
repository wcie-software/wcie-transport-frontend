"use client";

import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Checkbox, ListItemText, MenuItem, Select, ThemeProvider } from "@mui/material";
import { Schedule, ScheduleSchema } from "@/app/models/schedule";
import { useState } from "react";
import PrimaryButton from "@/app/ui/components/primary_button";
import { MUITheme, Constants } from "@/app/utils/util";
import { toast } from "sonner";
import SundayDatePicker from "@/app/ui/components/sunday_date_picker";

export function ScheduleForm({ defaultSchedule, driverOptions, onSubmitted, numberOfServices = 2 }: {
	defaultSchedule?: Schedule,
	driverOptions: Record<string, string>,
	onSubmitted: (schedule: Schedule) => void,
	numberOfServices?: number
}) {
	const nearestSunday = new Date();
	nearestSunday.setDate(nearestSunday.getDate() + (7 - nearestSunday.getDay()));

	const [chosenDate, setChosenDate] = useState<Date>(new Date(defaultSchedule?.timestamp ?? nearestSunday));
	// Get driver names for each service
	const [selectedDrivers, setSelectedDrivers] = useState<Record<number, string[]>>({
		1: defaultSchedule?.schedule["1"].map((id) => driverOptions[id]) ?? [],
		2: defaultSchedule?.schedule["2"].map((id) => driverOptions[id]) ?? [],
	});

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
			const validSchedule = ScheduleSchema.safeParse({
				timestamp: chosenDate.getTime(),
				schedule: {
					"1": selectedDrivers[1].map(getIdFromName),
					"2": selectedDrivers[2].map(getIdFromName),
				},
			});

			if (validSchedule.success) {
				onSubmitted(validSchedule.data);

				// Reset form data
				setChosenDate(nearestSunday);
				setSelectedDrivers({});

				return;
			}
		}

		toast.error("Invalid schedule.");
	}


	return (
		<form className="flex flex-col gap-2" onSubmit={formSubmitted}>
			<SundayDatePicker
				date={chosenDate}
				onDateSelected={setChosenDate}
			/>
			{/* Dropdowns */}
			{Array.from({ length: numberOfServices }).map((_, index) => {
				const serviceNumber = index + 1;

				return (
					<div key={index} className="flex flex-col gap-0.5 py-2 items-baseline justify-start">
						<label htmlFor={`drivers-${serviceNumber}`} className="text-xs">
							{/* e.g., Select 1st Service Drivers */}
							Select {serviceNumber}{Constants.NUMBER_SUFFIX[serviceNumber]} Service Drivers
						</label>
						{/* Multi-select dropdown from mui */}
						<ThemeProvider theme={MUITheme}>
							<Select
								className="w-full border-gray-200 dark:border-gray-600 rounded p-0 pe-2 outline-0 text-foreground"
								name={`drivers-${serviceNumber}`}
								id={`drivers-${serviceNumber}`}
								IconComponent={() => <ChevronDownIcon width={20} height={20} />}
								multiple // Allow multiple selections
								value={selectedDrivers[serviceNumber] || []}
								onChange={(e) => {
									const value = e.target.value;
									// Update selections ui
									setSelectedDrivers({
										...selectedDrivers,
										// Value would look like "a,b,c,d"
										[serviceNumber]: String(value).split(","),
									});
								}}
								// Define the style of dropdown menu
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
						</ThemeProvider>
					</div>
				);
			})}
			<div className="ml-auto">
				<PrimaryButton type="submit">Done</PrimaryButton>
			</div>
		</form>
	);
}