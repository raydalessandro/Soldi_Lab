"use client";

import { formatEUR } from "@/lib/format";
import type { FloorBreakdown } from "@/lib/insights/floor";

interface FloorHeaderProps {
  breakdown: FloorBreakdown;
}

export function FloorHeader({ breakdown }: FloorHeaderProps) {
  const { byLevel, total } = breakdown;
  const pctOf = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  return (
    <div className="px-4 py-4">
      <div className="mb-1 text-[10px] font-medium tracking-widest text-stone-400 uppercase">
        Floor totale mensile
      </div>
      <div className="mb-3 text-3xl font-bold tracking-tight tabular-nums">
        {formatEUR(total)}
      </div>
      <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full bg-rose-500"
          style={{ width: `${pctOf(byLevel.essential)}%` }}
        />
        <div
          className="h-full bg-indigo-500"
          style={{ width: `${pctOf(byLevel.baseline)}%` }}
        />
        <div
          className="h-full bg-amber-500"
          style={{ width: `${pctOf(byLevel.lifestyle)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" />
          Ess {formatEUR(byLevel.essential)}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />
          Std {formatEUR(byLevel.baseline)}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
          Life {formatEUR(byLevel.lifestyle)}
        </span>
      </div>
    </div>
  );
}
