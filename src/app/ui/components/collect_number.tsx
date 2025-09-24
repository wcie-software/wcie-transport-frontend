"use client"

import NumberInput from "@/app/ui/components/number_input";
import { useState } from "react";

export default function CollectNumber({
	title,
	caption,
	buttonText,
	maxNumberLength = 10,
	numberOfSpaces = 2,
	prefix,
	placeholder,
	onSubmitted
}: {
	title: string,
	caption?: string,
	buttonText: string,
	maxNumberLength?: number,
	numberOfSpaces?: number,
	prefix?: string,
	placeholder: string,
	onSubmitted?: (number: string) => void,
}) {
	const [no, setNumber] = useState("");
	const [status, setStatus] = useState("typing");

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex flex-col">
				<p className="text-lg font-semibold">{title}</p>
				<p className="text-gray-400">{caption}</p>
			</div>
			<div className="flex flex-col gap-6 w-full justify-center items-start">
				<NumberInput
					maxLength={maxNumberLength}
					numberOfSpaces={numberOfSpaces}
					prefix={prefix}
					placeholder={placeholder}
					onChanged={(_) => {
						if (status !== "typing") {
							setStatus("typing");
						}
					}}
					onComplete={(i) => {
						setNumber(i)
						setStatus("done-typing");
					}}
				/>
				<button
					id="login-button"
					disabled={status !== "done-typing"}
					className="bg-primary px-8 py-3 rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default"
					onClick={(_) => {
						setStatus("loading");
						onSubmitted?.(no);
					}}>
					{buttonText}
				</button>
			</div>
		</div>
	);
}
