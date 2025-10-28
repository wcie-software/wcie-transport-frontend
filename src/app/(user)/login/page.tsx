"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhonePage from "@/app/(user)/login/pages/phone";
import OTPPage from "@/app/(user)/login/pages/otp";
import { ConfirmationResult } from "firebase/auth";
import { FirestoreCollections, getDocument } from "@/app/utils/firestore";
import { Role as UserRole, UserRoleSchema } from "@/app/models/role";

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
								// const userRole = await getDocument(
								// 	FirestoreCollections.UserRoles,
								// 	user.uid,
								// 	UserRoleSchema
								// ) as UserRole;

								// if (userRole && userRole.role == "driver") {
								// 	router.push("/driver");
								// } else {
								// 	router.push("/request");
								// }
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
