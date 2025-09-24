"use client"

import { useState } from "react";
import PhonePage from "@/app/ui/pages/phone";
import OTPPage from "@/app/ui/pages/otp";
import { ConfirmationResult } from "firebase/auth";

export default function Home() {
	const [phone, setPhone] = useState("");
	const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
	const [status, setStatus] = useState("login");

	return (
		<div className="max-w-2xl">
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
								setStatus("correct-code");
							}).catch((error) => {
								// Bad code show error message
								console.error(error);
							});
						}
					}}
				/>
			}
		</div>
	);
}
