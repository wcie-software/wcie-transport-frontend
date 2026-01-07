import { XMarkIcon } from "@heroicons/react/24/solid";
import { Modal } from "@mui/material";

export default function PopupForm({ open, title, onClose, children }: { open: boolean, title?: string, onClose: () => void, children?: React.ReactNode }) {
	return (
		<Modal
			open={open}
			onClose={onClose}
		>
			<div className="outline-0 max-h-[85%] overflow-y-auto absolute top-1/2 left-1/2 -translate-1/2 bg-background w-xl p-4 shadow-sm shadow-gray-900 rounded-xl">
				<div className="flex flex-col">
					<div className="flex flex-row w-full justify-between">
						<h2 className="text-lg font-bold mb-4">{title}</h2>
						<XMarkIcon
							className="ml-auto cursor-pointer"
							width={30}
							height={30}
							onClick={onClose}
						/>
					</div>
					{children}
				</div>
			</div>
		</Modal>
	);
}