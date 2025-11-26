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

export default function RequestView({ body, groups }: { body: TransportRequest[], groups: Record<string, TransportRequest[]> }) {
	const firestore = new FirestoreHelper(db);

	const [tableData, setTableData] = useState(body);
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	return (
		<div className="my-8 space-y-8">
			{Object.entries(groups).map(([week, requests]) => (
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
								const children = tableData[i].no_of_children ?? 0;
								if (children > 0) {
									return `${v} (${children} ${(children == 1 ? "child" : "children")})`;
								}
							}
							return v;
						}}
						actionButtons={[
							{
								icon: <MapPinIcon width={20} height={20}/>,
								onPressed: (i) => {
									window.open(tableData[i].google_maps_link, "_blank", "noopener,noreferrer");
								}
							},
							{ icon: <PencilIcon width={20} height={20}/>, onPressed: setCurrentlyEditing },
							{
								icon: <TrashIcon width={20} height={20}/>,
								onPressed: (i) => {
									firestore.deleteDocument(FirestoreCollections.Requests, tableData[i].documentId!);
									setTableData(tableData.filter((r, index) => index != i));
								}
							}
						]}/>
					</div>
			))}
   
			<PopupForm
				open={currentlyEditing !== -1}
				onClose={() => setCurrentlyEditing(-1)}
			>
				<SchemaForm
					schema={tableData[currentlyEditing]}
					labels={{
						"full_name": "Full Name",
						"phone_number": "Phone Number",
						"service_number": "Service Number",
						"no_of_seats": "Number of Seats",
						"google_maps_link": "Google Maps Link",
						"no_of_children": "Number of Children",
						"address": "Address"
					}}
					onSubmitted={(obj) => {
						const newRequest = obj as TransportRequest;
						setTableData(tableData.map((row, i) => {
							// Update only that row
							if (i === currentlyEditing) {
								return { ...row, ...newRequest };
							}
							return row;
						}));
						firestore.updateDocument(FirestoreCollections.Requests, newRequest.documentId!, newRequest);
						
						setCurrentlyEditing(-1);
					}}
				/>
			</PopupForm>
		</div>
	);
}