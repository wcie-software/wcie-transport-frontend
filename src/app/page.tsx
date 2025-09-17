"use client"

import { useState } from "react";
import PhonePage from "@/app/ui/pages/phone";
import OTPPage from "@/app/ui/pages/otp";
import { ConfirmationResult } from "firebase/auth";

export default function Home() {
	const [phone, setPhone] = useState("");
	const [otpSent, setOtpSent] = useState(false)
	const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

	return (
		<>
		{!otpSent
			? <PhonePage 
				onCodeSent={(phone, result) => {
					setPhone(phone);
					setOtpSent(true);
					setConfirmationResult(result);
				}}
			/>
			: <OTPPage
				phoneNumber={phone}
				onCodeSubmitted={(code) => {
					if (confirmationResult != null) {
						confirmationResult.confirm(code).then((result) => {
							console.log("I'm logged in!");
							console.log(result.user);
							// Move to next screen
						}).catch((error) => {
							// Bad code show error message
							console.error(error);
						});
					}
				}}/>
		}
	</>
	);
}
