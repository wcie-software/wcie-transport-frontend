"use client"

import PrimaryButton from "@/app/ui/components/primary_button";
import { useState, FormEvent } from "react";
import { EMAIL_LOCALSTORAGE_KEY } from "@/app/utils/constants";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/app/utils/firebase_setup/client";

async function sendEmailLink(emailAddress: string) {
	try {
		await sendSignInLinkToEmail(auth, emailAddress, {
			url: `${process.env.NEXT_PUBLIC_DEBUG_URL ?? "https://transport.wcie.app"}/admin`,
			handleCodeInApp: true,
			// linkDomain: "transport.wcie.app"
		});
	} catch (e) {
		console.error(e);
		return false;
	}

	return true;
}

export default function AdminLogin() {
	const [status, setStatus] = useState("default");
	const [email, setEmail] = useState("");

	async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const formElement = e.target as HTMLFormElement;
		if (formElement.checkValidity()) {
			const emailAddr = formElement.email.value;
			const endsWithADotSomething = /\.[a-z]+$/;
			if (emailAddr && endsWithADotSomething.test(emailAddr)) {
				const linkSent = await sendEmailLink(emailAddr);
				if (linkSent) {
					setStatus("link-sent");
					setEmail(emailAddr);
					localStorage.setItem(EMAIL_LOCALSTORAGE_KEY, emailAddr);
				} else {
					// Show error
					console.log("Something went wrong");
				}
			}
		}
	}

	return (
		<>
			{status === "default" &&
				<div>
					<div className="flex flex-col">
						<p className="text-lg font-semibold">Enter Your Email</p>
						<p className="text-gray-400">We will send you a magic link.</p>
					</div>
					<form
						onSubmit={handleFormSubmit}
						className="flex flex-col items-start gap-4 mt-2"
					>
						<input 
							type="email"
							name="email"
							placeholder="name@gmail.com"
							required
							className="outline-0 placeholder-gray-500 truncate w-full text-3xl md:text-4xl font-bold"
						/>
						<PrimaryButton type="submit">Login</PrimaryButton>
					</form>
				</div>
			}
			{status === "link-sent" &&
				<div className="flex flex-col gap-1">
					<p className="text-4xl font-semibold">Check your inbox</p>
					<p className="text-gray-400 text-xl">
						We sent a magic link to your email "<span className="font-bold">{email}</span>". Use that to sign in. The link expires
						in an hour.
					</p>
				</div>
			}
		</>
	);
}