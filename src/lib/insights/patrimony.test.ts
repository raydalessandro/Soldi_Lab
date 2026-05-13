import { describe, expect, it } from "vitest";
import {
  computePatrimonyBreakdown,
  computeReserveStatus,
  sortAssets,
} from "./patrimony";
import { newId, nowIso } from "../id";
import type { Asset } from "../types";

function as(
  partial: Partial<Asset> &
    Pick<Asset, "current_value" | "patrimony_type" | "type">,
): Asset {
  return {
    id: partial.id ?? newId(),
    space_id: partial.space_id ?? "space-1",
    name: partial.name ?? "asset",
    type: partial.type,
    patrimony_type: partial.patrimony_type,
    current_value: partial.current_value,
    expected_return_pct: partial.expected_return_pct,
    monthly_contribution: partial.monthly_contribution,
    maturity_date: partial.maturity_date,
    note: partial.note,
    quote_symbol: partial.quote_symbol,
    quote_source: partial.quote_source,
    quantity: partial.quantity,
    last_quote: partial.last_quote,
    last_quote_at: partial.last_quote_at,
    created_at: partial.created_at ?? nowIso(),
    updated_at: partial.updated_at ?? nowIso(),
    archived_at: partial.archived_at ?? null,
  };
}

describe("computePatrimonyBreakdown", () => {
  it("returns zeros on empty list", () => {
    const r = computePatrimonyBreakdown([]);
    expect(r.total).toBe(0);
    expect(r.byType).toEqual({ reserve: 0, productive: 0, parked: 0 });
    expect(r.maxAssetValue).toBe(0);
    expect(r.concentrationRatio).toBe(0);
    expect(r.parkedRatio).toBe(0);
  });

  it("sums by patrimony_type and tracks total + max", () => {
    const r = computePatrimonyBreakdown([
      as({ type: "liquid", patrimony_type: "reserve", current_value: 4500 }),
      as({
        type: "etf_stocks",
        patrimony_type: "productive",
        current_value: 18500,
      }),
      as({ type: "liquid", patrimony_type: "parked", current_value: 3000 }),
    ]);
    expect(r.byType.reserve).toBe(4500);
    expect(r.byType.productive).toBe(18500);
    expect(r.byType.parked).toBe(3000);
    expect(r.total).toBe(26000);
    expect(r.maxAssetValue).toBe(18500);
  });

  it("excludes archived assets from all calculations", () => {
    const r = computePatrimonyBreakdown([
      as({ type: "liquid", patrimony_type: "reserve", current_value: 1000 }),
      as({
        type: "liquid",
        patrimony_type: "reserve",
        current_value: 9999,
        archived_at: nowIso(),
      }),
    ]);
    expect(r.total).toBe(1000);
    expect(r.byType.reserve).toBe(1000);
  });

  it("computes concentration ratio (max asset / total)", () => {
    const r = computePatrimonyBreakdown([
      as({ type: "liquid", patrimony_type: "reserve", current_value: 1000 }),
      as({
        type: "etf_stocks",
        patrimony_type: "productive",
        current_value: 9000,
      }),
    ]);
    expect(r.concentrationRatio).toBe(0.9);
  });

  it("computes parked ratio", () => {
    const r = computePatrimonyBreakdown([
      as({ type: "liquid", patrimony_type: "reserve", current_value: 7000 }),
      as({ type: "liquid", patrimony_type: "parked", current_value: 3000 }),
    ]);
    expect(r.parkedRatio).toBe(0.3);
  });
});

describe("computeReserveStatus", () => {
  it("returns critical when essential monthly is zero", () => {
    expect(computeReserveStatus(5000, 0).level).toBe("critical");
  });

  it.each([
    [500, 1000, "critical"],
    [2000, 1000, "insufficient"],
    [4000, 1000, "healthy"],
    [9000, 1000, "comfortable"],
    [20000, 1000, "over"],
  ] as const)(
    "maps %d€ reserve / %d€ essential to %s",
    (reserve, essential, expected) => {
      expect(computeReserveStatus(reserve, essential).level).toBe(expected);
    },
  );

  it("returns months covered as ratio", () => {
    const r = computeReserveStatus(4500, 1500);
    expect(r.months).toBe(3);
  });
});

describe("sortAssets", () => {
  it("orders by current_value desc, then italian name", () => {
    const a = as({
      type: "liquid",
      patrimony_type: "reserve",
      current_value: 1000,
      name: "Banana",
    });
    const b = as({
      type: "liquid",
      patrimony_type: "reserve",
      current_value: 1000,
      name: "Anguria",
    });
    const c = as({
      type: "liquid",
      patrimony_type: "reserve",
      current_value: 5000,
      name: "Ciliegia",
    });
    expect(sortAssets([a, b, c]).map((x) => x.name)).toEqual([
      "Ciliegia",
      "Anguria",
      "Banana",
    ]);
  });

  it("does not mutate the input", () => {
    const list = [
      as({
        type: "liquid",
        patrimony_type: "reserve",
        current_value: 100,
      }),
    ];
    const copy = [...list];
    sortAssets(list);
    expect(list).toEqual(copy);
  });
});
