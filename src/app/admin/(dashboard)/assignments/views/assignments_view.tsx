"use client";

import dynamic from "next/dynamic";
import { TransportRequest } from "@/app/models/request";
import { Driver } from "@/app/models/driver";
import { DriverRoute } from "@/app/models/fleet_route";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { MenuItem, Select, SelectChangeEvent, ThemeProvider } from "@mui/material";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { MUITheme } from "@/app/utils/constants";
import SundayDatePicker from "@/app/ui/components/sunday_date_picker";
import PrimaryButton from "@/app/ui/components/primary_button";

// Lazy load map view
const MapView = dynamic(() => import(
	"@/app/admin/(dashboard)/assignments/views/map_view"),
	{ ssr: false } // Don't pre-render on server because it uses "window"
);

export default function AssignmentsView({ timestamp, requestsList, driversList, routes }: {
	timestamp: string,
	requestsList: TransportRequest[],
	driversList: Driver[],
	routes?: DriverRoute[]
}) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { replace } = useRouter();

	const nearestSunday = new Date(searchParams.get("timestamp") ?? new Date());
	if (nearestSunday.getDay() !== 0) {
		nearestSunday.setDate(nearestSunday.getDate() + (7 - nearestSunday.getDay()));
	}

	const [serviceNumber, setServiceNumber] = useState(
		searchParams.get("service_number") ?? "1");
	const [chosenDate, setChosenDate] = useState(nearestSunday);
	const [generationInProgress, setGenerationInProgress] = useState(false);

	function updateSearchParams(key: string, value: string): void {
		const params = new URLSearchParams(searchParams);
		params.set(key, value);
		replace(`${pathname}?${params.toString()}`);
	}

	return (
		<div className="relative w-full h-full text-white">
			<div className="max-w-lg absolute top-0 right-0 m-4 flex flex-col gap-4 justify-start items-center z-[500]">
				<div className="flex flex-row gap-2 justify-between items-center">
					<div className="flex-1 bg-gray-800 rounded">
						<SundayDatePicker
							date={chosenDate}
							onDateSelected={(date) => {
								setChosenDate(date);
								updateSearchParams("timestamp", date.toLocaleDateString("en-US").replaceAll("/", "-"));
							}}
							includeLabel={false}
						/>
					</div>
					<ThemeProvider theme={MUITheme}>
						<Select
							className="flex-1 border-gray-200 dark:border-gray-600 rounded p-0 pe-2 outline-0 bg-gray-800"
							size="small"
							value={serviceNumber}
							IconComponent={() => <ChevronDownIcon width={20} height={20} />}
							onChange={(e: SelectChangeEvent) => {
								const newServiceNumber = e.target.value;
								setServiceNumber(newServiceNumber);

								updateSearchParams("service_number", newServiceNumber);
							}}
						>
							<MenuItem value={1}>1st Service</MenuItem>
							<MenuItem value={2}>2nd Service</MenuItem>
						</Select>
					</ThemeProvider>
				</div>

				<PrimaryButton onClick={() => {
					fetch("https://find-optimal-routes-dsplgp4a2a-uc.a.run.app", {
						method: "POST",
						body: JSON.stringify({ timestamp: timestamp }),
						headers: { "X-Auth-Token": "" }
					})
					setGenerationInProgress(true);
				}}>
					{generationInProgress ? "Generating..." : "Generate Routes"}
				</PrimaryButton>
			</div>

			<MapView
				requestPoints={requestsList}
				driverPoints={driversList}
				routes={routes}
			/>
		</div>
	);
}