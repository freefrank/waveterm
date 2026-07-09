// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Tooltip } from "@/app/element/tooltip";
import { DEFAULT_FONT_SIZE, getAvailableFontFamilies } from "@/app/view/waveconfig/settings-ui/fonts";
import type { SettingDescriptor } from "@/app/view/waveconfig/settings-ui/settings-descriptors";
import { FONT_SIZE_PRESETS } from "@/util/fontutil";
import { cn } from "@/util/util";
import {
    autoUpdate,
    FloatingPortal,
    offset,
    shift,
    useDismiss,
    useFloating,
    useInteractions,
} from "@floating-ui/react";
import { memo, useEffect, useMemo, useState } from "react";

type ControlProps = {
    descriptor: SettingDescriptor;
    value: any;
    onChange: (value: any) => void;
};

const ToggleControl = memo(({ value, onChange }: ControlProps) => {
    const checked = Boolean(value);
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer",
                checked ? "bg-accent" : "bg-secondary"
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                    checked ? "translate-x-4" : "translate-x-0.5"
                )}
            />
        </button>
    );
});
ToggleControl.displayName = "ToggleControl";

const NumberControl = memo(({ value, onChange }: ControlProps) => {
    const [draft, setDraft] = useState(value == null ? "" : String(value));
    useEffect(() => {
        setDraft(value == null ? "" : String(value));
    }, [value]);
    const commit = () => {
        if (draft.trim() === "") {
            return;
        }
        const num = Number(draft);
        if (!Number.isNaN(num)) {
            onChange(num);
        }
    };
    return (
        <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-28 px-2 py-1 rounded border border-border bg-background text-primary text-sm"
        />
    );
});
NumberControl.displayName = "NumberControl";

const TextControl = memo(({ value, onChange }: ControlProps) => {
    const [draft, setDraft] = useState(value == null ? "" : String(value));
    useEffect(() => {
        setDraft(value == null ? "" : String(value));
    }, [value]);
    const commit = () => {
        const orig = value == null ? "" : String(value);
        if (draft === orig) {
            return;
        }
        // Clearing the field deletes the override (null) instead of writing an empty string.
        onChange(draft === "" ? null : draft);
    };
    return (
        <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-56 px-2 py-1 rounded border border-border bg-background text-primary text-sm"
        />
    );
});
TextControl.displayName = "TextControl";

