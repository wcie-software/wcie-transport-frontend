"use client"

import { ChangeEvent, useState } from "react";

export default function NumberInput({
	maxLength, placeholder, pretext = "",
	numberOfSpaces = 3, spacesInterval = 3,
	onChanged, onComplete
}: {
	maxLength: number, placeholder: string, pretext?: string
	numberOfSpaces?: number, spacesInterval?: number,
	onChanged?: (input: string) => void
	onComplete?: (input: string) => void
}) {
	const [phone, setPhone] = useState("");

	function userTyping(e: ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		if (value.length > maxLength + numberOfSpaces) {
			return;
		}
		const numericValue = value.replace(/\D/g, ''); // Remove all non-numbers
		
		let finalValue = numericValue.substring(0, 3);
		// Add spaces between every 3 characters
		for (let i = 3; i < numericValue.length; i += spacesInterval) {
			// After the sixth character, don't add anymore spaces
			if (i == (numberOfSpaces - 1) * spacesInterval) {
				finalValue += ` ${numericValue.substring(i, numericValue.length)}`;
				break;
			} else {
				finalValue += ` ${numericValue.substring(i, i+spacesInterval)}`;
			}
		}
		
		setPhone(finalValue);

		if (onChanged != undefined) {
			onChanged(numericValue);
		}

		if (finalValue.length >= maxLength + numberOfSpaces && onComplete != undefined) {
			onComplete(numericValue);
		}
	}

	return (
		<div className="flex flex-row items-baseline text-4xl lg:text-6xl font-bold">
			<span>{pretext}</span>
			{pretext.length > 0 && (
				<span>&nbsp;</span>
			)}
			<input 
				type="tel"
				value={phone}
				onChange={userTyping}
				placeholder={`${placeholder}`}
				className="outline-0 placeholder-gray-500"/>
		</div>
	);
}