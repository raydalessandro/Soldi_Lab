"use client";

import { cn } from "@/lib/cn";

interface BigNumberProps {
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "positive" | "negative";
}

export function BigNumber({
  label,
  value,
  hint,
  tone = "neutral",
}: BigNumberProps) {
  return (
    <div>
      <div className="mb-0.5 text-[10px] font-medium tracking-widest text-stone-400 uppercase">
        {label}
      </div>
      <div
        className={cn(
          "text-3xl font-bold tracking-tight tabular-nums",
          tone === "positive" && "text-emerald-700",
          tone === "negative" && "text-rose-700",
          tone === "neutral" && "text-stone-900",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-stone-500">{hint}</div>
    </div>
  );
}
