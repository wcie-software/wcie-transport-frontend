"use client"

import { useEffect, useState } from "react";
import { auth } from "@/app/utils/firebase_setup/client";
import { RecaptchaVerifier, ConfirmationResult, signInWithPhoneNumber } from "firebase/auth";
import CollectNumber from "@/app/ui/components/collect_number";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";

export default function PhonePage({ onCodeSent }:
	{ onCodeSent?: (phoneNumber: string, result: ConfirmationResult) => void }
) {
	const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier>();

	useEffect(() => {
		setRecaptchaVerifier(new RecaptchaVerifier(auth, "recaptcha-id", {
			"size": "normal",
			"expired-callback": () => {
				toast.error(`reCAPTCHA has expired. Please refresh the page.`);
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
							if (err instanceof FirebaseError) {
								toast.error(`Unable to process login: ${err.message}. Please try again later.`)
							} else {
								toast.error("Unexpected error. Please refresh the page.");
							}
							console.error(err);
						});
				}}
			/>
			<div id="recaptcha-id" className="ml-auto"></div>
		</div>
	);
}
