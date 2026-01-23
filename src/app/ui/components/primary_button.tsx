/**
 * Themed button with nice utility functions.
 */

"use client"

import clsx from "clsx";

export default function PrimaryButton({ id, type = "button", disabled = false, outline = false, onClick, children }:
	{ id?: string, type?: "submit" | "reset" | "button", disabled?: boolean, outline?: boolean, onClick?: () => void, children?: React.ReactNode }
) {
	return (
		<button
			id={id}
			disabled={disabled}
			type={type}
			className={clsx(
				"px-8 py-3 min-h-0 flex items-center justify-center rounded cursor-pointer disabled:cursor-not-allowed truncate",
				{
					"bg-primary disabled:bg-gray-500 text-white": !outline,
					"text-foreground border border-primary": outline,
					"border-tertiary": outline && disabled
				}
			)}
			onClick={(_) => onClick?.()}>
			{children}
		</button>
	);
}