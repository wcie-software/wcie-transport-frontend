/**
 * Generates a deterministic bold color string from a given string input (like a route ID).
 * Written by Antigravity
 */
export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Multiply by a spread factor (approx golden angle) to separate similar strings
    const hue = Math.abs((hash * 137) % 360);

    // Add slight variance to saturation and lightness for extra distinctness
    // Using bitwise operations to extract "random" components from the same hash
    const saturation = 70 + (Math.abs(hash) % 30); // 70-100%
    const lightness = 45 + (Math.abs(hash >> 4) % 15); // 45-60%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}	
