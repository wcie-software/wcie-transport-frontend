/**
 * Number input with controlled value.
 * - Limits the number of characters that can be typed
 * - Adds a space after a certain number of characters (useful for phone numbers)
 */

"use client"

import clsx from "clsx";
import { ChangeEvent, useState } from "react";

export default function NumberInput({
	maxLength,
	placeholder,
	prefix = "",
	numberOfSpaces = 2,
	spacesInterval = 3,
	centerText = false,
	onChanged,
	onComplete,
}: {
	maxLength: number,
	placeholder: string,
	prefix?: string
	centerText?: boolean,
	numberOfSpaces?: number,
	spacesInterval?: number,
	onChanged?: (input: string) => void,
	onComplete?: (input: string) => void,
}) {
	const [num, setNumber] = useState("");

	function userTyping(e: ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		// Max characters
		if (value.length > maxLength + numberOfSpaces) {
			return;
		}
		const numericValue = value.replace(/\D/g, ''); // Remove all non-numbers

		let finalValue = numericValue.substring(0, spacesInterval);
		// Add spaces between every `spacesInterval` characters
		for (let i = spacesInterval; i < numericValue.length; i += spacesInterval) {
			if (i == numberOfSpaces * spacesInterval) {
				// Show remaining characters (last space)
				finalValue += ` ${numericValue.substring(i, numericValue.length)}`;
				break;
			} else {
				// Show group of characters (more spaces to be added)
				finalValue += ` ${numericValue.substring(i, i + spacesInterval)}`;
			}
		}

		// After formatting number, show it in input
		setNumber(finalValue);

		onChanged?.(prefix + numericValue);
		if (finalValue.length >= maxLength + numberOfSpaces) {
			onComplete?.(prefix + numericValue);
		}
	}

	return (
		<div className="flex flex-row items-baseline text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
			<span>{prefix}</span>
			{/* Add space after prefix (if it exists) */}
			{prefix.length > 0 && (
				<span>&nbsp;</span>
			)}
			<input
				type="tel"
				value={num}
				onChange={userTyping}
				placeholder={`${placeholder}`}
				className={clsx("outline-0 placeholder-gray-500 truncate w-full", {
					"text-center": centerText
				})} />
		</div>
	);
}