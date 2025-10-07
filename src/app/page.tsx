"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhonePage from "@/app/ui/pages/phone";
import OTPPage from "@/app/ui/pages/otp";
import AddressPage from "@/app/ui/pages/address";
import { ConfirmationResult, User } from "firebase/auth";
import PlaceDetails from "@/app/models/place_details";
import { addUser, getUserLocation, setUserLocation } from "@/app/utils/firestore";

// TODO: Add loading
export default function Home() {
	const router = useRouter();

	const [phone, setPhone] = useState("");
	const [user, setUser] = useState<User | null>(null);
	const [address, setAddress] = useState("");
	const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
	const [status, setStatus] = useState("login");

	return (
		<div className="max-w-2xl w-full">
			{status === "login" &&
				 <PhonePage 
					onCodeSent={(phone, result) => {
						setPhone(phone);
						setStatus("code-sent");
						setConfirmationResult(result);
					}}
				/>
			}
			{status === "code-sent" &&
				<OTPPage
					phoneNumber={phone}
					onCodeSubmitted={(code) => {
						if (confirmationResult != null) {
							confirmationResult.confirm(code).then(async (result) => {
								const user = result.user;
								setUser(user); addUser(user);
								setAddress(await getUserLocation(user.uid));
								
								setStatus("correct-code");
							}).catch((error) => {
								// Bad code show error message
								console.error(error);
							});
						}
					}}
				/>
			}
			{status === "correct-code" &&
				<AddressPage
				 	defaultAddress={address}
					onSelected={async (id, text) => {
						if (user == null) {
							// TODO: Show error
							setStatus("login");
							return;
						}

						const res = await fetch(`/api/coordinates?placeId=${id}`);
						const details = await res.json() as PlaceDetails;
						await setUserLocation(user!.uid, details, text);

						const token = await user!.getIdToken();

						const formURL = "https://wcie.fillout.com/transport";
						const params = `?phone_number=${phone}&auth_token=${token}&name=${user!.displayName ?? ""}`;

						router.replace(formURL + params);
					}
				}/>
			}
		</div>
	);
}
