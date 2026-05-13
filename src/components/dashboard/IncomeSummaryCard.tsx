"use client";

import { Banknote, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatEUR } from "@/lib/format";

interface Props {
  totalMonthly: number;
  activeCount: number;
}

export function IncomeSummaryCard({ totalMonthly, activeCount }: Props) {
  return (
    <Link
      href="/income"
      className="block rounded-2xl border border-stone-200 bg-white p-4 active:bg-stone-50"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
          Entrate mensili
        </div>
        <ChevronRight className="h-4 w-4 text-stone-300" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
            {formatEUR(totalMonthly)}
          </div>
          <div className="mt-0.5 text-xs text-stone-500">
            flussi stabili normalizzati al mese
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
          <Banknote className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold">
            {activeCount} {activeCount === 1 ? "attiva" : "attive"}
          </span>
        </div>
      </div>
    </Link>
  );
}
