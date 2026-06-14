// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

export type ControlKind = "toggle" | "number" | "text" | "dropdown" | "stringlist";

export type SettingsOverlayEntry = {
    label?: string;
    description?: string;
    kind?: ControlKind;
    enumOptions?: string[];
    advanced?: boolean;
    order?: number;
};

export type CategoryMeta = {
    key: string;
    label: string;
    order: number;
};

// Human labels + display order for category prefixes. Categories not listed here
// fall back to a capitalized prefix and sort after the listed ones (see settings-descriptors).
export const CategoryMetadata: CategoryMeta[] = [
    { key: "app", label: "Application", order: 10 },
    { key: "window", label: "Window", order: 20 },
    { key: "term", label: "Terminal", order: 30 },
    { key: "ai", label: "AI", order: 40 },
    { key: "editor", label: "Editor", order: 50 },
    { key: "web", label: "Web", order: 60 },
    { key: "conn", label: "Connections", order: 70 },
    { key: "tab", label: "Tabs", order: 80 },
    { key: "preview", label: "Preview", order: 90 },
    { key: "markdown", label: "Markdown", order: 100 },
    { key: "autoupdate", label: "Auto Update", order: 110 },
    { key: "telemetry", label: "Telemetry", order: 120 },
    { key: "widget", label: "Widgets", order: 130 },
    { key: "tsunami", label: "Tsunami", order: 140 },
    { key: "feature", label: "Features", order: 150 },
    { key: "debug", label: "Debug", order: 160 },
];

// Overlay keyed by full setting key. Only important keys need entries; everything else
// falls back to schema-derived defaults. enumOptions here are STATIC (v1).
export const SettingsOverlay: Record<string, SettingsOverlayEntry> = {
    "app:tabbar": {
        label: "Tab bar position",
        description: "Where the tab bar is displayed.",
        enumOptions: ["top", "left"],
    },
    "app:defaultnewblock": {
        label: "Default new block",
        description: "Block type opened when creating a new block.",
    },
    "app:confirmquit": {
        label: "Confirm on quit",
        description: "Ask for confirmation before quitting Wave.",
    },
    "app:focusfollowscursor": {
        label: "Focus follows cursor",
        enumOptions: ["off", "on", "term"],
    },
    "window:nativetitlebar": {
        label: "Native title bar",
        description: "Use the OS native title bar instead of the custom one.",
    },
    "window:confirmclose": {
        label: "Confirm on window close",
    },
    "window:tilegapsize": {
        label: "Tile gap size",
        description: "Gap (in px) between tiled blocks.",
    },
    "term:fontsize": {
        label: "Font size",
        description: "Terminal font size in points.",
    },
    "term:fontfamily": {
        label: "Font family",
        description: "Terminal font family name.",
    },
    "term:cursor": {
        label: "Cursor style",
        enumOptions: ["block", "bar", "underline"],
    },
    "term:cursorblink": {
        label: "Cursor blink",
    },
    "term:copyonselect": {
        label: "Copy on select",
    },
    "term:osc52": {
        label: "OSC 52 clipboard",
        enumOptions: ["focus", "always"],
    },
    "ai:model": {
        label: "AI model",
        description: "Default model used by Wave AI.",
    },
    "ai:maxtokens": {
        label: "AI max tokens",
    },
    "editor:fontsize": {
        label: "Editor font size",
    },
    "editor:wordwrap": {
        label: "Word wrap",
    },
    "web:defaulturl": {
        label: "Default URL",
        description: "Page opened in a new web block.",
    },
    "telemetry:enabled": {
        label: "Telemetry enabled",
        description: "Send anonymous usage telemetry to help improve Wave.",
    },
    "autoupdate:enabled": {
        label: "Auto update enabled",
    },
};
