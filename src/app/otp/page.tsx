"use client"

import NumberInput from "@/app/ui/number_input";
import { useState } from "react";

export default function OTP() {
	const [code, setCode] = useState("");
	const [doneTyping, setDoneTyping] = useState(false);

	// Get phone number from url parameters
	// Go back to home screen if phone number is invalid
	// Listen for auth changes
	// Move to next screen when auth changes

	return (
		<div className="flex flex-col gap-1.5">
			<p className="text-lg font-semibold">Enter Code</p>
			<div className="flex flex-col gap-6 max-w-xl w-full justify-center items-start">
				<NumberInput
				maxLength={6}
				numberOfSpaces={1}
				placeholder="333 444"
				onChanged={(_) => {
					if (doneTyping) {
						setDoneTyping(false);
					}
				}}
				onComplete={(i) => {
					setCode(i)
					setDoneTyping(true);
				}}/>
				<button
					id="login-button"
					disabled={!doneTyping}
					className="bg-primary px-8 py-3 rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default"
					onClick={(_) => console.log("clicked")}>
					Login
				</button>
			</div>
		</div>
	);
}
