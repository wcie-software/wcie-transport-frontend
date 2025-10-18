"use client"

export default function PrimaryButton({ text, id, type = "button", disabled = false, onClick }:
	{text: string, id?: string, type?: "submit" | "reset" | "button", disabled?: boolean, onClick?: () => void}
) {
	return (
		<button
			id={id}
			disabled={disabled}
			type={type}
			className="bg-primary px-8 py-3 rounded cursor-pointer disabled:bg-gray-500 disabled:cursor-default"
			onClick={(_) => onClick?.()}>
			{text}
		</button>
	);
}