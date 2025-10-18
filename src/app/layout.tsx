import "./globals.css";

import type { Metadata } from "next";
import { Montserrat, PT_Serif } from "next/font/google";
// import { PhoneIcon } from "@heroicons/react/24/outline";
import { PhoneIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import Link from "next/link";
import { Bars4Icon } from "@heroicons/react/24/solid";

const montserrat = Montserrat({
	variable: "--font-mont",
	subsets: ["latin"],
	weight: "variable"
});

const pt_serif = PT_Serif({
	variable: "--font-pt-serif",
	weight: ["400", "700"],
	subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "WCIE Transport",
  description: "Request A Ride To Winners Chapel Int'l Edmonton",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pt_serif.variable} ${montserrat.variable} antialiased`}>
		<div className="min-h-screen flex flex-col font-[family-name:var(--font-mont)]">
			<header className="flex flex-row justify-between items-center py-3 px-6">
				<Link
					className="flex flex-row items-center justify-between gap-2.5"
					href="/">
					<Image
						src="/Logo.png"
						alt="WCIE Logo"
						width={40}
						height={40}/>
					<p className="text-2xl truncate font-[family-name:var(--font-pt-serif)]">WCIE Transport</p>
				</Link>
				<div className="flex flex-row justify-between items-center gap-3">
					<Link href="tel:+17808602845" title="Phone Number of Transport Unit Coordinator">
						<p className="text-lg hidden sm:block">Support</p>
						<PhoneIcon className="block sm:hidden" width={24} height={24} />
					</Link>
					<Bars4Icon width={24} height={24} className="cursor-pointer" />
				</div>
			</header>
			<main className="flex flex-col flex-1 justify-center items-center">
				{children}
			</main>
		</div>
      </body>
    </html>
  );
}
