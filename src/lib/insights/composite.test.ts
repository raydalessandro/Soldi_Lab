import { describe, expect, it } from "vitest";
import {
  computeAccumulation,
  computeFloorHealth,
  computeInsights,
  listUpcomingAnnualish,
  yearsToAnnualFloor,
} from "./composite";
import { newId, nowIso } from "../id";
import type { Asset, FloorItem, IncomeItem } from "../types";

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
    note: partial.note,
    created_at: partial.created_at ?? nowIso(),
    updated_at: partial.updated_at ?? nowIso(),
    archived_at: partial.archived_at ?? null,
  };
}

function ii(
  partial: Partial<IncomeItem> & Pick<IncomeItem, "amount" | "frequency">,
): IncomeItem {
  return {
    id: partial.id ?? newId(),
    space_id: partial.space_id ?? "sp",
    name: partial.name ?? "i",
    amount: partial.amount,
    frequency: partial.frequency,
    active: partial.active ?? true,
    note: partial.note,
    created_at: partial.created_at ?? nowIso(),
    updated_at: partial.updated_at ?? nowIso(),
    archived_at: partial.archived_at ?? null,
  };
}

function as(
  partial: Partial<Asset> &
    Pick<Asset, "current_value" | "patrimony_type" | "type">,
): Asset {
  return {
    id: partial.id ?? newId(),
    space_id: partial.space_id ?? "sp",
    name: partial.name ?? "a",
    type: partial.type,
    patrimony_type: partial.patrimony_type,
    current_value: partial.current_value,
    created_at: partial.created_at ?? nowIso(),
    updated_at: partial.updated_at ?? nowIso(),
    archived_at: partial.archived_at ?? null,
  };
}

describe("computeAccumulation (SPEC §5.3)", () => {
  it("subtracts each floor segment incrementally", () => {
    const r = computeAccumulation(2800, {
      essential: 1500,
      baseline: 500,
      lifestyle: 200,
    });
    expect(r.real).toBe(600); // 2800 − 2200
    expect(r.compressed).toBe(800); // 2800 − 2000
    expect(r.extreme).toBe(1300); // 2800 − 1500
  });

  it("returns negative real when floor exceeds income", () => {
    const r = computeAccumulation(1000, {
      essential: 800,
      baseline: 300,
      lifestyle: 100,
    });
    expect(r.real).toBe(-200);
    expect(r.extreme).toBe(200);
  });
});

describe("computeFloorHealth (SPEC §5.4)", () => {
  it.each([
    [10000, 1000, "healthy"], // 0.10
    [10000, 5500, "tense"], // 0.55
    [10000, 7500, "fragile"], // 0.75
    [10000, 9000, "critical"], // 0.90
  ] as const)("income=%d floor=%d → %s", (income, floor, expected) => {
    expect(computeFloorHealth(income, floor).level).toBe(expected);
  });

  it("returns critical with ratio=1 when income is zero (deficit territory)", () => {
    const r = computeFloorHealth(0, 1000);
    expect(r.level).toBe("critical");
    expect(r.ratio).toBe(1);
  });

  it("returns ratio as a fraction (not percentage)", () => {
    expect(computeFloorHealth(2000, 1000).ratio).toBeCloseTo(0.5);
  });
});

describe("yearsToAnnualFloor (SPEC §5.6)", () => {
  it("returns null when not accumulating", () => {
    expect(yearsToAnnualFloor(0, 2000)).toBeNull();
    expect(yearsToAnnualFloor(-100, 2000)).toBeNull();
  });

  it("returns floor/real ratio as years to a full year of floor", () => {
    // accumulando 100/mese, floor 2000/mese → 1 anno di floor (24000)
    // si raggiunge in 240 mesi = 20 anni.
    expect(yearsToAnnualFloor(100, 2000)).toBe(20);
  });
});

