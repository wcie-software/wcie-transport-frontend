"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhonePage from "@/app/ui/pages/phone";
import OTPPage from "@/app/ui/pages/otp";
import AddressPage from "@/app/ui/pages/address";
import { ConfirmationResult } from "firebase/auth";
import Coordinates from "@/app/models/coordinates";

// TODO: Add loading
export default function Home() {
	const router = useRouter();

	const [phone, setPhone] = useState("");
	const [token, setToken] = useState("");
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
								console.log("I'm logged in!");
								setToken(await result.user.getIdToken());
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
					onSelected={async (id) => {
						const res = await fetch(`/api/coordinates?placeId=${id}`);
						const coord = await res.json() as Coordinates;
						console.log(coord);

						const formURL = "https://wcie.fillout.com/transport";
						const params = `?phone_number=${phone}&latitude=${coord.latitude}&longitude=${coord.longitude}&auth_token=${token}&name=Oba`;

						router.replace(formURL + params);
					}
				}/>
			}
		</div>
	);
}
