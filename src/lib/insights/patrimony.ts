// Calcoli puri sul Patrimonio. Forniscono i numeri usati da:
//  - /patrimony per header e filtri
//  - /advisor (F7) per gli insight di concentrazione, reserve adequacy,
//    parked alert
//  - export contesto AI (F8)
//
// Tutto runtime, niente cache.

import type { Asset, PatrimonyType } from "../types";

export type PatrimonyByType = Record<PatrimonyType, number>;

export interface PatrimonyBreakdown {
  byType: PatrimonyByType;
  total: number;
  // Asset di valore massimo e relativa % sul totale: usato per il warning
  // di concentrazione (SPEC §5.5).
  maxAssetValue: number;
  concentrationRatio: number;
  // Rapporto parked/total — alert se > 0.30 (SPEC §5.5).
  parkedRatio: number;
}

export function computePatrimonyBreakdown(assets: Asset[]): PatrimonyBreakdown {
  const byType: PatrimonyByType = {
    reserve: 0,
    productive: 0,
    parked: 0,
  };
  let total = 0;
  let maxAssetValue = 0;
  for (const asset of assets) {
    if (asset.archived_at !== null) continue;
    byType[asset.patrimony_type] += asset.current_value;
    total += asset.current_value;
    if (asset.current_value > maxAssetValue)
      maxAssetValue = asset.current_value;
  }
  const concentrationRatio = total > 0 ? maxAssetValue / total : 0;
  const parkedRatio = total > 0 ? byType.parked / total : 0;
  return { byType, total, maxAssetValue, concentrationRatio, parkedRatio };
}

// SPEC §5.5 reserve adequacy: rapporto reserve / floor essential mensile.
export type ReserveStatusLevel =
  | "critical" // < 1 mese
  | "insufficient" // 1-3 mesi
  | "healthy" // 3-6 mesi
  | "comfortable" // 6-12 mesi
  | "over"; // > 12 mesi

export interface ReserveStatus {
  level: ReserveStatusLevel;
  months: number;
}

export function computeReserveStatus(
  reserveTotal: number,
  essentialMonthly: number,
): ReserveStatus {
  if (essentialMonthly <= 0) {
    return { level: "critical", months: 0 };
  }
  const months = reserveTotal / essentialMonthly;
  let level: ReserveStatusLevel;
  if (months < 1) level = "critical";
  else if (months < 3) level = "insufficient";
  else if (months < 6) level = "healthy";
  else if (months < 12) level = "comfortable";
  else level = "over";
  return { level, months };
}

export function sortAssets(assets: Asset[]): Asset[] {
  return [...assets].sort((a, b) => {
    const diff = b.current_value - a.current_value;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, "it");
  });
}
