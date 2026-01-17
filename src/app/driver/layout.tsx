"use client";

import { CalendarDaysIcon, TruckIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
	{
		name: "Pickups",
		icon: TruckIcon,
		href: "/driver"
	},
	{
		name: "Schedules",
		icon: CalendarDaysIcon,
		href: "/driver/schedules"
	},
	{
		name: "Profile",
		icon: UserCircleIcon,
		href: "/driver/profile",
	},
];

export default function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
	const pathname = usePathname();

	return (
		<div className="min-h-screen flex flex-col relative">
			<header className="flex flex-row justify-between items-center py-3 px-6">
				<Link
					className="flex flex-row items-center gap-2.5"
					href="/driver">
					<Image
						src="/Logo.png"
						alt="WCIE Logo"
						width={40}
						height={40} />
					<p className="text-2xl truncate font-[family-name:var(--font-pt-serif)]">WCIE Transport Driver</p>
				</Link>
			</header>
			<main className="w-full flex-1 px-6">
				{children}
			</main>
			<footer className="sticky z-50 bottom-0 left-0 w-full h-16 bg-tertiary backdrop-blur">
				<ul className="h-full w-full flex flex-row justify-between items-center gap-4 px-6 py-2 max-w-3xl m-auto">
					{pages.map((p) => {
						const Icon = p.icon;
						return (
							<li key={p.name} className={clsx(
								"text-foreground",
								{ "text-primary": p.href === pathname }
							)}>
								<Link className="flex flex-col items-center gap-1 group" href={p.href}>
									<div className="p-1 rounded-full transition-colors group-active:text-white">
										{<Icon width={20} height={20} />}
									</div>
									<span className="text-[10px] font-bold uppercase tracking-wider">{p.name}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</footer>
		</div>
	);
}