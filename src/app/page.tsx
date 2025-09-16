"use client"

import NumberInput from "@/app/ui/number_input";
import { sendOTP } from "@/app/utils/login";
import { useState } from "react";

export default function Home() {
	const [phone, setPhone] = useState("");
	const [doneTyping, setDoneTyping] = useState(false);

	return (
		<div className="flex flex-col gap-1.5">
			<p className="text-lg font-semibold">Enter Phone Number</p>
			<div className="flex flex-col gap-6 max-w-xl w-full justify-center items-start">
				<NumberInput
					maxLength={10}
					prefix="+1"
					placeholder="780 966 2026"
					onChanged={(_) => {
						if (doneTyping) {
							setDoneTyping(false);
						}
					}}
					onComplete={(i) => {
						setPhone(i)
						setDoneTyping(true);
					}}
				/>
				<div className="flex flex-row gap-3.5 items-center justify-between w-full">
					<div id="recaptcha-container"></div>
					{/*
						- Disable button when OTP is sending 
						- Move to next screen when OTP is sent
					*/}
					<button
						id="login-button"
						disabled={!doneTyping}
						className="bg-primary px-8 py-3 rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default"
						onClick={(_) => sendOTP(phone)}>
						Login
					</button>
				</div>
			</div>
		</div>
	);
}
