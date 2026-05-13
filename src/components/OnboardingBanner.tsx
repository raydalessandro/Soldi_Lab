"use client";

import { Info, X } from "lucide-react";
import { useDismissibleBanner } from "@/lib/hooks/useDismissibleBanner";
import { cn } from "@/lib/cn";

interface OnboardingBannerProps {
  // Chiave di persistenza in localStorage; cambiarla forza il banner a
  // riapparire per chi l'aveva chiuso (es. revisione testo importante).
  storageKey: string;
  title: string;
  body: string;
  tone?: "stone" | "sky" | "emerald";
}

const TONE_MAP: Record<NonNullable<OnboardingBannerProps["tone"]>, string> = {
  stone: "border-stone-200 bg-stone-50 text-stone-700",
  sky: "border-sky-200 bg-sky-50 text-sky-900",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export function OnboardingBanner({
  storageKey,
  title,
  body,
  tone = "stone",
}: OnboardingBannerProps) {
  const { visible, dismiss } = useDismissibleBanner(storageKey);
  if (!visible) return null;

  return (
    <div
      className={cn(
        "mx-4 mt-3 flex gap-3 rounded-2xl border p-3",
        TONE_MAP[tone],
      )}
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0 opacity-70" />
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed opacity-90">{body}</div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="-mt-1 -mr-1 p-1 opacity-70 active:opacity-100"
        aria-label="Chiudi banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
