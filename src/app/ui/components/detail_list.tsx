"use client"

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export function DetailList<Type>({ header, body, idColumn, titleIcon, titleColumn, onEdit, onDelete }: {
	header: Record<string, string>,
	body: Type[],
	idColumn: string,
	titleIcon?: React.ReactNode,
	titleColumn: string,
	onEdit?: (index: number) => void
	onDelete?: (index: number) => void
}) {
	return (
		<div className="my-8 bg-tertiary rounded-lg px-4">
			{body.map((item, i) => (
				<div
					key={item[idColumn as keyof object]}
					className="border-b-[0.2px] last:border-0 border-gray-600 py-8 flex flex-row justify-between items-start gap-12"
				>
					<div>
						<h2 className="font-semibold text-xl mb-4 flex flex-row gap-1 items-center">
							{item[titleColumn as keyof object]}
							{titleIcon}
						</h2>
						<div className="flex flex-wrap justify-between gap-6">
							{Object.entries(header).map(([key, name]) => (
								<div key={key}>
									<h3 className="text-gray-400">{name}</h3>
									<p className="max-w-sm">{item[key as keyof object]}</p>
								</div>
							))}
						</div>
					</div>
					<div className="flex flex-row items-center gap-3.5">
						<div
							className="cursor-pointer flex flex-row items-center gap-2 border border-tertiary py-2 px-2.5 rounded-md"
							onClick={() => onEdit?.(i)}
						>
							<PencilIcon width={20} height={20} />
							<p>Edit</p>
						</div>
						<div
							className="cursor-pointer flex flex-row items-center gap-2 bg-deleteRed py-2 px-2.5 rounded-md"
							onClick={() => onDelete?.(i)}
						>
							<TrashIcon width={20} height={20} />
							<p>Delete</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}