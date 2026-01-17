"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhonePage from "@/app/(user)/login/pages/phone";
import OTPPage from "@/app/(user)/login/pages/otp";
import { ConfirmationResult } from "firebase/auth";
import { userLogin } from "@/app/utils/login";
import { toast } from "sonner";

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
								try {
									const idToken = await result.user.getIdToken();
									const { role: userRole } = await userLogin(idToken);
									if (userRole === "driver") {
										router.push("/driver");
									} else {
										router.push("/request");
									}
								} catch (e) {
									console.error(e);
									toast.error("Login failed. Please enter your phone number again.");
									setStatus("login");
								}
							}).catch((error) => {
								toast.error("Incorrect code. Please try again.");
							});
						} else {
							toast.error("We were unable to send an OTP. Please enter your phone number again.");
							setStatus("login");
						}
					}}
				/>
			}
		</div>
	);
}
