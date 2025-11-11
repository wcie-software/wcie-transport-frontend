export default function Table<Type>(
	{ headerMap, body }: { headerMap: Record<string, string>, body: Type[] }
) {
	return (
		<table className="w-full px-6 mt-12 border-spacing-0">
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
								{Object.values(headerMap).map((h) => {
									const key = h as keyof typeof r;
									const value = String(r[key]);
									return <td key={String(key)+value} className="text-left">{value}</td>;
								})}
							</tr>
						);
					})}
				</tbody>
			)}
		</table>
	);
}