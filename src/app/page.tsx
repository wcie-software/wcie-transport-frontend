import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
	<div className="min-h-screen flex flex-col font-[family-name:var(--font-mont)]">
		<header className="flex flex-row justify-between items-center px-3 py-2">
			<div className="flex flex-row items-center justify-between gap-2.5">
				<Image
					src="/Logo.png"
					alt="WCIE Logo"
					width={40}
					height={40}/>
				<p className="text-2xl font-[family-name:var(--font-pt-serif)]">WCIE Transport</p>
			</div>
			<Link href="tel:+17808602845" title="Phone Number of Transport Unit Coordinator">
				<p className="text-lg">Support</p>
			</Link>
		</header>
		<main>
			
		</main>
    </div>
  );
}
