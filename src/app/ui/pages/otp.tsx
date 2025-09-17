"use client"

import NumberInput from "@/app/ui/number_input";

export default function OTPPage({ phoneNumber, onCodeSubmitted } :
	{ phoneNumber: string, onCodeSubmitted: (code: string) => void }
) {
	return (
		<div className="flex flex-row items-center justify-between max-w-2xl">
			<div className="flex flex-col gap-2">
				<p className="text-2xl font-semibold">Enter Code</p>
				<p className="text-gray-400">The code has been sent to {phoneNumber}</p>
			</div>
			<NumberInput
				centerText={true}
				maxLength={6}
				numberOfSpaces={1}
				placeholder="333 444"
				onComplete={onCodeSubmitted}/>
		</div>
	);
}