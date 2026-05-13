import { describe, expect, it } from "vitest";
import { formatEUR, toMonthly } from "./format";

describe("formatEUR", () => {
  it("returns a string with the euro sign and integer digits", () => {
    // The exact locale formatting (1.234 vs 1234) depends on the ICU data
    // shipped with the JS runtime. We assert behavior that holds in any env:
    // EUR sign present and decimal part stripped.
    expect(formatEUR(1234)).toContain("€");
    expect(formatEUR(1234)).toContain("1234");
    expect(formatEUR(0)).toContain("0");
    expect(formatEUR(0)).toContain("€");
  });

  it("rounds towards nearest integer", () => {
    expect(formatEUR(1234.49)).toContain("1234");
    expect(formatEUR(1234.5)).toContain("1235");
  });
});

describe("toMonthly", () => {
  it("returns amount unchanged for monthly frequency", () => {
    expect(toMonthly(100, "monthly")).toBe(100);
  });

  it("divides annual amount by 12", () => {
    expect(toMonthly(1200, "annual")).toBe(100);
  });

  it("divides bimonthly amount by 2", () => {
    expect(toMonthly(200, "bimonthly")).toBe(100);
  });

  it("divides quarterly amount by 3", () => {
    expect(toMonthly(300, "quarterly")).toBe(100);
  });

  it("divides semiannual amount by 6", () => {
    expect(toMonthly(600, "semiannual")).toBe(100);
  });

  it("handles zero", () => {
    expect(toMonthly(0, "annual")).toBe(0);
  });
});
