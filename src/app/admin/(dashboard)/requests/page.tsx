export default function RequestsPage() {
	const tableHeaders = [
		"Date",
		"Name",
		"Phone",
		"Service",
		"Children / Seats",
		"Location"
	];

	return (
		// <div className="w-full">
		// 	<h1 className="text-4xl">Requests</h1>
		// 	<table className="w-full max-w-2xl px-6 mt-12 border-spacing-0">
		// 		<tr>
		// 			{tableHeaders.map((h) =>
		// 				<th key={h} className="text-sm font-normal text-gray-300">{h}</th>
		// 			)}
		// 		</tr>
		// 		{requests.map((r) => 
		// 			<tr>
		// 				<td className="text-center">{r.timestamp.toDateString()}</td>
		// 				<td className="text-center">{r.fullName}</td>
		// 				<td className="text-center">{r.phoneNumber}</td>
		// 				<td className="text-center">{r.serviceNumber}</td>
		// 				<td className="text-center">{r.noOfChildren} / {r.noOfSeats}</td>
		// 				<td>See location</td>
		// 			</tr>
		// 		)}
		// 	</table>
		// </div>
		<p>Nice</p>
	);
}