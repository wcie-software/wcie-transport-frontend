"use client"

import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import Table from "@/app/ui/components/table";
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, PencilIcon, XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import SchemaForm from "@/app/ui/components/schema_form";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { db } from "@/app/utils/firebase_client";
import PopupForm from "@/app/ui/components/popup_form";
import { Constants } from "@/app/utils/util";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function RequestView({ groups, page, startingDate }:
	{ groups: Record<string, TransportRequest[]>, page: number, startingDate: string }
) {
	const firestore = new FirestoreHelper(db);
	const router = useRouter();
	const searchParams = useSearchParams();

	const [tableData, setTableData] = useState(groups);
	const [currentlyEditing, setCurrentlyEditing] = useState({ week: "", index: -1 });

	const hasRequests = Object.keys(tableData).length > 0;

	const updatePage = (newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", newPage.toString());
		router.push(`?${params.toString()}`);
	};

	return (
		<div className="my-8 space-y-8">
			<div className="flex flex-row items-center justify-between">
				<h2 className="text-2xl font-bold">Requests</h2>
				<div className="flex flex-row items-center gap-4">
					<button
						className="p-2 rounded-full hover:bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
						disabled={page === 0}
						onClick={() => updatePage(page - 1)}
					>
						<ChevronLeftIcon width={24} height={24} />
					</button>
					<span className="font-medium">Page {page + 1}</span>
					<button
						className="p-2 rounded-full hover:bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
						disabled={!hasRequests}
						onClick={() => updatePage(page + 1)}
					>
						<ChevronRightIcon width={24} height={24} />
					</button>
				</div>
			</div>

			{!hasRequests && (
				<div className="flex flex-col items-center justify-center py-20 text-gray-500">
					<p className="text-xl">No requests older than {startingDate}</p>
				</div>
			)}

			{Object.entries(tableData).map(([week, requests]) => (
				<div key={week} className="space-y-1">
					<h3 className="text-xl font-semibold">{week} ({requests.length} request{requests.length !== 1 ? 's' : ''})</h3>
					<Table
						headerMap={{
							"timestamp": "Date",
							"full_name": "Name",
							"phone_number": "Phone",
							"service_number": "Service",
							"no_of_seats": "Seats",
						}}
						body={requests}
						fieldStyle={(k, v, i) => {
							if (k === "full_name") {
								switch (requests[i].status) {
									case "cancelled":
										return "line-through";
									case "failed":
										return "text-red-400 line-through";
									default:
										return "text-foreground";
								}
							}
						}}
						fieldFormatter={(k, v, i) => {
							if (k === "service_number") {
								return `${v}${Constants.NUMBER_SUFFIX[parseInt(v)]} Service`;
							} else if (k === "timestamp") {
								return new Date(v).toLocaleDateString("en-US");
							} else if (k === "no_of_seats") {
								const children = requests[i].no_of_children ?? 0;
								if (children > 0) {
									return `${v} (${children} ${(children == 1 ? "child" : "children")})`;
								}
							}
							return v;
						}}
						actionButtons={[
							{
								icon: (i) => <MapPinIcon width={20} height={20} />,
								onPressed: (i) => {
									window.open(requests[i].google_maps_link, "_blank", "noopener,noreferrer");
								}
							},
							{
								icon: (i) => <PencilIcon width={20} height={20} />,
								onPressed: (i) => setCurrentlyEditing({ week: week, index: i })
							},
							{
								icon: (i) => (requests[i].status !== "cancelled"
									? <XCircleIcon width={20} height={20} />
									: <CheckCircleIcon width={20} height={20} />),
								onPressed: async (i) => {
									const requestId = requests[i].documentId!;
									const newStatus = ((requests[i].status == "cancelled") ? "normal" : "cancelled");

									const success = await firestore.updateDocument(
										FirestoreCollections.Requests,
										requestId,
										{ "status": newStatus }
									);

									if (success) {
										setTableData({
											...tableData,
											[week]: tableData[week].map((row, index) => {
												// Update only that row
												if (i === index) {
													row["status"] = newStatus;
												}
												return row;
											})
										});
									} else {
										toast.error("Failed to edit request. Try again.")
									}
								}
							}
						]} />
				</div>
			))}

			<PopupForm
				open={currentlyEditing.index !== -1}
				onClose={() => setCurrentlyEditing({ week: "", index: -1 })}
			>
				{currentlyEditing.index !== -1 &&
					<SchemaForm
						schema={TransportRequestSchema}
						obj={tableData[currentlyEditing.week][currentlyEditing.index]}
						customLabels={{
							"no_of_seats": "Number of Seats",
							"no_of_children": "Number of Children",
						}}
						hiddenColumns={["documentId", "coordinates"]}
						readonlyColumns={["timestamp", "address", "google_maps_link"]}
						onSubmitted={async (obj) => {
							const newRequest = obj as TransportRequest;
							// Timestamp must not be changed
							newRequest.timestamp = tableData[currentlyEditing.week][currentlyEditing.index].timestamp;

							const success = await firestore.updateDocument(
								FirestoreCollections.Requests, newRequest.documentId!, newRequest
							);

							if (success) {
								setTableData({
									...tableData,
									[currentlyEditing.week]: tableData[currentlyEditing.week].map((row, i) => {
										// Update only that row
										if (i === currentlyEditing.index) {
											return { ...row, ...newRequest };
										}
										return row;
									})
								});
								toast.success("Request updated successfully.");
							} else {
								toast.error("Failed to update request. Try again.")
							}


							setCurrentlyEditing({ week: "", index: -1 });
						}}
					/>
				}
			</PopupForm>
		</div>
	);
}