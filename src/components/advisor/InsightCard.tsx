"use client";

import { cn } from "@/lib/cn";

interface InsightCardProps {
  title: string;
  value: string;
  detail: string;
  explain: string;
  color: "emerald" | "sky" | "amber" | "orange" | "rose" | "stone";
}

const COLOR_MAP: Record<
  InsightCardProps["color"],
  { bg: string; border: string; text: string; value: string }
> = {
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    value: "text-emerald-900",
  },
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    value: "text-sky-900",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    value: "text-amber-900",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    value: "text-orange-900",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    value: "text-rose-900",
  },
  stone: {
    bg: "bg-stone-50",
    border: "border-stone-200",
    text: "text-stone-600",
    value: "text-stone-900",
  },
};

export function InsightCard({
  title,
  value,
  detail,
  explain,
  color,
}: InsightCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={cn("rounded-2xl border p-4", c.bg, c.border)}>
      <div className="mb-1 flex items-center justify-between">
        <div
          className={cn(
            "text-[10px] font-semibold tracking-widest uppercase",
            c.text,
          )}
        >
          {title}
        </div>
        <div className={cn("text-base font-bold", c.value)}>{value}</div>
      </div>
      <div className={cn("mb-1.5 text-sm", c.value)}>{detail}</div>
      <div className={cn("text-xs leading-relaxed opacity-90", c.text)}>
        {explain}
      </div>
    </div>
  );
}
