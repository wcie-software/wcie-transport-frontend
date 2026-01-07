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
import { toast } from "sonner";
import { generateRoutes } from "@/app/utils/generate_routes";
import { auth } from "@/app/utils/firebase_setup/client";
import { Vehicle } from "@/app/models/vehicle";

// Lazy load map view
const MapView = dynamic(() => import(
	"@/app/admin/(dashboard)/assignments/views/map_view"),
	{ ssr: false } // Don't pre-render on server because it uses "window"
);

export default function AssignmentsView({ timestamp, requestsList, driversList, routes, assignedVehicles }: {
	timestamp: string,
	requestsList: TransportRequest[],
	driversList: Driver[],
	routes?: DriverRoute[],
	assignedVehicles?: Record<string, Vehicle>,
}) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { replace, refresh } = useRouter();

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

	async function beginRouteGeneration(): Promise<void> {
		const idToken = await auth.currentUser?.getIdToken();
		if (!idToken) {
			toast.error("Please refresh the page and re-login");
			setGenerationInProgress(false);
		} else {
			const res = await generateRoutes(timestamp, idToken);
			if (res.success) {
				setGenerationInProgress(false);
				refresh(); // Refresh page to show routes
			} else {
				toast.error(res.message);
				setGenerationInProgress(false);
			}
		}
	}

	return (
		<div className="relative w-full h-full">
			<div
				className="max-w-lg min-w-fit h-14 absolute top-0 right-0 m-4 p-2 z-[500] bg-tertiary rounded-lg flex flex-row gap-2 justify-between items-stretch text-foreground"
			>
				<SundayDatePicker
					date={chosenDate}
					onDateSelected={(date) => {
						setChosenDate(date);
						updateSearchParams("timestamp", date.toLocaleDateString("en-US").replaceAll("/", "-"));
					}}
					includeLabel={false}
				/>
				<ThemeProvider theme={MUITheme}>
					<Select
						className="flex-1 border-gray-200 dark:border-gray-600 rounded p-0 pe-2 outline-0"
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
				<PrimaryButton
					disabled={generationInProgress}
					onClick={async () => {
						setGenerationInProgress(true);
						const generationPromise = beginRouteGeneration();
						toast.promise(generationPromise, { loading: "Generating routes..." });
					}}
				>
					Generate Routes
				</PrimaryButton>
			</div>

			{/* <MapView
				requestPoints={requestsList}
				driverPoints={driversList}
				assignedVehicles={assignedVehicles}
				routes={routes}
			/> */}
		</div>
	);
}