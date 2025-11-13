"use client"

import clsx from "clsx";

export default function PrimaryButton({ text, id, type = "button", disabled = false, outline = false, onClick }:
	{text: string, id?: string, type?: "submit" | "reset" | "button", disabled?: boolean, outline?: boolean, onClick?: () => void}
) {
	return (
		<button
			id={id}
			disabled={disabled}
			type={type}
			className={clsx(
				"px-8 py-3 rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default",
				{
					"bg-primary": !outline,
					"text-white border border-primary": outline
				}
			)}
			onClick={(_) => onClick?.()}>
			{text}
		</button>
	);
}