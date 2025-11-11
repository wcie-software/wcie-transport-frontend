export default function Table<Type>({ headerMap, body, fieldFormatter }: { 
	headerMap: Record<string, string>,
	body: Type[],
	fieldFormatter?: (fieldName: string, fieldValue: string, index: number) => string
}) {
	const length = Object.entries(headerMap).length;
	return (
		<table className="block w-full px-6 mt-12 border-spacing-0 border-collapse table-fixed">
			<colgroup>
				{Array.from({ length: length }).map((i) =>
					<col span={1} style={{ width: `${100.0 / length}%` }}/>
				)}
				{/* <col span={1} style={{ width: "25px" }} /> */}
			</colgroup>
			
			<thead>
				<tr>
					{Object.keys(headerMap).map((h) =>
						<th key={h} className="text-sm font-normal text-gray-300 text-left">{h}</th>
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
								{/* <td>...</td> */}
							</tr>
						);
					})}
				</tbody>
			)}
		</table>
	);
}