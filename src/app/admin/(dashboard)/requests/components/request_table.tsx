"use client"

import { TransportRequest, TransportRequestSchema } from "@/app/models/request";
import Table, { ActionButton } from "@/app/ui/components/table";
import { MapPinIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal } from "@mui/material";
import { useState } from "react";
import SchemaForm from "./schema_form";

export default function RequestTable({ body, header }: { header: Record<string, string>, body: TransportRequest[] }) {
	const [currentlyEditing, setCurrentlyEditing] = useState(-1);

	const actionButtons: ActionButton[] = [
		{
			icon: <MapPinIcon width={20} height={20}/>,
			onPressed: (i) => {
				window.open(body[i].google_maps_link, "_blank", "noopener,noreferrer");
			}
		},
		{
			icon: <PencilIcon width={20} height={20}/>,
			onPressed: setCurrentlyEditing
		},
		{
			icon: <TrashIcon width={20} height={20}/>,
			onPressed: (i) => {}
		}
	];

	return (
		<>
			<Table<TransportRequest>
				headerMap={header}
				body={body}
				fieldFormatter={(k, v, i) => {
					if (k === "service_number") {
						const suffix: Record<string, string> = {
							"1": "st", "2": "nd",
							"3": "rd", "4": "th",
						};
						return `${v}${suffix[v]} Service`;
					} else if (k === "timestamp") {
						return new Date(v).toLocaleDateString();
					} else if (k === "no_of_seats") {
						const children = body[i].no_of_children ?? 0;
						if (children) {
							return `${v} (${children} ${(children == 1 ? "child" : "children")})`;
						}
					}
					return v;
				}}
				actionButtons={actionButtons}/>

			<Modal
				open={currentlyEditing !== -1}
				onClose={() => setCurrentlyEditing(-1)}
			>
				<div className="absolute top-1/2 left-1/2 -translate-1/2 bg-background w-xl p-4 shadow rounded-lg">
					{currentlyEditing !== -1 &&
						<SchemaForm
							schema={body[currentlyEditing]}
							labels={{
								"timestamp": "Date of Request",
								"full_name": "Full Name",
								"phone_number": "Phone Number",
								"service_number": "Service Number",
								"no_of_seats": "Number of Seats",
								"google_maps_link": "Google Maps Link",
								"no_of_children": "Number of Children",
								"address": "Address"
							}}
						/>
					}
				</div>
			</Modal>
		</>
	);
}