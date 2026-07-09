// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import {
    buildDescriptors,
    deriveLabel,
    filterDescriptors,
    groupByCategory,
    isModified,
    kindForSchema,
    type SchemaProps,
} from "./settings-descriptors";

const SCHEMA: SchemaProps = {
    "app:*": { type: "boolean" },
    "app:tabbar": { type: "string", enum: ["top", "left"] },
    "app:confirmquit": { type: "boolean" },
    "term:fontsize": { type: "number" },
    "term:somelist": { type: "array" },
    "debug:rawkey": { type: "string" },
};

describe("deriveLabel", () => {
    it("strips the category prefix and capitalizes", () => {
        expect(deriveLabel("term:fontsize")).toBe("Fontsize");
        expect(deriveLabel("debug:rawkey")).toBe("Rawkey");
    });
});

describe("kindForSchema", () => {
    it("maps schema entries to control kinds", () => {
        expect(kindForSchema({ type: "boolean" })).toBe("toggle");
        expect(kindForSchema({ type: "number" })).toBe("number");
        expect(kindForSchema({ type: "integer" })).toBe("number");
        expect(kindForSchema({ type: "string" })).toBe("text");
        expect(kindForSchema({ type: "string", enum: ["a", "b"] })).toBe("dropdown");
        expect(kindForSchema({ type: "array" })).toBe("stringlist");
    });
});

describe("buildDescriptors", () => {
    it("skips wildcard keys and applies the overlay", () => {
        const descs = buildDescriptors(SCHEMA, {
            "term:fontsize": { label: "Font size", description: "pts", order: 1 },
        });
        const keys = descs.map((d) => d.key);
        expect(keys).not.toContain("app:*");
        expect(keys).toContain("app:tabbar");

        const fs = descs.find((d) => d.key === "term:fontsize");
        expect(fs.label).toBe("Font size");
        expect(fs.description).toBe("pts");
        expect(fs.kind).toBe("number");
        expect(fs.category).toBe("terminal");

        const tabbar = descs.find((d) => d.key === "app:tabbar");
        expect(tabbar.kind).toBe("dropdown");
        expect(tabbar.enumOptions).toEqual(["top", "left"]);
        expect(tabbar.label).toBe("Tabbar");
    });

    it("excludes keys in dedicated-file categories (conn/ai/waveai)", () => {
        const descs = buildDescriptors(
            { "conn:wshenabled": { type: "boolean" }, "ai:model": { type: "string" }, "waveai:defaultmode": { type: "string" }, "term:fontsize": { type: "number" } },
            {}
        );
        const keys = descs.map((d) => d.key);
        expect(keys).not.toContain("conn:wshenabled");
        expect(keys).not.toContain("ai:model");
        expect(keys).not.toContain("waveai:defaultmode");
        expect(keys).toContain("term:fontsize");
    });

    it("lets the overlay override kind and enumOptions", () => {
        const descs = buildDescriptors(SCHEMA, {
            "debug:rawkey": { kind: "dropdown", enumOptions: ["x", "y"] },
        });
        const d = descs.find((x) => x.key === "debug:rawkey");
        expect(d.kind).toBe("dropdown");
        expect(d.enumOptions).toEqual(["x", "y"]);
    });

    it("infers dropdown from overlay enumOptions when the schema is a plain string", () => {
        const descs = buildDescriptors(SCHEMA, {
            "debug:rawkey": { enumOptions: ["block", "bar", "underline"] },
        });
        const d = descs.find((x) => x.key === "debug:rawkey");
        expect(d.kind).toBe("dropdown");
        expect(d.enumOptions).toEqual(["block", "bar", "underline"]);
    });
});

describe("groupByCategory", () => {
    it("orders functional groups and separates advanced", () => {
        const descs = buildDescriptors(SCHEMA, {
            "debug:rawkey": { advanced: true },
        });
        const groups = groupByCategory(descs);
        const labels = groups.map((g) => g.label);
        expect(labels.indexOf("General")).toBeLessThan(labels.indexOf("Terminal"));
        const advGroup = groups.find((g) => g.key === "advanced");
        expect(advGroup.advanced.map((d) => d.key)).toContain("debug:rawkey");
        expect(advGroup.common.map((d) => d.key)).not.toContain("debug:rawkey");
    });

    it("capitalizes the label for a category not in CategoryMetadata", () => {
        const descs = buildDescriptors({ "zzz:thing": { type: "boolean" } }, {});
        const groups = groupByCategory(descs);
        const zzz = groups.find((g) => g.key === "zzz");
        expect(zzz.label).toBe("Zzz");
    });
});

describe("isModified", () => {
    it("compares current value against defaults", () => {
        expect(isModified("term:fontsize", 14, { "term:fontsize": 12 })).toBe(true);
        expect(isModified("term:fontsize", 12, { "term:fontsize": 12 })).toBe(false);
        expect(isModified("term:fontsize", undefined, { "term:fontsize": 12 })).toBe(false);
        expect(isModified("term:somelist", ["a"], { "term:somelist": ["a"] })).toBe(false);
        expect(isModified("term:somelist", ["a", "b"], { "term:somelist": ["a"] })).toBe(true);
    });
});

describe("filterDescriptors", () => {
    it("matches label, key, and description case-insensitively", () => {
        const descs = buildDescriptors(SCHEMA, {
            "term:fontsize": { label: "Font size", description: "in points" },
        });
        expect(filterDescriptors(descs, "font").map((d) => d.key)).toContain("term:fontsize");
        expect(filterDescriptors(descs, "TABBAR").map((d) => d.key)).toContain("app:tabbar");
        expect(filterDescriptors(descs, "points").map((d) => d.key)).toContain("term:fontsize");
        expect(filterDescriptors(descs, "")).toHaveLength(descs.length);
    });
});
