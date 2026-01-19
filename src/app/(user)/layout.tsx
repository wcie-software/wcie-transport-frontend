import { ArrowDownTrayIcon, PhoneIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import Link from "next/link";
import { importTestData } from "../actions/import_test_data";

export default function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<div className="min-h-screen flex flex-col">
			<header className="flex flex-row justify-between items-center py-3 px-6">
				<Link
					className="flex flex-row items-center justify-between gap-2.5"
					href="/">
					<Image
						src="/Logo.png"
						alt="WCIE Logo"
						width={40}
						height={40} />
					<p className="text-2xl truncate font-[family-name:var(--font-pt-serif)]">WCIE Transport</p>
				</Link>
				<div className="flex flex-row gap-2.5 items-center">
					{(process.env.NODE_ENV === "development") &&
						<ArrowDownTrayIcon className="text-primary" width={24} height={24} onClick={importTestData} />
					}
					<Link href="tel:+17808602845" title="Phone Number of Transport Unit Coordinator">
						<p className="text-lg hidden sm:block">Support</p>
						<PhoneIcon className="block sm:hidden" width={24} height={24} />
					</Link>
				</div>
			</header>
			<main className="flex flex-col flex-1 justify-center items-center">
				{children}
			</main>
		</div>
	);
}
