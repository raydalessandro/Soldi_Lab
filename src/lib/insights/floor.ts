// Calcoli puri sul Floor. Stesso modulo viene riusato dalla pagina /floor
// per l'header e dalla dashboard (F7) per i numeri grandi e gli insight.
//
// Tutti i calcoli sono runtime: niente store di valori derivati, niente
// memoizzazione persistente (SPEC §13).

import { toMonthly } from "../format";
import { NECESSITY_ORDER } from "../constants";
import type { FloorItem, NecessityLevel } from "../types";

export type FloorByLevel = Record<NecessityLevel, number>;

export interface FloorBreakdown {
  byLevel: FloorByLevel;
  total: number;
  monthlyByItemId: Record<string, number>;
}

// Riceve la lista grezza (può includere inattivi e archiviati) e calcola
// il floor mensile normalizzato considerando solo le voci attive non archiviate.
export function computeFloorBreakdown(items: FloorItem[]): FloorBreakdown {
  const byLevel: FloorByLevel = {
    essential: 0,
    baseline: 0,
    lifestyle: 0,
  };
  const monthlyByItemId: Record<string, number> = {};

  for (const item of items) {
    const monthly = toMonthly(item.amount, item.frequency);
    monthlyByItemId[item.id] = monthly;

    if (!item.active || item.archived_at !== null) continue;
    byLevel[item.necessity_level] += monthly;
  }

  const total = byLevel.essential + byLevel.baseline + byLevel.lifestyle;
  return { byLevel, total, monthlyByItemId };
}

// Ordinamento standard per la lista visibile:
// 1. "Vita variabile mensile" sempre in cima (è il proxy del giorno-per-giorno)
// 2. Poi per importo mensile normalizzato decrescente, così le voci che pesano
//    di più stanno sopra
// 3. A parità, nome alfabetico stabile.
export function sortFloorItems(
  items: FloorItem[],
  monthlyByItemId?: Record<string, number>,
): FloorItem[] {
  const monthly = (it: FloorItem) =>
    monthlyByItemId?.[it.id] ?? toMonthly(it.amount, it.frequency);
  return [...items].sort((a, b) => {
    if (a.is_variable_life !== b.is_variable_life) {
      return a.is_variable_life ? -1 : 1;
    }
    const diff = monthly(b) - monthly(a);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, "it");
  });
}

// Helper riusato in vari posti per iterare i livelli nell'ordine canonico.
export const NECESSITY_LEVELS_ORDERED = NECESSITY_ORDER;
