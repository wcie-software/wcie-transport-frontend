"use client"

import CollectNumber from "@/app/ui/components/collect_number";

export default function OTPPage({ phoneNumber, onCodeSubmitted } :
	{ phoneNumber: string, onCodeSubmitted: (code: string) => void }
) {
	return (
		<CollectNumber
		 	title="Enter Code"
			caption={`The code has been sent to ${phoneNumber}`}
			placeholder="333 444"
			buttonText="Submit"
			maxNumberLength={6}
			numberOfSpaces={1}
			onSubmitted={onCodeSubmitted}/>
	);
}