export default function Table(
	{ headerTitles, body }: { headerTitles: string[], body: Map<String, any>[] }
) {
	return (
		<table className="w-full max-w-2xl px-6 mt-12 border-spacing-0">
			<tr>
				{headerTitles.map((h) =>
					<th key={h} className="text-sm font-normal text-gray-300">{h}</th>
				)}
			</tr>
			{body.map((r) => {
				return (
					<tr>
						{headerTitles.map((h) => {
							return (
								<tr>
									<td className="text-center">{r.get(h)}</td>
								</tr>
							);
						})}
					</tr>
				);
			})}
		</table>
	);
}