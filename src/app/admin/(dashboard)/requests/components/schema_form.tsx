import PrimaryButton from "@/app/ui/components/primary_button";
import { FormEvent } from "react";

export default function SchemaForm({ schema, labels, onSubmitted }: {
	schema: object,
	labels?: Record<string, string>,
	onSubmitted?: (newObj: object) => void
}) {
	const keys = Object.keys(schema);
	const types = Object.values(schema).map((v) => typeof v);
	const zipped = Array.from(
		{ length: keys.length },
		(_, i) => [keys[i], types[i]]
	);

	function inferInputType(name: string, type: string) {
		if (name.includes("phone") || name.includes("tel")) {
			return "tel";
		} else if (name.includes("mail")) {
			return "email";
		} else if (name.includes("time") || name.includes("date")) {
			return "datetime-local";
		} else if (name.includes("link")) {
			return "url";
		} else if (type.includes("number")) {
			return "number";
		}

		return "text";
	}

	function formSubmitted(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		
		const newObj = new Map<String, any>();
		for (const [k, v] of formData.entries()) {
			newObj.set(k, v);
		}

		onSubmitted?.(Object.fromEntries(newObj.entries()));
	}

	return (
		<form className="flex flex-col gap-2" onSubmit={formSubmitted}>
			<div>
				{zipped.map(([k, t]) => {
					const inferredType = inferInputType(k, t);
					const key = k as keyof object;

					const v = schema[key];
					const currentValue = (inferredType === "datetime-local")
						? (v as Date).toISOString().replace("Z", "")
						: String(v);
					console.log(currentValue);

					return (
						<div className="py-2 flex flex-row items-center gap-3">
							<label htmlFor={k}>{(labels && labels[k]) ?? k}</label>
							<input
								name={k}
								id={k}
								key={k}
								type={inferredType}
								defaultValue={currentValue}
								className="flex-1 border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-foreground"
							/>
						</div>
					);
				})}
			</div>
			<button
				type="submit"
				className="ml-auto bg-primary px-6 py-3 rounded cursor-pointer"
			>
				Done
			</button>
		</form>
	);
}