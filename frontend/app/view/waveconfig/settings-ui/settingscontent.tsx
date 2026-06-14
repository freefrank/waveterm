// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { modalsModel } from "@/app/store/modalmodel";
import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { useWaveEnv } from "@/app/waveenv/waveenv";
import type { WaveConfigEnv } from "@/app/view/waveconfig/waveconfigenv";
import { SettingRow } from "@/app/view/waveconfig/settings-ui/controls";
import { SettingsOverlay } from "@/app/view/waveconfig/settings-ui/settings-metadata";
import {
    buildDescriptors,
    filterDescriptors,
    groupByCategory,
    isModified,
    type SchemaProps,
    type SettingDescriptor,
} from "@/app/view/waveconfig/settings-ui/settings-descriptors";
import { cn } from "@/util/util";
import { useAtom, useAtomValue } from "jotai";
import { memo, useMemo } from "react";
import settingsSchema from "../../../../../schema/settings.json";

const SCHEMA_PROPS = (settingsSchema as any).$defs.SettingsType.properties as SchemaProps;
const ALL_DESCRIPTORS = buildDescriptors(SCHEMA_PROPS, SettingsOverlay);
const GROUPS = groupByCategory(ALL_DESCRIPTORS);

const ABOUT_CATEGORY = "about";

const AboutPanel = memo(() => {
    const env = useWaveEnv<WaveConfigEnv>();
    const items = [
        {
            icon: "fa-lightbulb",
            label: "Tips",
            description: "Quick tips for getting the most out of Wave.",
            onClick: () => {
                env.createBlock({ meta: { view: "tips" } }, true, true);
            },
        },
        {
            icon: "fa-book-open",
            label: "Release Notes",
            description: "See what's new in this version.",
            onClick: () => {
                modalsModel.pushModal("UpgradeOnboardingPatch", { isReleaseNotes: true });
            },
        },
        {
            icon: "fa-circle-question",
            label: "Help",
            description: "Open the in-app help.",
            onClick: () => {
                env.createBlock({ meta: { view: "help" } });
            },
        },
    ];
    return (
        <div className="flex flex-col px-6 py-3">
            {items.map((it) => (
                <div
                    key={it.label}
                    onClick={it.onClick}
                    className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded cursor-pointer hover:bg-secondary/40 transition-colors"
                >
                    <i className={cn("fa fa-sharp fa-solid w-5 text-center text-secondary", it.icon)} />
                    <div className="flex flex-col">
                        <span className="text-sm text-primary">{it.label}</span>
                        <span className="text-xs text-muted-foreground">{it.description}</span>
                    </div>
                </div>
            ))}
        </div>
    );
});
AboutPanel.displayName = "AboutPanel";

const SettingsPanel = memo(({ model }: { model: WaveConfigViewModel }) => {
    const env = useWaveEnv<WaveConfigEnv>();
    const fullConfig = useAtomValue(env.atoms.fullConfigAtom);
    const defaults = useAtomValue(model.settingsDefaultsAtom);
    const category = useAtomValue(model.settingsCategoryAtom);
    const search = useAtomValue(model.settingsSearchAtom);

    const settings = (fullConfig?.settings ?? {}) as Record<string, any>;

    const searching = search.trim() !== "";
    const visible: SettingDescriptor[] = useMemo(() => {
        if (searching) {
            return filterDescriptors(ALL_DESCRIPTORS, search);
        }
        const group = GROUPS.find((g) => g.key === category);
        if (!group) {
            return [];
        }
        return [...group.common, ...group.advanced];
    }, [searching, search, category]);

    const renderRow = (desc: SettingDescriptor) => (
        <SettingRow
            key={desc.key}
            descriptor={desc}
            value={settings[desc.key]}
            modified={isModified(desc.key, settings[desc.key], defaults)}
            onChange={(v) => model.setSetting(desc.key, v)}
            onReset={() => model.resetSetting(desc.key)}
        />
    );

    if (!searching && category === ABOUT_CATEGORY) {
        return <AboutPanel />;
    }
    if (visible.length === 0) {
        return <div className="p-6 text-muted-foreground text-sm">No matching settings.</div>;
    }
    return <div className="flex flex-col px-6 py-2">{visible.map(renderRow)}</div>;
});
SettingsPanel.displayName = "SettingsPanel";

const CategorySidebar = memo(({ model }: { model: WaveConfigViewModel }) => {
    const [category, setCategory] = useAtom(model.settingsCategoryAtom);
    const search = useAtomValue(model.settingsSearchAtom);
    const disabled = search.trim() !== "";
    return (
        <div className="flex flex-col w-44 border-r border-border overflow-y-auto shrink-0">
            {GROUPS.map((g) => (
                <div
                    key={g.key}
                    onClick={() => !disabled && setCategory(g.key)}
                    className={cn(
                        "px-4 py-1.5 text-sm cursor-pointer transition-colors",
                        disabled && "opacity-40 cursor-default",
                        !disabled && category === g.key
                            ? "bg-accentbg text-primary"
                            : "text-secondary hover:bg-secondary/50"
                    )}
                >
                    {g.label}
                </div>
            ))}
            <div
                key={ABOUT_CATEGORY}
                onClick={() => !disabled && setCategory(ABOUT_CATEGORY)}
                className={cn(
                    "px-4 py-1.5 text-sm cursor-pointer transition-colors mt-auto border-t border-border",
                    disabled && "opacity-40 cursor-default",
                    !disabled && category === ABOUT_CATEGORY
                        ? "bg-accentbg text-primary"
                        : "text-secondary hover:bg-secondary/50"
                )}
            >
                About
            </div>
        </div>
    );
});
CategorySidebar.displayName = "CategorySidebar";

export const SettingsContent = memo(({ model }: { model: WaveConfigViewModel }) => {
    const [search, setSearch] = useAtom(model.settingsSearchAtom);

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-2 border-b border-border">
                <input
                    type="text"
                    value={search}
                    placeholder="Search settings..."
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-border bg-background text-primary text-sm"
                />
            </div>
            <div className="flex flex-row flex-1 min-h-0">
                <CategorySidebar model={model} />
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <SettingsPanel model={model} />
                </div>
            </div>
        </div>
    );
});
SettingsContent.displayName = "SettingsContent";
