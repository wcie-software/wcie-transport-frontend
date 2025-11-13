"use client"

import clsx from "clsx";

export default function PrimaryButton({ text, id, type = "button", disabled = false, inverted = false, onClick }:
	{text: string, id?: string, type?: "submit" | "reset" | "button", disabled?: boolean, inverted?: boolean, onClick?: () => void}
) {
	return (
		<button
			id={id}
			disabled={disabled}
			type={type}
			className={clsx(
				"px-8 py-3 rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default",
				{
					"bg-primary": !inverted,
					"bg-white text-primary": inverted
				}
			)}
			onClick={(_) => onClick?.()}>
			{text}
		</button>
	);
}