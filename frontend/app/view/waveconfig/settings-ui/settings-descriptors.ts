// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import {
    CategoryMetadata,
    ExcludedCategories,
    type ControlKind,
    type SettingsOverlayEntry,
} from "@/app/view/waveconfig/settings-ui/settings-metadata";

export type SchemaEntry = { type?: string; enum?: string[] };
export type SchemaProps = Record<string, SchemaEntry>;

export type SettingDescriptor = {
    key: string;
    label: string;
    description?: string;
    kind: ControlKind;
    enumOptions?: string[];
    category: string;
    advanced: boolean;
    order: number;
};

export type CategoryGroup = {
    key: string;
    label: string;
    order: number;
    common: SettingDescriptor[];
    advanced: SettingDescriptor[];
};

const UNLISTED_CATEGORY_ORDER = 1000;

export function deriveLabel(key: string): string {
    const part = key.includes(":") ? key.slice(key.indexOf(":") + 1) : key;
    if (part.length === 0) {
        return key;
    }
    return part.charAt(0).toUpperCase() + part.slice(1);
}

export function kindForSchema(entry: SchemaEntry): ControlKind {
    if (entry.type === "boolean") {
        return "toggle";
    }
    if (entry.type === "number" || entry.type === "integer") {
        return "number";
    }
    if (entry.type === "array") {
        return "stringlist";
    }
    if (entry.type === "string" && entry.enum?.length) {
        return "dropdown";
    }
    return "text";
}

function categoryOf(key: string): string {
    return key.includes(":") ? key.slice(0, key.indexOf(":")) : key;
}

export function buildDescriptors(
    schemaProps: SchemaProps,
    overlay: Record<string, SettingsOverlayEntry>
): SettingDescriptor[] {
    const result: SettingDescriptor[] = [];
    for (const key of Object.keys(schemaProps)) {
        if (key.endsWith(":*")) {
            continue;
        }
        if (ExcludedCategories.includes(categoryOf(key))) {
            continue;
        }
        const schemaEntry = schemaProps[key] ?? {};
        const ov = overlay[key] ?? {};
        const kind = ov.kind ?? kindForSchema(schemaEntry);
        const enumOptions = ov.enumOptions ?? schemaEntry.enum;
        result.push({
            key,
            label: ov.label ?? deriveLabel(key),
            description: ov.description,
            kind,
            enumOptions: kind === "dropdown" ? (enumOptions ?? []) : undefined,
            category: categoryOf(key),
            advanced: ov.advanced ?? false,
            order: ov.order ?? UNLISTED_CATEGORY_ORDER,
        });
    }
    return result;
}

export function groupByCategory(descriptors: SettingDescriptor[]): CategoryGroup[] {
    const metaByKey = new Map(CategoryMetadata.map((c) => [c.key, c]));
    const byCat = new Map<string, CategoryGroup>();
    for (const desc of descriptors) {
        let group = byCat.get(desc.category);
        if (!group) {
            const meta = metaByKey.get(desc.category);
            group = {
                key: desc.category,
                label: meta?.label ?? desc.category.charAt(0).toUpperCase() + desc.category.slice(1),
                order: meta?.order ?? UNLISTED_CATEGORY_ORDER,
                common: [],
                advanced: [],
            };
            byCat.set(desc.category, group);
        }
        (desc.advanced ? group.advanced : group.common).push(desc);
    }
    const groups = Array.from(byCat.values());
    const sortDescs = (a: SettingDescriptor, b: SettingDescriptor) =>
        a.order - b.order || a.label.localeCompare(b.label);
    for (const g of groups) {
        g.common.sort(sortDescs);
        g.advanced.sort(sortDescs);
    }
    groups.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    return groups;
}

export function isModified(key: string, currentValue: any, defaults: Record<string, any>): boolean {
    if (currentValue === undefined) {
        return false;
    }
    return JSON.stringify(currentValue) !== JSON.stringify(defaults?.[key]);
}

export function filterDescriptors(descriptors: SettingDescriptor[], query: string): SettingDescriptor[] {
    const q = query.trim().toLowerCase();
    if (q === "") {
        return descriptors;
    }
    return descriptors.filter((d) => {
        return (
            d.key.toLowerCase().includes(q) ||
            d.label.toLowerCase().includes(q) ||
            (d.description?.toLowerCase().includes(q) ?? false)
        );
    });
}
