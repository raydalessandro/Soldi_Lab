"use client";

import { cn } from "@/lib/cn";

interface HealthBadgeProps {
  label: string;
  status: string;
  color: "emerald" | "sky" | "amber" | "orange" | "rose" | "stone";
  detail: string;
}

const COLOR_MAP: Record<HealthBadgeProps["color"], string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  stone: "bg-stone-50 text-stone-700 border-stone-200",
};

export function HealthBadge({
  label,
  status,
  color,
  detail,
}: HealthBadgeProps) {
  return (
    <div className={cn("rounded-xl border p-3", COLOR_MAP[color])}>
      <div className="text-[10px] font-medium tracking-wider uppercase opacity-70">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold">{status}</div>
      <div className="mt-0.5 text-[11px] opacity-80">{detail}</div>
    </div>
  );
}