const DropdownControl = memo(({ descriptor, value, onChange }: ControlProps) => {
    return (
        <select
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-40 px-2 py-1 rounded border border-border bg-background text-primary text-sm cursor-pointer"
        >
            {(descriptor.enumOptions ?? []).map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
});
DropdownControl.displayName = "DropdownControl";

const StringListControl = memo(({ value, onChange }: ControlProps) => {
    const arr: string[] = Array.isArray(value) ? value : [];
    const [draft, setDraft] = useState(arr.join(", "));
    useEffect(() => {
        setDraft((Array.isArray(value) ? value : []).join(", "));
    }, [value]);
    const commit = () => {
        const parts = draft
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        const orig = Array.isArray(value) ? value : [];
        if (parts.length === orig.length && parts.every((p, i) => p === orig[i])) {
            return;
        }
        // Clearing the field deletes the override (null) instead of writing an empty list.
        onChange(parts.length === 0 ? null : parts);
    };
    return (
        <input
            type="text"
            value={draft}
            placeholder="comma, separated, values"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-56 px-2 py-1 rounded border border-border bg-background text-primary text-sm"
        />
    );
});
StringListControl.displayName = "StringListControl";

const FontSizeControl = memo(({ value, onChange }: ControlProps) => {
    const current = value == null ? DEFAULT_FONT_SIZE : Number(value);
    const options = FONT_SIZE_PRESETS.includes(current)
        ? FONT_SIZE_PRESETS
        : [...FONT_SIZE_PRESETS, current].sort((a, b) => a - b);
    return (
        <select
            value={String(current)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-28 px-2 py-1 rounded border border-border bg-background text-primary text-sm cursor-pointer"
        >
            {options.map((sz) => (
                <option key={sz} value={sz}>
                    {sz}px
                </option>
            ))}
        </select>
    );
});
FontSizeControl.displayName = "FontSizeControl";

const FontFamilyControl = memo(({ value, onChange }: ControlProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [families, setFamilies] = useState<string[]>([]);

    const setOpenAndReset = (next: boolean) => {
        setOpen(next);
        if (!next) {
            setQuery("");
        }
    };

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpenAndReset,
        placement: "bottom-start",
        middleware: [offset(4), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    // queryLocalFonts requires transient user activation, so load within the click handler (not an effect).
    const toggleOpen = () => {
        const next = !open;
        setOpenAndReset(next);
        if (next && families.length === 0) {
            getAvailableFontFamilies().then(setFamilies);
        }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q === "") {
            return families;
        }
        return families.filter((f) => f.toLowerCase().includes(q));
    }, [families, query]);

    const commit = (family: string) => {
        onChange(family);
        setOpenAndReset(false);
    };

    const display = value == null || value === "" ? "Default" : String(value);

    return (
        <>
            <button
                ref={refs.setReference}
                {...getReferenceProps({ onClick: toggleOpen })}
                className="w-56 flex items-center justify-between px-2 py-1 rounded border border-border bg-background text-primary text-sm cursor-pointer"
            >
                <span className="truncate" style={{ fontFamily: value || undefined }}>
                    {display}
                </span>
                <i className="fa fa-chevron-down text-xs text-muted-foreground ml-2 shrink-0" />
            </button>
            {open && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        className="w-56 rounded border border-border bg-background shadow-xl z-50"
                    >
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            placeholder="Search fonts..."
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    if (filtered.length > 0) {
                                        commit(filtered[0]);
                                    } else if (query.trim() !== "") {
                                        commit(query.trim());
                                    }
                                }
                            }}
                            className="w-full px-2 py-1 border-b border-border bg-background text-primary text-sm"
                        />
                        <div className="max-h-56 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                    {query.trim() ? `Press Enter to use "${query.trim()}"` : "No fonts"}
                                </div>
                            ) : (
                                filtered.map((f) => (
                                    <div
                                        key={f}
                                        onClick={() => commit(f)}
                                        className={cn(
                                            "px-2 py-1 text-sm cursor-pointer truncate hover:bg-secondary/50",
                                            f === value ? "bg-accentbg text-primary" : "text-secondary"
                                        )}
                                        style={{ fontFamily: f }}
                                    >
                                        {f}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </FloatingPortal>
            )}
        </>
    );
});
FontFamilyControl.displayName = "FontFamilyControl";

const SettingControl = memo((props: ControlProps) => {
    switch (props.descriptor.kind) {
        case "toggle":
            return <ToggleControl {...props} />;
        case "number":
            return <NumberControl {...props} />;
        case "dropdown":
            return <DropdownControl {...props} />;
        case "stringlist":
            return <StringListControl {...props} />;
        case "fontsize":
            return <FontSizeControl {...props} />;
        case "fontfamily":
            return <FontFamilyControl {...props} />;
        default:
            return <TextControl {...props} />;
    }
});
SettingControl.displayName = "SettingControl";

type SettingRowProps = {
    descriptor: SettingDescriptor;
    value: any;
    modified: boolean;
    onChange: (value: any) => void;
    onReset: () => void;
};

export const SettingRow = memo(({ descriptor, value, modified, onChange, onReset }: SettingRowProps) => {
    return (
        <div className="flex items-center justify-between gap-4 py-2 border-b border-border/50">
            <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                    {modified && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" title="Modified" />}
                    <span className="text-sm text-primary truncate">{descriptor.label}</span>
                    <span className="text-xs text-muted-foreground font-mono truncate">{descriptor.key}</span>
                </div>
                {descriptor.description && (
                    <span className="text-xs text-muted-foreground mt-0.5">{descriptor.description}</span>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <SettingControl descriptor={descriptor} value={value} onChange={onChange} />
                {modified && (
                    <Tooltip content="Reset to default">
                        <button
                            onClick={onReset}
                            className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-1"
                        >
                            <i className="fa fa-rotate-left text-xs" />
                        </button>
                    </Tooltip>
                )}
            </div>
        </div>
    );
});
SettingRow.displayName = "SettingRow";
