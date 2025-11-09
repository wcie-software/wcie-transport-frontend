"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhonePage from "@/app/(user)/login/pages/phone";
import OTPPage from "@/app/(user)/login/pages/otp";
import { ConfirmationResult } from "firebase/auth";
import { userLogin } from "@/app/utils/login";
import { FirebaseError } from "firebase/app";

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
								const idToken = await result.user.getIdToken();

								try {
									const userRole = await userLogin(idToken);
									if (userRole == "driver") {
										router.push("/driver");
									} else {
										router.push("/request");
									}
								} catch (e) {
									if (e instanceof FirebaseError) {
										throw e;
									} else {
										console.log(e);
										// TODO: Handle errors
										// router.refresh();
									}
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
