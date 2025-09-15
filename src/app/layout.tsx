import "./globals.css";

import type { Metadata } from "next";
import { Montserrat, PT_Serif } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

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
				{children}
			</main>
		</div>
      </body>
    </html>
  );
}
