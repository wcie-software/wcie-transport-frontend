"use client"

import Link from "next/link";
import Image from "next/image";
import { Squares2X2Icon, ArrowsRightLeftIcon, UserIcon, TruckIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Layout({ children }: Readonly<{ children: React.ReactNode; }>) {
	const pathname = usePathname();

	const pages = {
		"Requests": {
			icon: Squares2X2Icon,
			href: "/admin"
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
		<div className="h-screen flex flex-row items-start">
			<nav className="w-[265] h-full shrink-0 bg-tertiary rounded-xl flex flex-col items-start py-3 pl-2">
				<Link
					className="flex flex-row items-center gap-2.5 mb-6 ml-1 mr-3"
					href="/">
						<Image
							src="/Logo.png"
							alt="WCIE Logo"
							width={40}
							height={40}/>
						<p className="text-2xl truncate font-[family-name:var(--font-pt-serif)]">WCIE Transport</p>
				</Link>
				<ul className="flex-1 flex flex-col mt-12 w-full">
					{Object.entries(pages).map(([k, v]) => {
						const {icon, href} = v;
						const Icon = icon;
						return (
							<li key={k} className={clsx("px-4 py-5 rounded-l-4xl", {
								"bg-background": pathname === href
							})}>
								<Link href={href} className="flex flex-row items-center gap-2">
									<Icon width={20} height={20}/>
									<p className="text-lg">{k}</p>
								</Link>
							</li>
						);
					})}
				</ul>
				{/* <p className="text-lg">Sign Out</p> */}
			</nav>
			<main className="flex-1 mx-8 mt-12">
				{children}
			</main>
		</div>
	);
}