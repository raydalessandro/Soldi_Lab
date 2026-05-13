"use client";

import { formatEUR } from "@/lib/format";
import type { IncomeBreakdown } from "@/lib/insights/income";

export function IncomeHeader({ breakdown }: { breakdown: IncomeBreakdown }) {
  return (
    <div className="px-4 py-4">
      <div className="mb-1 text-[10px] font-medium tracking-widest text-stone-400 uppercase">
        Entrate totali mensili
      </div>
      <div className="text-3xl font-bold tracking-tight text-emerald-700 tabular-nums">
        {formatEUR(breakdown.totalMonthly)}
      </div>
      <div className="mt-0.5 text-xs text-stone-500">
        flussi stabili normalizzati al mese
      </div>
    </div>
  );
}
