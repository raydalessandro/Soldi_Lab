import { describe, expect, it } from "vitest";
import { generateAIContext } from "./ai-context";
import { computeInsights } from "./composite";
import { newId, nowIso } from "../id";
import type { Asset, FloorItem, IncomeItem, Space } from "../types";

function space(name = "Casa Mia"): Space {
  return {
    id: newId(),
    name,
    icon: "🏠",
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null,
  };
}

function fi(
  partial: Partial<FloorItem> &
    Pick<FloorItem, "amount" | "frequency" | "necessity_level">,
): FloorItem {
  return {
    id: partial.id ?? newId(),
    space_id: partial.space_id ?? "sp",
    name: partial.name ?? "f",
    amount: partial.amount,
    frequency: partial.frequency,
    type: partial.type ?? "fixed",
    necessity_level: partial.necessity_level,
    active: partial.active ?? true,
    is_variable_life: partial.is_variable_life ?? false,
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: partial.archived_at ?? null,
  };
}

function ii(amount: number, name = "i"): IncomeItem {
  return {
    id: newId(),
    space_id: "sp",
    name,
    amount,
    frequency: "monthly",
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null,
  };
}

function as(
  partial: Partial<Asset> &
    Pick<Asset, "current_value" | "patrimony_type" | "type">,
): Asset {
  return {
    id: newId(),
    space_id: "sp",
    name: partial.name ?? "a",
    type: partial.type,
    patrimony_type: partial.patrimony_type,
    current_value: partial.current_value,
    created_at: nowIso(),
    updated_at: nowIso(),
    archived_at: null,
  };
}

describe("generateAIContext", () => {
  it("renders the canonical sections in order", () => {
    const sp = space();
    const floor = [
      fi({ amount: 720, frequency: "monthly", necessity_level: "essential" }),
    ];
    const income = [ii(2400, "Stipendio")];
    const assets = [
      as({ type: "liquid", patrimony_type: "reserve", current_value: 5000 }),
    ];
    const insights = computeInsights(floor, income, assets);
    const md = generateAIContext({
      space: sp,
      floor,
      income,
      assets,
      insights,
      today: "2026-05-13",
      appVersion: "0.1.0",
    });

    // Sezioni nell'ordine SPEC §6
    const sectionOrder = [
      "# Contesto finanziario — Soldi_Lab",
      "## Floor (spese permanenti)",
      "## Entrate stabili",
      "## Capacità di accumulo",
      "## Health check",
      "## Patrimonio",
      "## Regole operative",
      "## Domanda",
    ];
    let cursor = 0;
    for (const heading of sectionOrder) {
      const next = md.indexOf(heading, cursor);
      expect(
        next,
        `missing or out-of-order section: ${heading}`,
      ).toBeGreaterThan(-1);
      cursor = next + heading.length;
    }
  });

  it("includes the space name, today and app version in the header", () => {
    const md = generateAIContext({
      space: space("Casa Test"),
      floor: [],
      income: [],
      assets: [],
      insights: computeInsights([], [], []),
      today: "2026-05-13",
      appVersion: "0.1.0",
    });
    expect(md).toContain("Casa Test");
    expect(md).toContain("2026-05-13");
    expect(md).toContain("0.1.0");
  });

  it("excludes archived and inactive rows from the detail lists", () => {
    const md = generateAIContext({
      space: space(),
      floor: [
        fi({
          amount: 720,
          frequency: "monthly",
          necessity_level: "essential",
          name: "Mutuo",
        }),
        fi({
          amount: 50,
          frequency: "monthly",
          necessity_level: "baseline",
          name: "DAZN dormiente",
          active: false,
        }),
        fi({
          amount: 100,
          frequency: "monthly",
          necessity_level: "lifestyle",
          name: "Cancellato",
          archived_at: nowIso(),
        }),
      ],
      income: [],
      assets: [],
      insights: computeInsights(
        [
          fi({
            amount: 720,
            frequency: "monthly",
            necessity_level: "essential",
            name: "Mutuo",
          }),
        ],
        [],
        [],
      ),
      today: "2026-05-13",
      appVersion: "0.1.0",
    });
    expect(md).toContain("Mutuo");
    expect(md).not.toContain("DAZN dormiente");
    expect(md).not.toContain("Cancellato");
  });

  it("calls out deficit, baseline anomaly, concentration and parked alerts", () => {
    const floor = [
      fi({ amount: 100, frequency: "monthly", necessity_level: "essential" }),
      fi({ amount: 800, frequency: "monthly", necessity_level: "baseline" }),
    ];
    const income = [ii(500)];
    const assets = [
      // Parked è ~78% del totale (alert parked) e anche l'asset più grande
      // (alert concentrazione, >70%).
      as({ type: "liquid", patrimony_type: "parked", current_value: 70000 }),
      as({
        type: "etf_stocks",
        patrimony_type: "productive",
        current_value: 20000,
      }),
    ];
    const md = generateAIContext({
      space: space(),
      floor,
      income,
      assets,
      insights: computeInsights(floor, income, assets),
      today: "2026-05-13",
      appVersion: "0.1.0",
    });
    expect(md).toMatch(/deficit/i);
    expect(md).toMatch(/baseline > essential/i);
    expect(md).toMatch(/Alert concentrazione/);
    expect(md).toMatch(/Alert parked/);
  });

  it("annotates the variable-life flag on the special row", () => {
    const items = [
      fi({
        amount: 550,
        frequency: "monthly",
        necessity_level: "essential",
        is_variable_life: true,
        name: "Vita variabile",
        type: "variable",
      }),
    ];
    const md = generateAIContext({
      space: space(),
      floor: items,
      income: [],
      assets: [],
      insights: computeInsights(items, [], []),
      today: "2026-05-13",
      appVersion: "0.1.0",
    });
    expect(md).toMatch(/Vita variabile.*vita variabile/);
  });
});
