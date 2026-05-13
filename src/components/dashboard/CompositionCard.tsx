"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatEUR } from "@/lib/format";

// Card riusabile per la breakdown Floor / Patrimonio.
// La barra è una flex con i 3 segmenti colorati; sotto la legenda con il
// valore in EUR per ogni segmento.
//
// Income usa una variante diversa (un solo numero), vedi IncomeSummaryCard.

export interface CompositionSegment {
  label: string;
  value: number;
  className: string; // es. "bg-rose-500"
}

interface CompositionCardProps {
  href: string;
  title: string;
  segments: [CompositionSegment, CompositionSegment, CompositionSegment];
}

export function CompositionCard({
  href,
  title,
  segments,
}: CompositionCardProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-stone-200 bg-white p-4 active:bg-stone-50"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
          {title}
        </div>
        <ChevronRight className="h-4 w-4 text-stone-300" />
      </div>
      <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-stone-100">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${s.className} h-full`}
            style={{ width: `${pct(s.value)}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {segments.map((s) => (
          <div key={s.label}>
            <div className="mb-0.5 flex items-center justify-center gap-1">
              <div className={`h-2 w-2 rounded-full ${s.className}`} />
              <span className="text-[10px] font-medium tracking-wider text-stone-500 uppercase">
                {s.label}
              </span>
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {formatEUR(s.value)}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}
