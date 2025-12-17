"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L, { LatLngExpression } from "leaflet";
import { TransportRequest } from '@/app/models/request';
import { Driver } from '@/app/models/driver';
import { DriverRoutes } from '@/app/models/fleet_route';

export default function MapView({ requestPoints, driverPoints, routes }: {
	requestPoints: TransportRequest[],
	driverPoints?: Driver[],
	routes?: DriverRoutes
}) {
	const churchPosition: LatLngExpression = { lat: 53.5461888, lng: -113.4886912 };
	const markerIcon = L.icon({
		iconUrl: "/icons/marker.png",
		iconRetinaUrl: "/icons/marker@2x.png",
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -28]
	});
	const churchIcon = L.icon({
		iconUrl: "/icons/church-marker.png",
		iconRetinaUrl: "/icons/church-marker@2x.png",
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -28],
	});
	const carIcon = L.icon({
		iconUrl: "/icons/car-marker.png",
		iconRetinaUrl: "/icons/car-marker@2x.png",
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -28],
	});

	function getPolylines() {
		if (routes == null) {
			return [];
		}

		const polylines = [];
		for (const r of routes.routes) {
			const route = r.route;
			for (let i = 0; i < route.length; i += 1) {
				polylines.push(
					<Polyline
						positions={[
							{lat: route[i].point.latitude, lng: route[i].point.longitude},
							{lat: route[i+1].point.latitude, lng: route[i+1].point.longitude},
						]}
					/>
				);
			}
		}

		return polylines;
	}

	return (
		<MapContainer
			center={churchPosition}
			zoom={10}
			className="h-full w-full outline-none border-none"
		>
			<TileLayer
				attribution="&copy; OpenStreetMap contributors"
				// url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				// url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png"
				url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png"
			/>
			<Marker position={churchPosition} icon={churchIcon}>
				<Popup>Winners Chapel International Edmonton</Popup>
			</Marker>
			{...getPolylines()}
			{requestPoints.map((r) => (
				<Marker
					key={r.documentId}
				 	icon={markerIcon}
					position={{lat: r.coordinates!.latitude, lng: r.coordinates!.longitude }}
				>
					<Popup>
						Rider: {r.full_name} ({r.phone_number})<br />
						Address: {r.address}
					</Popup>
				</Marker>
			))}
			{driverPoints && driverPoints.map((d) => (
				<Marker
					key={d.documentId}
				 	icon={carIcon}
					position={{lat: d.location!.latitude, lng: d.location!.longitude }}
				>
					<Popup>
						Driver: {d.full_name} ({d.phone_number})<br />
						Address: {d.address}
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}