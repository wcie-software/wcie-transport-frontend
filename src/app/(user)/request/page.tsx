"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhonePage from "@/app/(user)/request/pages/phone";
import OTPPage from "@/app/(user)/request/pages/otp";
import AddressPage from "@/app/(user)/request/pages/address";
import { ConfirmationResult, User } from "firebase/auth";
import PlaceDetails from "@/app/models/place_details";
import { addUser, getUserLocation, setUserLocation } from "@/app/utils/firestore";

// TODO: Add loading
export default function Request() {
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

						const encodedPhone = encodeURIComponent(phone);
						const encodedToken = encodeURIComponent(token);
						const encodedName = encodeURIComponent(user!.displayName ?? "")
						const params = `?phone_number=${encodedPhone}&auth_token=${encodedToken}&name=${encodedName}`;

						router.replace(formURL + params);
					}
				}/>
			}
		</div>
	);
}
