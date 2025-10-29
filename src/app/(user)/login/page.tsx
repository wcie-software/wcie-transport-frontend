"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhonePage from "@/app/(user)/login/pages/phone";
import OTPPage from "@/app/(user)/login/pages/otp";
import { ConfirmationResult } from "firebase/auth";

export default function LoginPage() {
	const router = useRouter();

	const [phone, setPhone] = useState("");
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
								const idToken = await user.getIdToken();

								const res = await fetch("/api/login", {
									method: "POST",
									body: JSON.stringify({ idToken: idToken })
								});

								if (res.ok) {
									const { role } = await res.json();
									if (role == "driver") {
										router.push("/driver");
									} else {
										router.push("/request");
									}
								} else {
									console.error(await res.text());
								}
							}).catch((error) => {
								console.error(error);
							});
						}
					}}
				/>
			}
		</div>
	);
}
