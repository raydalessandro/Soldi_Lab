import { describe, expect, it } from "vitest";
import {
  appSettingsSchema,
  assetSchema,
  backupFileSchema,
  floorItemSchema,
  incomeItemSchema,
  spaceSchema,
} from "./zod-schemas";
import { newId, nowIso } from "./id";

function baseSpace() {
  return {
    id: newId(),
    name: "Casa Mia",
    icon: "🏠",
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null as string | null,
  };
}

function baseFloor() {
  return {
    id: newId(),
    space_id: newId(),
    name: "Mutuo",
    amount: 720,
    frequency: "monthly" as const,
    type: "fixed" as const,
    necessity_level: "essential" as const,
    active: true,
    is_variable_life: false,
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null as string | null,
  };
}

function baseIncome() {
  return {
    id: newId(),
    space_id: newId(),
    name: "Stipendio",
    amount: 2400,
    frequency: "monthly" as const,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null as string | null,
  };
}

function baseAsset() {
  return {
    id: newId(),
    space_id: newId(),
    name: "C/C",
    type: "liquid" as const,
    patrimony_type: "reserve" as const,
    current_value: 4500,
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null as string | null,
  };
}

describe("zod-schemas", () => {
  it("validates a well-formed space", () => {
    expect(spaceSchema.safeParse(baseSpace()).success).toBe(true);
  });

  it("rejects a space with empty name", () => {
    const bad = { ...baseSpace(), name: "" };
    expect(spaceSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a floor item with negative amount", () => {
    const bad = { ...baseFloor(), amount: -10 };
    expect(floorItemSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a floor item with unknown frequency", () => {
    const bad = { ...baseFloor(), frequency: "daily" };
    expect(floorItemSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a floor item with unknown necessity_level", () => {
    const bad = { ...baseFloor(), necessity_level: "luxury" };
    expect(floorItemSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts the variable_life flag combined with essential variable", () => {
    const ok = {
      ...baseFloor(),
      is_variable_life: true,
      type: "variable" as const,
    };
    expect(floorItemSchema.safeParse(ok).success).toBe(true);
  });

  it("validates an income item", () => {
    expect(incomeItemSchema.safeParse(baseIncome()).success).toBe(true);
  });

  it("validates an asset without optional quote fields", () => {
    expect(assetSchema.safeParse(baseAsset()).success).toBe(true);
  });

  it("validates an asset with all quote fields", () => {
    const ok = {
      ...baseAsset(),
      quote_symbol: "SWDA.MI",
      quote_source: "yahoo" as const,
      quantity: 200,
      last_quote: 87.5,
      last_quote_at: nowIso(),
    };
    expect(assetSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects an asset with bad maturity_date format", () => {
    const bad = { ...baseAsset(), maturity_date: "31/12/2030" };
    expect(assetSchema.safeParse(bad).success).toBe(false);
  });

  it("validates app settings", () => {
    expect(
      appSettingsSchema.safeParse({
        id: "singleton",
        active_space_id: newId(),
        theme: "auto",
        onboarding_completed: false,
      }).success,
    ).toBe(true);
  });

  it("rejects app settings without literal 'singleton' id", () => {
    expect(
      appSettingsSchema.safeParse({
        id: "other",
        active_space_id: newId(),
        theme: "auto",
        onboarding_completed: false,
      }).success,
    ).toBe(false);
  });

  it("validates a backup file shape end-to-end", () => {
    const ok = backupFileSchema.safeParse({
      schema_version: 1,
      exported_at: nowIso(),
      app_version: "0.1.0",
      spaces: [baseSpace()],
      floor_items: [baseFloor()],
      income_items: [baseIncome()],
      assets: [baseAsset()],
      space_settings: [{ space_id: newId(), ai_advisor_enabled: false }],
    });
    expect(ok.success).toBe(true);
  });

  it("rejects a backup with schema_version <= 0", () => {
    const bad = backupFileSchema.safeParse({
      schema_version: 0,
      exported_at: nowIso(),
      app_version: "0.1.0",
      spaces: [],
      floor_items: [],
      income_items: [],
      assets: [],
      space_settings: [],
    });
    expect(bad.success).toBe(false);
  });
});
