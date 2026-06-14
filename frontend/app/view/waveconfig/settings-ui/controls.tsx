// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Tooltip } from "@/app/element/tooltip";
import type { SettingDescriptor } from "@/app/view/waveconfig/settings-ui/settings-descriptors";
import { cn } from "@/util/util";
import { memo, useEffect, useState } from "react";

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
    return (
        <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onChange(draft)}
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
        onChange(parts);
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
