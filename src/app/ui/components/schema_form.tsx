import { FormEvent } from "react";

export default function SchemaForm({ schema, labels, suggestedValues, onSubmitted }: {
	schema: object,
	labels: Record<string, string>,
	suggestedValues?: Record<string, string[]>,
	onSubmitted?: (newObj: object) => void,
}) {
	const keys = Object.keys(schema);
	const types = Object.values(schema).map((v) => typeof v);
	const zipped = Array.from(
		{ length: keys.length },
		(_, i) => [keys[i], types[i]]
	);

	function inferType(name: string, type: string) {
		if (name.includes("phone") || labels[name].toLowerCase().includes("phone")) {
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
			newObj.set(k, String(v));
		}

		if ("documentId" in schema && !newObj.has("documentId")) {
			newObj.set("documentId", schema["documentId" as keyof object])
		}
		
		onSubmitted?.(Object.fromEntries(newObj.entries()));
	}

	return (
		<form className="flex flex-col gap-2" onSubmit={formSubmitted}>
			<div>
				{zipped.map(([k, t]) => {
					if (!(k in labels)) {
						return null;
					}

					const inferredType = inferType(k, t);
					const key = k as keyof object;

					const v = schema[key];
					const currentValue = (inferredType === "datetime-local")
						? (new Date(v)).toISOString().replace("Z", "")
						: String(v);

					return (
						<div key={k} className="py-2 flex flex-row items-center gap-3">
							<label htmlFor={k}>{labels[k]}</label>
							{suggestedValues && k in suggestedValues &&
								<select id={k} name={k} defaultValue={v}>
									{suggestedValues[k].map((sv) => 
										<option value={sv} key={sv}>{sv}</option>
									)}
								</select>
							}
							{(!suggestedValues || !(k in suggestedValues)) &&
								<input
									name={k}
									id={k}
									type={inferredType}
									defaultValue={currentValue}
									className="flex-1 border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-foreground"
								/>
							}
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