import { describe, expect, it } from "vitest";
import { computeIncomeBreakdown, sortIncomeItems } from "./income";
import { newId, nowIso } from "../id";
import type { IncomeItem } from "../types";

function ii(
  partial: Partial<IncomeItem> & Pick<IncomeItem, "amount" | "frequency">,
): IncomeItem {
  return {
    id: partial.id ?? newId(),
    space_id: partial.space_id ?? "space-1",
    name: partial.name ?? "entrata",
    amount: partial.amount,
    frequency: partial.frequency,
    active: partial.active ?? true,
    note: partial.note,
    created_at: partial.created_at ?? nowIso(),
    updated_at: partial.updated_at ?? nowIso(),
    archived_at: partial.archived_at ?? null,
  };
}

describe("computeIncomeBreakdown", () => {
  it("returns zero on empty list", () => {
    const r = computeIncomeBreakdown([]);
    expect(r.totalMonthly).toBe(0);
    expect(r.activeCount).toBe(0);
  });

  it("sums normalised monthly amounts of active rows", () => {
    const items = [
      ii({ amount: 2400, frequency: "monthly" }),
      ii({ amount: 2100, frequency: "annual" }), // 175/mese
    ];
    expect(computeIncomeBreakdown(items).totalMonthly).toBe(2575);
  });

  it("excludes inactive rows from total and activeCount", () => {
    const items = [
      ii({ amount: 2400, frequency: "monthly" }),
      ii({ amount: 500, frequency: "monthly", active: false }),
    ];
    const r = computeIncomeBreakdown(items);
    expect(r.totalMonthly).toBe(2400);
    expect(r.activeCount).toBe(1);
  });

  it("excludes archived rows", () => {
    const items = [
      ii({ amount: 2400, frequency: "monthly" }),
      ii({ amount: 500, frequency: "monthly", archived_at: nowIso() }),
    ];
    expect(computeIncomeBreakdown(items).totalMonthly).toBe(2400);
  });

  it("exposes monthlyByItemId for the UI", () => {
    const x = ii({ amount: 2100, frequency: "annual" });
    expect(computeIncomeBreakdown([x]).monthlyByItemId[x.id]).toBe(175);
  });
});

describe("sortIncomeItems", () => {
  it("sorts by monthly amount descending", () => {
    const a = ii({ amount: 1000, frequency: "monthly", name: "B" });
    const b = ii({ amount: 2000, frequency: "monthly", name: "A" });
    const sorted = sortIncomeItems([a, b]);
    expect(sorted.map((i) => i.name)).toEqual(["A", "B"]);
  });

  it("breaks ties by italian name", () => {
    const a = ii({ amount: 100, frequency: "monthly", name: "Zeta" });
    const b = ii({ amount: 100, frequency: "monthly", name: "Alfa" });
    expect(sortIncomeItems([a, b])[0].name).toBe("Alfa");
  });

  it("does not mutate the input", () => {
    const items = [ii({ amount: 100, frequency: "monthly" })];
    const copy = [...items];
    sortIncomeItems(items);
    expect(items).toEqual(copy);
  });
});
