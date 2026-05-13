import { describe, expect, it } from "vitest";
import { computeFloorBreakdown, sortFloorItems } from "./floor";
import { newId, nowIso } from "../id";
import type { FloorItem } from "../types";

function fi(
  partial: Partial<FloorItem> &
    Pick<FloorItem, "amount" | "frequency" | "necessity_level">,
): FloorItem {
  return {
    id: partial.id ?? newId(),
    space_id: partial.space_id ?? "space-1",
    name: partial.name ?? "voce",
    amount: partial.amount,
    frequency: partial.frequency,
    type: partial.type ?? "fixed",
    necessity_level: partial.necessity_level,
    active: partial.active ?? true,
    is_variable_life: partial.is_variable_life ?? false,
    note: partial.note,
    created_at: partial.created_at ?? nowIso(),
    updated_at: partial.updated_at ?? nowIso(),
    archived_at: partial.archived_at ?? null,
  };
}

describe("computeFloorBreakdown", () => {
  it("returns zero totals on empty input", () => {
    const result = computeFloorBreakdown([]);
    expect(result.total).toBe(0);
    expect(result.byLevel).toEqual({
      essential: 0,
      baseline: 0,
      lifestyle: 0,
    });
  });

  it("sums monthly-normalized amounts per level", () => {
    const items = [
      fi({ amount: 720, frequency: "monthly", necessity_level: "essential" }),
      fi({ amount: 90, frequency: "bimonthly", necessity_level: "essential" }), // 45/mese
      fi({ amount: 600, frequency: "annual", necessity_level: "baseline" }), // 50/mese
      fi({ amount: 80, frequency: "monthly", necessity_level: "lifestyle" }),
    ];
    const { byLevel, total } = computeFloorBreakdown(items);
    expect(byLevel.essential).toBe(765);
    expect(byLevel.baseline).toBe(50);
    expect(byLevel.lifestyle).toBe(80);
    expect(total).toBe(895);
  });

  it("ignores inactive items in the totals", () => {
    const items = [
      fi({ amount: 720, frequency: "monthly", necessity_level: "essential" }),
      fi({
        amount: 30,
        frequency: "monthly",
        necessity_level: "baseline",
        active: false,
      }),
    ];
    const { total, byLevel } = computeFloorBreakdown(items);
    expect(total).toBe(720);
    expect(byLevel.baseline).toBe(0);
  });

  it("ignores archived items in the totals", () => {
    const items = [
      fi({ amount: 100, frequency: "monthly", necessity_level: "essential" }),
      fi({
        amount: 200,
        frequency: "monthly",
        necessity_level: "essential",
        archived_at: nowIso(),
      }),
    ];
    expect(computeFloorBreakdown(items).total).toBe(100);
  });

  it("exposes per-item monthly even for inactive rows (used by UI)", () => {
    const it1 = fi({
      amount: 600,
      frequency: "annual",
      necessity_level: "baseline",
      active: false,
    });
    const { monthlyByItemId } = computeFloorBreakdown([it1]);
    expect(monthlyByItemId[it1.id]).toBe(50);
  });
});

describe("sortFloorItems", () => {
  it("puts the variable-life row first regardless of amount", () => {
    const variable = fi({
      amount: 200,
      frequency: "monthly",
      necessity_level: "essential",
      is_variable_life: true,
      name: "Vita variabile",
    });
    const expensive = fi({
      amount: 800,
      frequency: "monthly",
      necessity_level: "essential",
      name: "Mutuo",
    });
    const sorted = sortFloorItems([expensive, variable]);
    expect(sorted[0].id).toBe(variable.id);
    expect(sorted[1].id).toBe(expensive.id);
  });

  it("sorts the rest by monthly amount descending", () => {
    const big = fi({
      amount: 600,
      frequency: "annual", // 50/mese
      necessity_level: "baseline",
      name: "Assicurazione",
    });
    const huge = fi({
      amount: 720,
      frequency: "monthly",
      necessity_level: "essential",
      name: "Mutuo",
    });
    const small = fi({
      amount: 13,
      frequency: "monthly",
      necessity_level: "baseline",
      name: "Netflix",
    });
    const sorted = sortFloorItems([small, big, huge]);
    expect(sorted.map((i) => i.name)).toEqual([
      "Mutuo",
      "Assicurazione",
      "Netflix",
    ]);
  });

  it("breaks monthly ties by italian name order", () => {
    const a = fi({
      amount: 50,
      frequency: "monthly",
      necessity_level: "lifestyle",
      name: "Zucchero",
    });
    const b = fi({
      amount: 50,
      frequency: "monthly",
      necessity_level: "lifestyle",
      name: "Caffè",
    });
    const sorted = sortFloorItems([a, b]);
    expect(sorted[0].name).toBe("Caffè");
  });

  it("does not mutate the input array", () => {
    const items = [
      fi({ amount: 100, frequency: "monthly", necessity_level: "essential" }),
      fi({ amount: 200, frequency: "monthly", necessity_level: "essential" }),
    ];
    const copy = [...items];
    sortFloorItems(items);
    expect(items).toEqual(copy);
  });
});
