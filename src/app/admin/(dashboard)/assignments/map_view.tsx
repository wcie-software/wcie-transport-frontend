"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L, { LatLngExpression } from "leaflet";
import { TransportRequest } from '@/app/models/request';

export default function MapView(
	{ requestPoints, }: { requestPoints: TransportRequest[], }
) {
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

	return (
		<MapContainer
			center={churchPosition}
			zoom={15}
			className="h-full w-full rounded outline-none border-none"
			scrollWheelZoom={false}
		>
			<TileLayer
				// OpenStreetMap tile source
				attribution="&copy; OpenStreetMap contributors"
				// url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				// url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png"
				url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png"
			/>
			<Marker position={churchPosition} icon={churchIcon}>
				<Popup>Winners Chapel International Edmonton</Popup>
			</Marker>
			<Polyline positions={[
				churchPosition,
				{lat: requestPoints[0].coordinates!.latitude, lng: requestPoints[0].coordinates!.longitude }
			]}>
				<Popup>
					scsd
				</Popup>
			</Polyline>
			{requestPoints.map((r) => (
				<Marker
					key={r.documentId}
				 	icon={markerIcon}
					position={{lat: r.coordinates!.latitude, lng: r.coordinates!.longitude }}
				>
					<Popup>
						Full Name: {r.full_name} ({r.phone_number})<br />
						Address:{r.address}
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}