describe("listUpcomingAnnualish (SPEC §5.7)", () => {
  it("includes annual and semiannual rows only, sorted by amount desc", () => {
    const items = [
      fi({
        amount: 720,
        frequency: "monthly",
        necessity_level: "essential",
        name: "Mutuo",
      }),
      fi({
        amount: 600,
        frequency: "annual",
        necessity_level: "baseline",
        name: "Polizza",
      }),
      fi({
        amount: 250,
        frequency: "semiannual",
        necessity_level: "essential",
        name: "Assicurazione bici",
      }),
      fi({
        amount: 300,
        frequency: "annual",
        necessity_level: "essential",
        name: "TARI",
      }),
    ];
    const list = listUpcomingAnnualish(items);
    expect(list.map((i) => i.name)).toEqual([
      "Polizza",
      "TARI",
      "Assicurazione bici",
    ]);
  });

  it("excludes inactive and archived rows", () => {
    const items = [
      fi({
        amount: 100,
        frequency: "annual",
        necessity_level: "essential",
        active: false,
      }),
      fi({
        amount: 100,
        frequency: "annual",
        necessity_level: "essential",
        archived_at: nowIso(),
      }),
    ];
    expect(listUpcomingAnnualish(items)).toEqual([]);
  });
});

describe("computeInsights end-to-end (SPEC §5)", () => {
  it("composes a realistic family scenario", () => {
    const floor = [
      fi({
        amount: 720,
        frequency: "monthly",
        necessity_level: "essential",
      }),
      fi({
        amount: 600,
        frequency: "annual", // 50/mese
        necessity_level: "baseline",
      }),
      fi({
        amount: 80,
        frequency: "monthly",
        necessity_level: "lifestyle",
      }),
    ];
    const income = [ii({ amount: 2400, frequency: "monthly" })];
    const assets = [
      as({ type: "liquid", patrimony_type: "reserve", current_value: 4500 }),
      as({
        type: "etf_stocks",
        patrimony_type: "productive",
        current_value: 8000,
      }),
      as({
        type: "bonds",
        patrimony_type: "productive",
        current_value: 7500,
      }),
    ];
    const r = computeInsights(floor, income, assets);

    expect(r.floor.byLevel.essential).toBe(720);
    expect(r.floor.byLevel.baseline).toBe(50);
    expect(r.floor.byLevel.lifestyle).toBe(80);
    expect(r.floor.total).toBe(850);
    expect(r.income.totalMonthly).toBe(2400);

    expect(r.accumulation.real).toBe(1550); // 2400 - 850
    expect(r.accumulation.compressed).toBe(1630);
    expect(r.accumulation.extreme).toBe(1680);

    expect(r.floorHealth.level).toBe("healthy"); // 850/2400 ≈ 0.35
    expect(r.patrimony.total).toBe(20000);

    // reserve / essential = 4500 / 720 ≈ 6.25 → comfortable
    expect(r.reserveStatus.level).toBe("comfortable");

    expect(r.parkedAlert).toBe(false);
    // max asset 8000 / 20000 = 0.4 → no alert
    expect(r.concentrationAlert).toBe(false);
    expect(r.baselineAnomaly).toBe(false);
    expect(r.deficitWarning).toBe(false);

    // strategicCushion = extreme / real = 1680 / 1550 ≈ 1.08
    expect(r.strategicCushion).toBeCloseTo(1.084, 2);
  });

  it("flags deficit when real margin is negative", () => {
    const floor = [
      fi({
        amount: 2500,
        frequency: "monthly",
        necessity_level: "essential",
      }),
    ];
    const income = [ii({ amount: 2000, frequency: "monthly" })];
    const r = computeInsights(floor, income, []);
    expect(r.deficitWarning).toBe(true);
    expect(r.strategicCushion).toBeNull();
    expect(r.yearsToAnnualFloor).toBeNull();
  });

  it("flags parked alert when parked share exceeds 30%", () => {
    const assets = [
      as({ type: "liquid", patrimony_type: "reserve", current_value: 4000 }),
      as({ type: "liquid", patrimony_type: "parked", current_value: 6000 }),
    ];
    const r = computeInsights([], [], assets);
    expect(r.parkedAlert).toBe(true);
  });

  it("flags concentration alert when a single asset exceeds 70%", () => {
    const assets = [
      as({
        type: "etf_stocks",
        patrimony_type: "productive",
        current_value: 80000,
      }),
      as({ type: "liquid", patrimony_type: "reserve", current_value: 20000 }),
    ];
    const r = computeInsights([], [], assets);
    expect(r.concentrationAlert).toBe(true);
  });

  it("flags baseline anomaly when baseline > essential", () => {
    const floor = [
      fi({
        amount: 200,
        frequency: "monthly",
        necessity_level: "essential",
      }),
      fi({
        amount: 800,
        frequency: "monthly",
        necessity_level: "baseline",
      }),
    ];
    const r = computeInsights(floor, [], []);
    expect(r.baselineAnomaly).toBe(true);
  });
});
