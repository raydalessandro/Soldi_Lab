"use client";

import { cn } from "@/lib/cn";
import { formatEUR } from "@/lib/format";
import type { AccumulationCapacity } from "@/lib/insights/composite";

interface Props {
  accumulation: AccumulationCapacity;
  strategicCushion: number | null;
}

// Triangolo dell'accumulo (SPEC §5.3 + §9.2 sezione 2).
// Tre righe: reale / compresso / estremo. In fondo il rapporto di
// cuscinetto strategico se il margine reale è positivo.
export function AccumulationCard({ accumulation, strategicCushion }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="mb-3 text-xs font-semibold tracking-wider text-stone-500 uppercase">
        Triangolo accumulo
      </div>
      <div className="space-y-2.5">
        <Row
          label="Reale"
          hint="margine vero"
          value={accumulation.real}
          highlight
        />
        <Row
          label="Compresso"
          hint="senza lifestyle"
          value={accumulation.compressed}
        />
        <Row
          label="Estremo"
          hint="solo essenziale"
          value={accumulation.extreme}
        />
      </div>
      {strategicCushion !== null && (
        <div className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-500">
          Cuscinetto strategico:{" "}
          <span className="font-semibold text-stone-700">
            {strategicCushion.toFixed(1)}x
          </span>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  hint,
  value,
  highlight,
}: {
  label: string;
  hint: string;
  value: number;
  highlight?: boolean;
}) {
  const positive = value >= 0;
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        highlight && "font-semibold",
      )}
    >
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-[11px] text-stone-500">{hint}</span>
      </div>
      <span
        className={cn(
          "text-base tabular-nums",
          positive ? "text-emerald-700" : "text-rose-700",
        )}
      >
        {formatEUR(value)}
        <span className="text-xs font-normal text-stone-400">/mese</span>
      </span>
    </div>
  );
}
