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
				"px-8 py-3 text-white rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default",
				{
					"bg-primary": !outline,
					"text-foreground border border-primary": outline
				}
			)}
			onClick={(_) => onClick?.()}>
			{children}
		</button>
	);
}