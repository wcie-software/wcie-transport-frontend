import { ArrowDownTrayIcon, PhoneIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { importTestData } from "../actions/import_test_data";
import Header from "../ui/components/header";

export default function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<div className="min-h-screen flex flex-col">
			<Header>
				<div className="flex flex-row gap-2.5 items-center">
					{(process.env.NODE_ENV === "development") &&
						<ArrowDownTrayIcon className="text-primary" width={24} height={24} onClick={importTestData} />
					}
					<Link href="tel:+17808602845" title="Phone Number of Transport Unit Coordinator">
						<p className="text-lg hidden sm:block">Support</p>
						<PhoneIcon className="block sm:hidden" width={24} height={24} />
					</Link>
				</div>
			</Header>
			<main className="flex flex-col flex-1 justify-center items-center">
				{children}
			</main>
		</div>
	);
}
