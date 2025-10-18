import "./globals.css";

import type { Metadata } from "next";
import { Montserrat, PT_Serif } from "next/font/google";

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
      <body className={`${pt_serif.variable} ${montserrat.variable} antialiased font-[family-name:var(--font-mont)]`}>
	  	{ children }
      </body>
    </html>
  );
}
