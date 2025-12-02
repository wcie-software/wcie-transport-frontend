import { FormEvent } from "react";
import { toast } from "sonner";
import { ZodObject } from "zod";

export default function SchemaForm({
	obj, schema, customLabels, hiddenColumns = ["documentId"], suggestedValues, onSubmitted
}: {
	obj: object,
	schema: ZodObject,
	customLabels?: Record<string, string>,
	hiddenColumns?: string[],
	suggestedValues?: Record<string, string[]>,
	onSubmitted?: (newObj: object) => void,
}) {
	const keys = Object.keys(obj);
	const types = Object.values(obj).map((v) => typeof v);
	const zipped = Array.from(
		{ length: keys.length },
		(_, i) => [keys[i], types[i]]
	);

	function inferType(name: string, type: string) {
		if (name.includes("phone")) {
			return "tel";
		} else if (name.includes("mail")) {
			return "email";
		} else if (name.includes("time") || name.includes("date")) {
			return "datetime-local";
		} else if (name.includes("link")) {
			return "url";
		} else if (type.includes("number") || name.includes("amount") || name.includes("cost")) {
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

		if ("documentId" in obj && !newObj.has("documentId")) {
			newObj.set("documentId", obj["documentId" as keyof object])
		}

		const validObj = schema.safeParse(Object.fromEntries(newObj.entries()));
		if (validObj.success) {
			onSubmitted?.(validObj.data);
		} else {
			const errorObj = JSON.parse(validObj.error.message);
			toast.error(`The data you typed in is not valid: '${errorObj[0]["message"]}'.`);
			// console.log(validObj.error);
		}
	}

	return (
		<form className="flex flex-col gap-2" onSubmit={formSubmitted}>
			<div>
				{zipped.map(([k, t]) => {
					if (hiddenColumns.includes(k)) {
						return null;
					}

					const inferredType = inferType(k, t);
					const key = k as keyof object;
					const generatedLabel = k.split("_").map((element) =>
						`${element[0].toUpperCase()}${element.slice(1)}`
					).join(" ");

					const v = obj[key];
					let currentValue = String(v);
					if (inferredType === "datetime-local") {
						try {
							currentValue = (new Date(v)).toISOString().replace("Z", "");
						} catch (e) { }
					}

					return (
						<div key={k} className="py-2 flex flex-col items-baseline justify-start gap-0.5">
							<label htmlFor={k} className="text-xs">
								{((customLabels && k in customLabels) ? customLabels[k] : generatedLabel)}
							</label>
							{(suggestedValues && k in suggestedValues)
								?
								<select
									id={k}
									name={k}
									defaultValue={v}
									className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-foreground"
								>
									{suggestedValues[k].map((sv) =>
										<option value={sv} key={sv}>{sv}</option>
									)}
								</select>
								:
								<input
									name={k}
									id={k}
									placeholder={(customLabels && k in customLabels) ? customLabels[k] : generatedLabel}
									type={inferredType}
									defaultValue={currentValue}
									className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-foreground"
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