"use client"

import { TransportRequest } from "@/app/models/request";
import Table, { ActionButton } from "@/app/ui/components/table";
import { MapPinIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function RequestTable({ body, header }: { header: Record<string, string>, body: TransportRequest[] }) {
	const actionButtons: ActionButton[] = [
		{
			icon: <MapPinIcon width={20} height={20}/>,
			onPressed: (i) => {
				window.open(body[i].google_maps_link, "_blank", "noopener,noreferrer");
			}
		},
		{
			icon: <PencilIcon width={20} height={20}/>,
			onPressed: (i) => {}
		},
		{
			icon: <TrashIcon width={20} height={20}/>,
			onPressed: (i) => {}
		}
	] 

	return (
		<Table<TransportRequest>
			headerMap={header}
			body={body}
			fieldFormatter={(k, v, i) => {
				if (k === "timestamp") {
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
	);
}