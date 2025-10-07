export default interface PlaceDetails {
	googleMapsUri: string;
	location: Coordinates;
}

export interface Coordinates {
	latitude: number;
	longitude: number;
}