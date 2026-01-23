"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DateSelector() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Nearest Sunday from today
    const sunday = new Date();
    if (sunday.getDay() !== 0) {
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay()))
    }

    // Attempt to get date in search params
    const date = searchParams.has("date")
        ? new Date(searchParams.get("date")!)
        : new Date();

    // `getTime` returns milliseconds, so convert to days
    const diffInDays = Math.round((date.getTime() - sunday.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const dateDifferences = [
        // [-28, "A Month Ago"],
        // [-21, "3 Weeks Ago"],
        [-14, "2 Weeks Ago"],
        [-7, "Last Week"],
        [0, "This Week"],
    ];
    const names = dateDifferences.map(d => d[1]);

    // Based on the difference in days (from the coming Sunday to the provided date)
    // Pick a title from `dateDifferences`
    let initialIndex = dateDifferences.length - 1;
    for (let i = 0; i < dateDifferences.length - 1; i++) {
        const diff = Number(dateDifferences[i][0]);

        if (diffInDays === diff) {
            initialIndex = i;
            break;
        }
    }

    const [index, setIndex] = useState(initialIndex);

    return (
        <div className="flex flex-row gap-6 border-b border-tertiary min-w-full overflow-x-auto">
            {names.map((n, i) =>
                <button
                    key={i}
                    className={clsx("whitespace-nowrap flex-1 text-center py-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer", {
                        "border-transparent text-foreground": i != index,
                        "border-primary text-primary": i == index
                    })}
                    onClick={() => {
                        setIndex(i);

                        const date = new Date();
                        // Set date relative to nearest Sunday (move backwards)
                        date.setDate(sunday.getDate() + (7 * (i - names.length + 1)))

                        // Replace search params with the date
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