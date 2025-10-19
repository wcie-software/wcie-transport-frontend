"use client"

import { useEffect, useState } from "react";
import { auth } from "@/app/utils/firebase";
import { RecaptchaVerifier, ConfirmationResult, signInWithPhoneNumber } from "firebase/auth";
import CollectNumber from "@/app/ui/components/collect_number";

export default function PhonePage({ onCodeSent }:
	{ onCodeSent?: (phoneNumber: string, result: ConfirmationResult) => void }
) {
	const [verified, setVerified] = useState(false);
	const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier>();

	useEffect(() => {
		setRecaptchaVerifier(new RecaptchaVerifier(auth, "recaptcha-id", {
			"size": "normal",
			"callback": (response: any) => {
				console.log("Ready to rumble");
				setVerified(true);
			},
			"expired-callback": () => {
				setVerified(false);
				console.log("Expired");
			}
		}));
	}, [auth]);

	return (
		<div className="flex flex-col">
			<CollectNumber
				title="Enter Your Phone Number"
				caption="We will send you a code"
				prefix="+1"
				placeholder="780 123 4567"
				buttonText="Continue"
				onSubmitted={(phone) => {
					signInWithPhoneNumber(auth, phone, recaptchaVerifier)
						.then((confirmationResult) => {
							onCodeSent?.(phone, confirmationResult);
						}).catch((err) => {
							console.error(err);
						});
				}}
			/>
			<div id="recaptcha-id" className="ml-auto"></div>
		</div>
	);
}
