import { XMarkIcon } from "@heroicons/react/24/solid";
import { Modal } from "@mui/material";

export default function PopupForm({ open, onClose, children }: { open: boolean, onClose: () => void, children?: React.ReactNode }) {
	return (
		<Modal
			open={open}
			onClose={onClose}
		>
			<div className="absolute top-1/2 left-1/2 -translate-1/2 bg-background w-xl p-4 shadow-sm shadow-gray-900 rounded-xl">
				<div className="flex flex-col">
					<XMarkIcon
						className="ml-auto cursor-pointer"
						width={30}
						height={30}
						onClick={onClose}
					/>
					{children}
				</div>
			</div>
		</Modal>
	);
}