/**
 * Date picker utility component
 */

"use client";

export default function SundayDatePicker({ date, onDateSelected, includeLabel = true }:
    { date: Date, onDateSelected?: (date: Date) => void, includeLabel?: boolean }
) {
    // YYYY-MM-DD
    function formatDate(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Parses a YYYY-MM-DD to a Date object
    function parseDate(dateStr: string) {
        try {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day, 11, 59, 0, 0);
        } catch {
            return null;
        }
    }

    return (
        <div className="flex flex-col gap-0.5 h-full">
            {includeLabel && <label htmlFor="date" className="text-xs">Week</label>}
            <input
                className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-inherit"
                type="date"
                name="date"
                id="date"
                value={formatDate(date)}
                step={7}
                onChange={(e) => {
                    const selectedDate = parseDate(e.target.value);
                    if (selectedDate && selectedDate.getDay() === 0) {
                        onDateSelected?.(selectedDate);
                    }
                }}
            />
        </div>
    );
}