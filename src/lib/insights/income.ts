// Calcoli puri sulle Entrate. Mirror semplificato di insights/floor.ts:
// nessuna tassonomia, solo somma normalizzata al mese delle voci attive
// non archiviate.

import { toMonthly } from "../format";
import type { IncomeItem } from "../types";

export interface IncomeBreakdown {
  totalMonthly: number;
  monthlyByItemId: Record<string, number>;
}

export function computeIncomeBreakdown(items: IncomeItem[]): IncomeBreakdown {
  const monthlyByItemId: Record<string, number> = {};
  let totalMonthly = 0;
  for (const item of items) {
    const monthly = toMonthly(item.amount, item.frequency);
    monthlyByItemId[item.id] = monthly;
    if (!item.active || item.archived_at !== null) continue;
    totalMonthly += monthly;
  }
  return { totalMonthly, monthlyByItemId };
}

// Ordinamento: prima per importo mensile decrescente, poi nome it.
export function sortIncomeItems(
  items: IncomeItem[],
  monthlyByItemId?: Record<string, number>,
): IncomeItem[] {
  const monthly = (it: IncomeItem) =>
    monthlyByItemId?.[it.id] ?? toMonthly(it.amount, it.frequency);
  return [...items].sort((a, b) => {
    const diff = monthly(b) - monthly(a);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, "it");
  });
}
