// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { modalsModel } from "@/app/store/modalmodel";
import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { cn } from "@/util/util";
import { memo } from "react";

export const AboutContent = memo(({ model }: { model: WaveConfigViewModel }) => {
    const items = [
        {
            icon: "fa-lightbulb",
            label: "Tips",
            description: "Quick tips for getting the most out of Wave.",
            onClick: () => {
                model.env.createBlock({ meta: { view: "tips" } }, true, true);
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
                model.env.createBlock({ meta: { view: "help" } });
            },
        },
    ];
    return (
        <div className="flex flex-col px-6 py-4">
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
AboutContent.displayName = "AboutContent";
