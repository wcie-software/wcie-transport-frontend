import Link from "next/link";
import Image from "next/image";

export default function Layout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<div className="h-screen flex flex-row items-start">
			<nav className="w-[240] h-full shrink-0 bg-tertiary rounded-xl">
				<Link
					className="flex flex-row items-center gap-2.5"
					href="/">
						<Image
							src="/Logo.png"
							alt="WCIE Logo"
							width={40}
							height={40}/>
						<p className="text-xl truncate font-[family-name:var(--font-pt-serif)]">Admin</p>
				</Link>
			</nav>
			<main className="flex-1">
				{children}
			</main>
		</div>
	);
}