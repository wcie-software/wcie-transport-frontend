/**
 * Date picker utility component
 */

"use client";

import { defaultFormatter, parseSundayKey } from "@/app/utils/util";

export default function SundayDatePicker({ date, onDateSelected, includeLabel = true, id = "date", timeZone }:
    { date: Date, onDateSelected?: (date: Date) => void, includeLabel?: boolean, id?: string, timeZone?: "America/Edmonton" }
) {
    // YYYY-MM-DD
    function formatDate(date: Date) {
        if (timeZone) return defaultFormatter(date).replaceAll("/", "-");
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Parses a YYYY-MM-DD to a Date object
    function parseDate(dateStr: string) {
        try {
            const [year, month, day] = dateStr.split('-').map(Number);
            if (timeZone) return parseSundayKey(`${month}-${day}-${year}`);
            return new Date(year, month - 1, day, 11, 59, 0, 0);
        } catch {
            return null;
        }
    }

    return (
        <div className="flex flex-col gap-0.5 h-full">
            {includeLabel && <label htmlFor={id} className="text-xs">Week</label>}
            <input
                className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-inherit"
                type="date"
                name={id}
                id={id}
                value={formatDate(date)}
                step={7}
                onChange={(e) => {
                    const selectedDate = parseDate(e.target.value);
                    if (selectedDate && (timeZone ? selectedDate.getUTCDay() : selectedDate.getDay()) === 0) {
                        onDateSelected?.(selectedDate);
                    }
                }}
            />
        </div>
    );
}
