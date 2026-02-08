"use client";

import dynamic from "next/dynamic";
import { TransportRequest } from "@/app/models/request";
import { Driver } from "@/app/models/driver";
import { DriverRoute } from "@/app/models/fleet_route";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { generateRoutes } from "@/app/actions/generate_routes";
import { auth } from "@/app/utils/firebase_client";
import { Vehicle } from "@/app/models/vehicle";
import AssignmentsControlPanel from "./components/assignments_control_panel";
import AssignmentsRouteEditor from "./components/assignments_route_editor";

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

	const nearestSunday = searchParams.has("timestamp")
		? new Date(searchParams.get("timestamp")!)
		: new Date();
	if (nearestSunday.getDay() !== 0) {
		nearestSunday.setDate(nearestSunday.getDate() + (7 - nearestSunday.getDay()));
	}

	const [serviceNumber, setServiceNumber] = useState(
		searchParams.get("service_number") ?? "1");
	const [chosenDate, setChosenDate] = useState(nearestSunday);
	const [generationInProgress, setGenerationInProgress] = useState(false);
	const [displayRoutes, setDisplayRoutes] = useState(routes ?? []);

	function updateSearchParams(key: string, value: string): void {
		const params = new URLSearchParams(searchParams);
		params.set(key, value);
		replace(`${pathname}?${params.toString()}`);
	}

	async function beginRouteGeneration(): Promise<void> {
		// We authenticate the route generation microservice with the user's JWT
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
			{/* Floating panel for selecting date and service, ang generating routes */}
			<AssignmentsControlPanel
				chosenDate={chosenDate}
				onDateSelected={(date) => {
					setChosenDate(date);
					// Update timestamp param to chosen date in M-D-YYYY format
					updateSearchParams("timestamp", date.toLocaleDateString("en-US").replaceAll("/", "-"));
				}}
				serviceNumber={serviceNumber}
				onServiceNumberChange={(newServiceNumber) => {
					setServiceNumber(newServiceNumber);
					updateSearchParams("service_number", newServiceNumber);
				}}
				generationInProgress={generationInProgress}
				onGenerateRoutes={() => {
					setGenerationInProgress(true);
					toast.promise(beginRouteGeneration(), { loading: "Generating routes..." });
				}}
			/>

			<div className="absolute bottom-0 right-0 my-4 z-500 flex flex-col gap-3">
				<AssignmentsRouteEditor
				 	key={timestamp}
					timestamp={timestamp}
					serviceNumber={parseInt(serviceNumber)}
					driversList={driversList}
					assignedVehicles={assignedVehicles}
					requests={requestsList}
					routes={routes}
					onRoutesChange={(nextRoutes) => setDisplayRoutes(nextRoutes)}
				/>
			</div>

			<MapView
				// Update map view anytime date or service number changes
				key={"MapView " + timestamp + serviceNumber}
				requestPoints={requestsList}
				driverPoints={driversList}
				assignedVehicles={assignedVehicles}
				routes={displayRoutes}
			/>
		</div>
	);
}
