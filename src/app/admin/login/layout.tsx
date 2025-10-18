import Image from "next/image";
import Link from "next/link";

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
					height={40}/>
				<p className="text-2xl truncate font-[family-name:var(--font-pt-serif)]">WCIE Transport Admin</p>
			</Link>
		</header>
		<main className="flex flex-1 justify-center items-center">
			{children}
		</main>
	</div>
  );
}