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
	return (
		<table className="block w-full px-6 mt-12 border-spacing-0 border-collapse table-fixed">
			<thead>
				<tr>
					{Object.keys(headerMap).map((h) =>
						<th key={h} className="text-sm font-normal text-gray-300 text-left w-[15%]">{h}</th>
					)}
				</tr>
			</thead>
			{body.length !== 0 && (
				<tbody>
					{body.map((r, index) => {
						return (
							<tr key={index}>
								{Object.values(headerMap).map((k) => {
									const key = k as keyof typeof r;
									const value = String(r[key]);
									return (
										<td key={k+value} className="text-left p-2 pl-0">
											{fieldFormatter?.(k, value, index) ?? value}
										</td>
									);
								})}
								<td key={`Action Buttons`}>
									<div className="flex flex-row gap-2.5">
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
	);
}