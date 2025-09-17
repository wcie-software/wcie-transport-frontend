"use client"

import NumberInput from "@/app/ui/number_input";
import { useEffect, useState } from "react";
import { auth } from "@/app/utils/firebase.browser";
import { RecaptchaVerifier, ConfirmationResult, signInWithPhoneNumber } from "firebase/auth";

export default function PhonePage({ onCodeSent }:
	{ onCodeSent?: (phoneNumber: string, result: ConfirmationResult) => void }
) {
	const [phone, setPhone] = useState("");
	const [status, setStatus] = useState("typing");
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
		<div className="flex flex-col gap-1.5">
			<p className="text-lg font-semibold">Enter Phone Number</p>
			<div className="flex flex-col gap-6 max-w-xl w-full justify-center items-start">
				<NumberInput
					maxLength={10}
					prefix="+1"
					placeholder="780 966 2026"
					onChanged={(_) => {
						if (status !== "typing") {
							setStatus("typing");
						}
					}}
					onComplete={(i) => {
						setPhone(i)
						setStatus("done-typing");
					}}
				/>
				<div className="flex flex-row items-center justify-between">
					<div id="recaptcha-id"></div>
					<button
						id="login-button"
						disabled={status !== "done-typing"}
						className="bg-primary px-8 py-3 rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default"
						onClick={(_) => {
							setStatus("loading");

							signInWithPhoneNumber(auth, phone, recaptchaVerifier)
								.then((confirmationResult) => {
									onCodeSent?.(phone, confirmationResult);
								}).catch((err) => {
									setStatus("error")
									console.error(err);
								});
						}}>
						Login
					</button>
				</div>
			</div>
		</div>
	);
}
