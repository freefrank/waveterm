// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

export type ControlKind = "toggle" | "number" | "text" | "dropdown" | "stringlist" | "fontfamily" | "fontsize";

export type SettingsOverlayEntry = {
    label?: string;
    description?: string;
    kind?: ControlKind;
    enumOptions?: string[];
    advanced?: boolean;
    order?: number;
    group?: string;
};

export type CategoryMeta = {
    key: string;
    label: string;
    order: number;
};

// Functional groups shown in the sidebar/panel. A setting's group is resolved as:
// overlay.group (if set) -> PrefixGroupDefaults[prefix] -> the raw prefix.
export const CategoryMetadata: CategoryMeta[] = [
    { key: "appearance", label: "Appearance", order: 10 },
    { key: "general", label: "General", order: 20 },
    { key: "terminal", label: "Terminal", order: 30 },
    { key: "editor", label: "Editor", order: 40 },
    { key: "window", label: "Window & Layout", order: 50 },
    { key: "files", label: "Files & Preview", order: 60 },
    { key: "web", label: "Web", order: 70 },
    { key: "updates", label: "Updates", order: 80 },
    { key: "advanced", label: "Advanced", order: 90 },
];

// Default functional group per key prefix, for keys without an explicit overlay.group.
// Cross-cutting keys (e.g. fonts/themes living under term/editor) override this via overlay.group.
export const PrefixGroupDefaults: Record<string, string> = {
    app: "general",
    window: "appearance",
    term: "terminal",
    editor: "editor",
    markdown: "appearance",
    preview: "files",
    web: "web",
    autoupdate: "updates",
    telemetry: "advanced",
    debug: "advanced",
    tsunami: "advanced",
    feature: "advanced",
    widget: "advanced",
    tab: "appearance",
};

// Category prefixes that have a dedicated config file and so are excluded from the general
// settings panel: conn:* lives in connections.json, ai:*/waveai:* live in waveai.json (set
// globally there and per-mode). Keys in these categories never become descriptors, so they
// are absent from the sidebar, panel, and search.
export const ExcludedCategories: string[] = ["conn", "ai", "waveai"];

// Overlay keyed by full setting key. Only important keys need entries; everything else
// falls back to schema-derived defaults + the prefix's default group. enumOptions are STATIC (v1).
export const SettingsOverlay: Record<string, SettingsOverlayEntry> = {
    // --- Appearance (cross-cutting: pulled from term/editor/window/tab prefixes) ---
    "term:fontsize": {
        label: "Font size",
        description: "Terminal font size in points.",
        kind: "fontsize",
        group: "appearance",
    },
    "term:fontfamily": {
        label: "Font family",
        description: "Terminal font family name.",
        kind: "fontfamily",
        group: "appearance",
    },
    "term:theme": {
        label: "Terminal theme",
        group: "appearance",
    },
    "term:transparency": {
        label: "Terminal transparency",
        group: "appearance",
    },
    "term:cursor": {
        label: "Cursor style",
        enumOptions: ["block", "bar", "underline"],
        group: "appearance",
    },
    "term:cursorblink": {
        label: "Cursor blink",
        group: "appearance",
    },
    "editor:fontsize": {
        label: "Editor font size",
        group: "appearance",
    },
    "app:tabbar": {
        label: "Tab bar position",
        description: "Where the tab bar is displayed.",
        enumOptions: ["top", "left"],
        group: "appearance",
    },
    "window:nativetitlebar": {
        label: "Native title bar",
        description: "Use the OS native title bar instead of the custom one.",
    },

    // --- General (app behavior + a few window keys) ---
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
    "window:confirmclose": {
        label: "Confirm on window close",
        group: "general",
    },
    "window:savelastwindow": {
        label: "Restore last window",
        group: "general",
    },
    "window:fullscreenonlaunch": {
        label: "Fullscreen on launch",
        group: "general",
    },
    "window:showmenubar": {
        label: "Show menu bar",
        group: "general",
    },

    // --- Terminal (behavior) ---
    "term:copyonselect": {
        label: "Copy on select",
    },
    "term:osc52": {
        label: "OSC 52 clipboard",
        enumOptions: ["focus", "always"],
    },

    // --- Editor ---
    "editor:wordwrap": {
        label: "Word wrap",
    },

    // --- Window & Layout ---
    "window:tilegapsize": {
        label: "Tile gap size",
        description: "Gap (in px) between tiled blocks.",
        group: "window",
    },
    "window:maxtabcachesize": {
        label: "Max tab cache size",
        group: "window",
    },
    "window:dimensions": {
        label: "Window dimensions",
        group: "window",
    },
    "window:disablehardwareacceleration": {
        label: "Disable hardware acceleration",
        group: "window",
    },
    "tab:confirmclose": {
        label: "Confirm on tab close",
        group: "window",
    },

    // --- Web ---
    "web:defaulturl": {
        label: "Default URL",
        description: "Page opened in a new web block.",
    },

    // --- Updates ---
    "autoupdate:enabled": {
        label: "Auto update enabled",
    },

    // --- Advanced ---
    "telemetry:enabled": {
        label: "Telemetry enabled",
        description: "Send anonymous usage telemetry to help improve Wave.",
    },
};
