// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

export const DEFAULT_FONT_SIZE = 12;

// Shown when queryLocalFonts is unavailable or the local-fonts permission is denied.
const FALLBACK_FONT_FAMILIES = [
    "Hack",
    "JetBrains Mono",
    "Cascadia Code",
    "Cascadia Mono",
    "Consolas",
    "Courier New",
    "DejaVu Sans Mono",
    "Fira Code",
    "Inconsolata",
    "Menlo",
    "Monaco",
    "SF Mono",
    "Source Code Pro",
    "Ubuntu Mono",
];

let cachedFamilies: string[] = null;

// Returns installed font families via the Local Font Access API (queryLocalFonts), falling back
// to a curated monospace list. Must be triggered from a user gesture (the API requires activation);
// the result is cached so subsequent opens are instant.
export async function getAvailableFontFamilies(): Promise<string[]> {
    if (cachedFamilies != null) {
        return cachedFamilies;
    }
    try {
        const query = (window as any).queryLocalFonts;
        if (typeof query === "function") {
            const fonts = await query();
            const families = Array.from(new Set(fonts.map((f: any) => f.family as string))).sort((a, b) =>
                a.localeCompare(b)
            );
            if (families.length > 0) {
                cachedFamilies = families;
                return cachedFamilies;
            }
        }
    } catch {
        // unsupported or permission denied -> curated fallback below
    }
    cachedFamilies = [...FALLBACK_FONT_FAMILIES].sort((a, b) => a.localeCompare(b));
    return cachedFamilies;
}
