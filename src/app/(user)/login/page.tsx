import { useState } from "react";
import PhonePage from "@/app/(user)/login/pages/phone";
import OTPPage from "@/app/(user)/login/pages/otp";
import { ConfirmationResult, User } from "firebase/auth";

export default function LoginPage({ onSuccess, onFailure }: 
	{ onSuccess?: (user: User) => void, onFailure?: (error: any) => void }
) {
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
								// TODO: Decide URL after login
							}).catch((error) => {
								onFailure?.(error);
							});
						}
					}}
				/>
			}
		</div>
	);
}
