import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function Header({ title = "WCIE Transport", href = "/", children }: {
    title?: string, href?: string, children?: React.ReactNode
}) {
    return (
        <header className="flex flex-row justify-between items-center py-3 px-6">
            <Link
                className="flex flex-row items-center justify-between gap-2.5"
                href={href}>
                <Image
                    src="/Logo.png"
                    alt="WCIE Logo"
                    width={40}
                    height={40} />
                <p className="text-2xl truncate font-[family-name:var(--font-pt-serif)]">{title}</p>
            </Link>
            {children}
        </header>
    );
}