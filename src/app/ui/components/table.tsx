import clsx from "clsx";

export type ActionButton = {
	icon: React.ReactNode,
	onPressed: (index: number) => void
};

export default function Table<Type>({ headerMap, body, fieldFormatter, actionButtons }: { 
	headerMap: Record<string, string>,
	body: Type[],
	fieldFormatter?: (fieldName: string, fieldValue: string, index: number) => string,
	actionButtons?: ActionButton[]
}) {
	// const noOfHeaders = Object.entries(headerMap).length;
	return (
		<div className="overflow-x-auto bg-tertiary rounded-xl">
			<table className="w-full text-left table-fixed text-gray-400">
				<thead className="border-b border-tertiary">
					<tr>
						{[...Object.values(headerMap), ...(actionButtons ? ["Actions"] : [])].map((h) =>
							<th
								key={h}
								className="px-6 py-4 uppercase text-sm font-semibold tracking-wider"
							>
								{h}
							</th>
						)}
					</tr>
				</thead>
				{body.length !== 0 && (
					<tbody className="divide-y divide-tertiary">
						{body.map((r, index) => {
							return (
								<tr key={index}>
									{Object.keys(headerMap).map((k) => {
										const key = k as keyof typeof r;
										const value = String(r[key] || "");
										return (
											<td
												key={k+value}
												className={clsx(
													"px-6 py-4 whitespace-nowrap",
													{
														"text-foreground": k === "full_name"
													}
												)}
											>
												{fieldFormatter?.(k, value, index) ?? value}
											</td>
										);
									})}
									<td key={`Action Buttons`} className="px-6 py-4 whitespace-nowrap">
										<div className="flex flex-row gap-4">
											{actionButtons?.map((btn, i) => 
												<button
													key={`Action Button ${i}`}
													className="cursor-pointer"
													onClick={() => btn.onPressed(index)}>
													{btn.icon}
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				)}
			</table>
		</div>
	);
}