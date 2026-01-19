"use client"

import Link from "next/link";
import Image from "next/image";
import { BugAntIcon, Squares2X2Icon, ArrowsRightLeftIcon, UserIcon, TruckIcon, CalendarDaysIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { redirect, RedirectType, usePathname } from "next/navigation";
import clsx from "clsx";
import { logout } from "@/app/utils/login";
import { auth } from "@/app/utils/firebase_setup/client";
import { importTestData } from "@/app/actions/import_test_data";

export default function Layout({ children }: Readonly<{ children: React.ReactNode; }>) {
	const pathname = usePathname();

	const pages = {
		"Requests": {
			icon: Squares2X2Icon,
			href: "/admin/requests"
		},
		"Assignments": {
			icon: ArrowsRightLeftIcon,
			href: "/admin/assignments"
		},
		"Schedule": {
			icon: CalendarDaysIcon,
			href: "/admin/schedule",
		},
		"Drivers": {
			icon: UserIcon,
			href: "/admin/drivers",
		},
		"Vehicles": {
			icon: TruckIcon,
			href: "/admin/vehicles",
		},
	};

	return (
		<div className="h-screen flex flex-col md:flex-row items-start overflow-y-auto">
			<nav className="hidden md:flex w-[265] h-full shrink-0 bg-tertiary rounded-xl flex-col items-start py-3 sticky top-0">
				<Link
					className="flex flex-row items-center gap-2.5 mt-4 mx-auto"
					href="/admin">
					<Image
						src="/Logo.png"
						alt="WCIE Logo"
						width={40}
						height={40} />
					<p className="text-2xl truncate font-(family-name:--font-pt-serif)">WCIE Transport</p>
				</Link>
				<ul className="flex-1 flex flex-col mt-12 w-full">
					{Object.entries(pages).map(([k, v]) => {
						const { icon, href } = v;
						const Icon = icon;
						return (
							<li key={k} className={clsx("px-4 py-5 rounded-l-4xl", {
								"bg-background": pathname === href
							})}>
								<Link href={href} className="flex flex-row items-center gap-2">
									<Icon width={20} height={20} />
									<p className="text-lg">{k}</p>
								</Link>
							</li>
						);
					})}
				</ul>

				<hr className="w-full text-tertiary my-4" />

				<button
					className="text-lg class flex flex-row gap-2 items-center px-4 mb-2 cursor-pointer"
					onClick={async () => {
						await Promise.all([auth.signOut(), logout()]);
						redirect("/admin", RedirectType.replace);
					}}
				>
					<ArrowRightStartOnRectangleIcon width={20} height={20} />
					<span className="font-medium">Sign Out</span>
				</button>
				{(process.env.NODE_ENV === "development") &&
					<button
						className="text-lg text-primary class flex flex-row gap-2 items-center px-4 mb-2 cursor-pointer"
						onClick={importTestData}
					>
						<BugAntIcon width={20} height={20} />
						<span className="font-medium">Import Test Data</span>
					</button>
				}
			</nav>
			<main className="flex-1 min-w-0">
				{children}
			</main>
		</div>
	);
}