"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DateSelector() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const sunday = new Date();
    if (sunday.getDay() !== 0) {
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay()))
    }

    const date = searchParams.has("date")
        ? new Date(searchParams.get("date")!)
        : new Date();

    const diffInDays = Math.round((date.getTime() - sunday.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const initialIndex = (diffInDays < -7)
        ? 0
        : (diffInDays > -7)
            ? 2
            : 1;
    const [index, setIndex] = useState(initialIndex);

    const names = [
        "2 Weeks Ago",
        "Last Week",
        "This Week"
    ];

    return (
        <div className="flex border-b border-tertiary min-w-full">
            {names.map((n, i) =>
                <button
                    key={i}
                    className={clsx("flex-1 text-center py-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer", {
                        "border-transparent text-foreground": i != index,
                        "border-primary text-primary": i == index
                    })}
                    onClick={() => {
                        setIndex(i);

                        const date = new Date();
                        date.setDate(sunday.getDate() + (i - 2) * 7)

                        const params = new URLSearchParams(searchParams);
                        params.set("date", date.toLocaleDateString("en-CA").replaceAll("/", "-"));

                        replace(`${pathname}?${params.toString()}`);
                    }}
                >
                    {n}
                </button>
            )}
        </div>
    );
}