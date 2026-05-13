"use client";

import { formatEUR } from "@/lib/format";
import type { PatrimonyBreakdown } from "@/lib/insights/patrimony";

export function PatrimonyHeader({
  breakdown,
}: {
  breakdown: PatrimonyBreakdown;
}) {
  const { byType, total } = breakdown;
  const pctOf = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  return (
    <div className="px-4 py-4">
      <div className="mb-1 text-[10px] font-medium tracking-widest text-stone-400 uppercase">
        Patrimonio totale
      </div>
      <div className="mb-3 text-3xl font-bold tracking-tight tabular-nums">
        {formatEUR(total)}
      </div>
      <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full bg-sky-500"
          style={{ width: `${pctOf(byType.reserve)}%` }}
        />
        <div
          className="h-full bg-emerald-500"
          style={{ width: `${pctOf(byType.productive)}%` }}
        />
        <div
          className="h-full bg-stone-400"
          style={{ width: `${pctOf(byType.parked)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-500" />
          Res {formatEUR(byType.reserve)}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Pro {formatEUR(byType.productive)}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-stone-400" />
          Park {formatEUR(byType.parked)}
        </span>
      </div>
    </div>
  );
}
