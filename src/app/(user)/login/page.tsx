"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhonePage from "@/app/(user)/login/pages/phone";
import OTPPage from "@/app/(user)/login/pages/otp";
import { ConfirmationResult } from "firebase/auth";
import { userLogin } from "@/app/utils/login";
import { FirebaseError } from "firebase/app";
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
								const idToken = await result.user.getIdToken();

								try {
									const { role: userRole } = await userLogin(idToken);
									if (userRole === "driver") {
										router.push("/driver");
									} else {
										router.push("/request");
									}
								} catch (e) {
									if (e instanceof FirebaseError) {
										throw e;
									} else {
										console.log(e);
										toast.error("Login failed. Please try again.");
										setStatus("login");
									}
								}
							}).catch((error) => {
								toast.error("Incorrect code. Please try again.");
							});
						}
					}}
				/>
			}
		</div>
	);
}
