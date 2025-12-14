"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L, { LatLngExpression } from "leaflet";
import { TransportRequest } from '@/app/models/request';
import { Driver } from '@/app/models/driver';

export default function MapView({ requestPoints, driverPoints }: {
	requestPoints: TransportRequest[],
	driverPoints: Driver[],
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

	const assignments = {"assignments":[{"routes":[{"route":[{"coordinates":{"latitude":53.550154299999996,"longitude":-113.51343159999999},"id":"sn51LHT3z6LB7VvjxHb6"},{"coordinates":{"latitude":53.5424861,"longitude":-113.5854844},"id":"dLJ6jETbNEatOUzJhmBd"},{"coordinates":{"latitude":53.632868599999995,"longitude":-113.52280959999999},"id":"1ePYpawQlMrVjEyS2eUI"},{"coordinates":{"latitude":53.5982756,"longitude":-113.4845477},"id":"hPQhL9WeXofCjJF1cd2w"}],"total_time":60,"vehicle":{"active":true,"documentId":"GCeUkavrmXxE52JPAEaK","fuel_cost":null,"last_fuel_date":null,"last_maintenance_date":null,"maintenance_receipt_amount":null,"maintenance_type":null,"name":"Ford Van","plate_number":"WCIE 1","remarks":"","seating_capacity":11,"year":2022}}],"service_number":2},{"routes":[{"route":[{"coordinates":{"latitude":53.5227487,"longitude":-113.70093849999999},"id":"iEvi3KStL2zm5HDRrTjO"},{"coordinates":{"latitude":53.5142692,"longitude":-113.70090289999999},"id":"hDv7lcEXTt0Uta7Hif7M"},{"coordinates":{"latitude":53.6391816,"longitude":-113.4413299},"id":"heGtosgpdNCyPY0ZdUjY"},{"coordinates":{"latitude":53.6086472,"longitude":-113.41133389999999},"id":"ccexNRSfxZ22BvyyjEGo"},{"coordinates":{"latitude":53.592434399999995,"longitude":-113.38898119999999},"id":"eo36eaO6Y0kGbv0XH229"},{"coordinates":{"latitude":53.5459943,"longitude":-113.47891039999999},"id":"pMrKBYjJmnuDK1hOMdS4"}],"total_time":64,"vehicle":{"active":true,"documentId":"GCeUkavrmXxE52JPAEaK","fuel_cost":null,"last_fuel_date":null,"last_maintenance_date":null,"maintenance_receipt_amount":null,"maintenance_type":null,"name":"Ford Van","plate_number":"WCIE 1","remarks":"","seating_capacity":11,"year":2022}},{"route":[{"coordinates":{"latitude":53.4005478,"longitude":-113.5864838},"id":"zUNPU84ndF3rU3zmsULZ"},{"coordinates":{"latitude":53.4212628,"longitude":-113.43482549999999},"id":"H8Xzah68buQ8ywuJEN9u"},{"coordinates":{"latitude":53.4411926,"longitude":-113.3839718},"id":"1ZfXuxXSLkBwLfzT8dJB"},{"coordinates":{"latitude":53.5385074,"longitude":-113.4942986},"id":"eRsaf9BZT5JcxHQ2HjeM"}],"total_time":62,"vehicle":{"active":true,"documentId":"UAJGnZ8rNa6wDVfWmwkW","fuel_cost":null,"last_fuel_date":null,"last_maintenance_date":null,"maintenance_receipt_amount":null,"maintenance_type":null,"name":"Toyota Sienna","plate_number":"BSG-9052","remarks":"","seating_capacity":7,"year":2005}}],"service_number":1}]};
	
	function getPolylines() {
		const polylines = [];

		const ass = assignments["assignments"][1]["routes"];
		for (const a of ass) {
			const routes = a["route"];
			for (let i = 0; i < routes.length; i += 1) {
				if (i + 1 == routes.length) {
					polylines.push(
						<Polyline positions={[
							{lat: routes[i]["coordinates"]["latitude"], lng: routes[i]["coordinates"]["longitude"]},
							churchPosition
						]} color='lime'>
						</Polyline>
					);
				} else {
					polylines.push(
						<Polyline positions={[
							{lat: routes[i]["coordinates"]["latitude"], lng: routes[i]["coordinates"]["longitude"]},
							{lat: routes[i+1]["coordinates"]["latitude"], lng: routes[i+1]["coordinates"]["longitude"]},
						]}>
							<Tooltip direction="bottom" offset={[0, 20]} opacity={1} permanent>
								{i + 1}
							</Tooltip>
						</Polyline>
					);
				}
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
			{driverPoints.map((d) => (
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