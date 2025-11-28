"use client"

import { TransportRequest } from "@/app/models/request";
import Table from "@/app/ui/components/table";
import { MapPinIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import SchemaForm from "@/app/ui/components/schema_form";
import { FirestoreCollections, FirestoreHelper } from "@/app/utils/firestore";
import { db } from "@/app/utils/firebase_setup/client";
import PopupForm from "@/app/ui/components/popup_form";
import { NUMBER_SUFFIX } from "@/app/utils/constants";

export default function RequestView({ groups }: { groups: Record<string, TransportRequest[]> }) {
	const firestore = new FirestoreHelper(db);

	const [tableData, setTableData] = useState(groups);
	const [currentlyEditing, setCurrentlyEditing] = useState({ week: "", index: -1 });

	return (
		<div className="my-8 space-y-8">
			{Object.entries(tableData).map(([week, requests]) => (
				<div key={week} className="space-y-1">
					<h3 className="text-xl font-semibold">{week}</h3>
					<Table
						headerMap={{
							"timestamp": "Date",
							"full_name": "Name",
							"phone_number": "Phone",
							"service_number": "Service",
							"no_of_seats": "Seats",
						}}
						body={requests}
						fieldFormatter={(k, v, i) => {
							if (k === "service_number") {
								return `${v}${NUMBER_SUFFIX[parseInt(v)]} Service`;
							} else if (k === "timestamp") {
								return new Date(v).toLocaleDateString();
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
								icon: <MapPinIcon width={20} height={20} />,
								onPressed: (i) => {
									window.open(requests[i].google_maps_link, "_blank", "noopener,noreferrer");
								}
							},
							{
								icon: <PencilIcon width={20} height={20} />,
								onPressed: (i) => setCurrentlyEditing({ week: week, index: i })
							},
							{
								icon: <TrashIcon width={20} height={20} />,
								onPressed: (i) => {
									firestore.deleteDocument(FirestoreCollections.Requests, requests[i].documentId!);
									setTableData({
										...tableData,
										[week]: tableData[week].filter((r, index) => index != i)
									});
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
						schema={tableData[currentlyEditing.week][currentlyEditing.index]}
						customLabels={{
							"no_of_seats": "Number of Seats",
							"no_of_children": "Number of Children",
						}}
						hiddenColumns={["documentId", "timestamp", "coordinates", "address", "google_maps_link"]}
						onSubmitted={(obj) => {
							const newRequest = obj as TransportRequest;
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
							firestore.updateDocument(FirestoreCollections.Requests, newRequest.documentId!, newRequest);

							setCurrentlyEditing({ week: "", index: -1 });
						}}
					/>
				}
			</PopupForm>
		</div>
	);
}