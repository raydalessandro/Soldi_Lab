// Aggregatore degli insight della dashboard. Compone i breakdown
// puri dei tre moduli (floor, income, patrimony) e applica i derivati
// SPEC §5.3 → §5.9: triangolo accumulo, floor health, reserve adequacy,
// concentration alert, parked alert, baseline anomaly, deficit warning,
// distanza dal floor annuale.
//
// Tutto runtime, niente cache: ogni cambio dati ricalcola.

import { computeFloorBreakdown, type FloorBreakdown } from "./floor";
import { computeIncomeBreakdown, type IncomeBreakdown } from "./income";
import {
  computePatrimonyBreakdown,
  computeReserveStatus,
  type PatrimonyBreakdown,
  type ReserveStatus,
} from "./patrimony";
import { toMonthly } from "../format";
import type { Asset, FloorItem, IncomeItem } from "../types";

// === Capacità di accumulo (SPEC §5.3) ===========================

export interface AccumulationCapacity {
  real: number; // entrate − (ess + bas + life)
  compressed: number; // entrate − (ess + bas) — quanto se elimini lifestyle
  extreme: number; // entrate − ess        — quanto se elimini anche baseline
}

export function computeAccumulation(
  incomeMonthly: number,
  floor: FloorBreakdown["byLevel"],
): AccumulationCapacity {
  return {
    real: incomeMonthly - (floor.essential + floor.baseline + floor.lifestyle),
    compressed: incomeMonthly - (floor.essential + floor.baseline),
    extreme: incomeMonthly - floor.essential,
  };
}

// === Salute del floor (SPEC §5.4) ================================

export type FloorHealthLevel = "healthy" | "tense" | "fragile" | "critical";

export interface FloorHealth {
  level: FloorHealthLevel;
  label: string;
  color: string;
  ratio: number; // floor / income, 0 se income mancante
}

export function computeFloorHealth(
  incomeMonthly: number,
  floorTotal: number,
): FloorHealth {
  // Income a zero: floor è infinitamente sopra. Lo trattiamo come critico
  // perché qualunque spesa è già un deficit. SPEC §5.9 ne darà il warning.
  const ratio = incomeMonthly > 0 ? floorTotal / incomeMonthly : 1;
  if (ratio < 0.5)
    return { level: "healthy", label: "Sano", color: "emerald", ratio };
  if (ratio < 0.7)
    return { level: "tense", label: "Teso", color: "amber", ratio };
  if (ratio < 0.85)
    return { level: "fragile", label: "Fragile", color: "orange", ratio };
  return { level: "critical", label: "Critico", color: "rose", ratio };
}

// === Distanza dal floor annuale (SPEC §5.6) ======================
//
// Quanti anni servono ad accumulare l'equivalente di un anno di Floor
// al ritmo attuale di accumulazione "reale".
// Se non sta accumulando → null (zero senso parlarne).
export function yearsToAnnualFloor(
  realMonthly: number,
  floorTotalMonthly: number,
): number | null {
  if (realMonthly <= 0) return null;
  // annualFloor = floorTotalMonthly * 12; realAnnuo = realMonthly * 12.
  // Semplificazione: il rapporto coincide con floor / real.
  return floorTotalMonthly / realMonthly;
}

// === Insight composito completo ==================================

export interface DashboardInsights {
  floor: FloorBreakdown;
  income: IncomeBreakdown;
  patrimony: PatrimonyBreakdown;
  accumulation: AccumulationCapacity;
  floorHealth: FloorHealth;
  reserveStatus: ReserveStatus;
  yearsToAnnualFloor: number | null;
  // Flag binari per i warning della dashboard.
  parkedAlert: boolean; // SPEC §5.5 — parked > 30% del patrimonio
  concentrationAlert: boolean; // SPEC §5.5 — un singolo asset > 70%
  baselineAnomaly: boolean; // SPEC §5.8 — baseline > essential
  deficitWarning: boolean; // SPEC §5.9 — real < 0
  // Cuscinetto strategico = extreme / real (SPEC §5.3 chiusura).
  // null quando il margine reale è ≤ 0: il rapporto non ha senso.
  strategicCushion: number | null;
}

const PARKED_ALERT_THRESHOLD = 0.3;
const CONCENTRATION_ALERT_THRESHOLD = 0.7;

export function computeInsights(
  floorItems: FloorItem[],
  incomeItems: IncomeItem[],
  assets: Asset[],
): DashboardInsights {
  const floor = computeFloorBreakdown(floorItems);
  const income = computeIncomeBreakdown(incomeItems);
  const patrimony = computePatrimonyBreakdown(assets);

  const accumulation = computeAccumulation(income.totalMonthly, floor.byLevel);
  const floorHealth = computeFloorHealth(income.totalMonthly, floor.total);
  const reserveStatus = computeReserveStatus(
    patrimony.byType.reserve,
    floor.byLevel.essential,
  );

  const strategicCushion =
    accumulation.real > 0 ? accumulation.extreme / accumulation.real : null;

  return {
    floor,
    income,
    patrimony,
    accumulation,
    floorHealth,
    reserveStatus,
    yearsToAnnualFloor: yearsToAnnualFloor(accumulation.real, floor.total),
    parkedAlert: patrimony.parkedRatio > PARKED_ALERT_THRESHOLD,
    concentrationAlert:
      patrimony.concentrationRatio > CONCENTRATION_ALERT_THRESHOLD,
    baselineAnomaly: floor.byLevel.baseline > floor.byLevel.essential,
    deficitWarning: accumulation.real < 0,
    strategicCushion,
  };
}

// === Lista voci annuali / semestrali (SPEC §5.7) =================
//
// Voci con frequenza annual o semiannual che pesano nei prossimi mesi.
// La dashboard la rende come "calendario semestrale" per dare visibilità
// ai mesi pesanti. In v1 mostriamo solo la lista normalizzata.
export interface UpcomingAnnualItem {
  id: string;
  name: string;
  amount: number;
  frequency: "annual" | "semiannual";
  monthly: number;
}

export function listUpcomingAnnualish(
  floorItems: FloorItem[],
): UpcomingAnnualItem[] {
  return floorItems
    .filter((i) => i.active && i.archived_at === null)
    .filter((i) => i.frequency === "annual" || i.frequency === "semiannual")
    .map((i) => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
      frequency: i.frequency as "annual" | "semiannual",
      monthly: toMonthly(i.amount, i.frequency),
    }))
    .sort((a, b) => b.amount - a.amount);
}
