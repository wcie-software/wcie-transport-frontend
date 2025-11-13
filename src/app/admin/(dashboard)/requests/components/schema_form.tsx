import PrimaryButton from "@/app/ui/components/primary_button";

export default function SchemaForm({ schema, labels }: { schema: object, labels?: Record<string, string> }) {
	const keys = Object.keys(schema);
	const types = Object.values(schema).map((v) => typeof v);

	const obj = Array.from(
		{ length: keys.length },
		(_, i) => [keys[i], types[i]]
	);

	function inferInputType(name: string, type: string) {
		if (name.includes("phone") || name.includes("tel")) {
			return "tel";
		} else if (name.includes("mail")) {
			return "email";
		} else if (name.includes("time") || name.includes("date")) {
			return "date";
		} else if (name.includes("link")) {
			return "url";
		} else if (type.includes("number")) {
			return "number";
		}

		return "text";
	}

	return (
		<form className="flex flex-col gap-2">
			<div>
				{obj.map(([k, t]) => {
					const inferredType = inferInputType(k, t);
					const key = k as keyof object;

					const v = schema[key];
					const currentValue = (inferredType === "date")
						? (v as Date).toISOString().split("T")[0]
						: String(v);

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
			<span className="ml-auto flex flex-row gap-4">
				<PrimaryButton
					text="Cancel"
					inverted={true}
				/>
				<PrimaryButton
					text="Edit"
				/>
			</span>
		</form>
	);
}