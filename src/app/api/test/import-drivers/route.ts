import { getFirebaseAdmin } from "@/app/utils/firebase_setup/server";
import { NextRequest } from "next/server";
import { FirestoreCollections } from "@/app/utils/firestore";
import { Driver } from "@/app/models/driver";

const driversData: Driver[] = [
	{ documentId: '4ifLImldRb7SVhU8pPzv', full_name: 'Lanre Ojurongbe', email: 'lojurongbe@gmail.com', phone_number: '+14384835776', address: '4083 Allan Crescent Southwest, Edmonton, AB T6W 2J9, Canada', location: { latitude: 53.429628, longitude: -113.6015455 }, driver_license_class: 'Class 5', comments: '' },
	{ documentId: '6qynSYjIwiK8Y5XfnHti', full_name: 'Olasunkanmi Yomi-Ola', email: 'yurmmy.ola@gmail.com', phone_number: '+14388359511', address: '1856 104 Street Northwest, Edmonton, AB T6J 5G7, Canada', location: { latitude: 53.4487149, longitude: -113.4946566 }, driver_license_class: 'Class 5', comments: '' },
	{ documentId: '7nuBxYPDskRA2HvKUS65', full_name: 'Tunji Adebayo', email: 'babatunji.adebayo@gmail.com', phone_number: '+17808073861', address: '4811 147 Ave NW, Edmonton, AB T5Y 2X2, Canada', location: { latitude: 53.609786299999996, longitude: -113.4156156 }, driver_license_class: 'Class 5', comments: '' },
	{ documentId: 'GWGEAibmHRTGcNKmoCI9', full_name: 'Oluwaseyi Oyadeyi', email: 'oyasey83@gmail.com', phone_number: '+18254595475', address: '34 Penn Place, Spruce Grove, AB T7X 2W6, Canada', location: { latitude: 53.5618243, longitude: -113.8578355 }, driver_license_class: 'Class 5', comments: '' },
	{ documentId: 'O5aN49VxKCi7yDneQ7aP', full_name: 'Olaniran Johnson', email: 'ola.johnsean@gmail.com', phone_number: '+17808602845', address: '3503 James Mowatt Trail Southwest, Edmonton, AB T6W 3N4, Canada', location: { latitude: 53.4006751, longitude: -113.5394281 }, driver_license_class: 'Class 5', comments: '' },
	{ documentId: 'O7GrbqQ4W3gttT06tHKA', full_name: 'Adeyemi Ogundipe', email: 'yemi.keke2023@gmail.com', phone_number: '+15877849980', address: '6887 Evans Wynd Northwest, Edmonton, AB T6M 0P9, Canada', location: { latitude: 53.4743645, longitude: -113.66970529999999 }, driver_license_class: 'Class 5', comments: 'Good' },
	{ documentId: 'WMUubGhdaB0iakCbR9J8', full_name: 'Jennifer Esenwa', email: 'pj.esenwalaw@gmail.com', phone_number: '+15878731045', address: '3917 167A Avenue Northwest, Edmonton, AB T5Y 0X9, Canada', location: { latitude: 53.6274973, longitude: -113.4013944 }, driver_license_class: 'Class 5', comments: 'I can use my own vehicle to pick up.' },
	{ documentId: 'cLBbpJ5hgmocG7qcLMdH', full_name: 'Tunde Stephen Atseyinku', email: 'stephenatseyinku@gmail.com', phone_number: '+18258652925', address: '15820 19th Avenue Southwest, Edmonton, AB T6W 5E2, Canada', location: { latitude: 53.41654510000001, longitude: -113.59599419999999 }, driver_license_class: 'Class 1', comments: 'Currently out of the city.' },
	{ documentId: 'iEvi3KStL2zm5HDRrTjO', full_name: 'Oluwagbenga Aina', email: 'adediran8@gmail.com', phone_number: '+16136982074', address: '8818 223 Street Northwest, Edmonton, AB T5T 7H2, Canada', location: { latitude: 53.5227487, longitude: -113.70093849999999 }, driver_license_class: 'Class 5', comments: '' },
	{ documentId: 'mC0q7Nw9oc8sgSK5RFXG', full_name: 'Timothy Adebayo', email: 'atimothyadebayo@gmail.com', phone_number: '+18258896118', address: '13803 109 Ave #211, Northwest Edmonton, Edmonton, AB T5M 2G9, Canada', location: { latitude: 53.5544385, longitude: -113.5598532 }, driver_license_class: 'Class 5', comments: '' },
	{ documentId: 'sn51LHT3z6LB7VvjxHb6', full_name: 'Yemisi Olatunji', email: 'olatunjims15@gmail.com', phone_number: '+16047268334', address: '10605 112 Street Northwest, Edmonton, AB T5H 3G9, Canada', location: { latitude: 53.550154299999996, longitude: -113.51343159999999 }, driver_license_class: 'Class 5', comments: 'Thank you ' },
	{ documentId: 'un0pagZN77SBvo3skRfU', full_name: 'Alaidanengia (Ala), Hart', email: 'alaidanengiahart@gmail.com', phone_number: '+14036800673', address: '429 Roberts Crescent, Leduc, AB T9E 1N4, Canada', location: { latitude: 53.2400485, longitude: -113.50404669999999 }, driver_license_class: 'Class 5', comments: 'Just moved in from BC late June, still with my BC license but will convert to Alberta' },
	{ documentId: 'zUNPU84ndF3rU3zmsULZ', full_name: 'Osaro Ogbeide', email: 'osaintups7@gmail.com', phone_number: '+15877787610', address: '9168 Cooper Crescent Southwest, Edmonton, AB T6W 3L1, Canada', location: { latitude: 53.4005478, longitude: -113.5864838 }, driver_license_class: 'Class 1', comments: '' }
];


export async function GET(req: NextRequest) {
	if (process.env.NODE_ENV !== "development") {
		return new Response("Not allowed", { status: 403 });
	}

	const { db } = await getFirebaseAdmin();
	const drivers = db.collection(FirestoreCollections.Drivers);
	
	for (const driver of driversData) {
		const id = driver.documentId!;

		try {
			delete driver.documentId;
			await drivers.doc(id).set(driver);
			console.log(`Imported driver: ${driver.full_name}`);
		} catch (e) {
			console.error(`Error importing driver ${driver.full_name}: ${e}`);
		}
	}
		
	return new Response("Done");
}