"use client";

import { Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { PageHeader } from "@/components/PageHeader";
import { InsightCard } from "@/components/advisor/InsightCard";
import { buildInsightCards } from "@/components/advisor/buildInsightCards";
import { useActiveSpace, useActiveSpaceId } from "@/lib/hooks/useActiveSpace";
import { useAssets } from "@/lib/hooks/useAssets";
import { useDashboardInsights } from "@/lib/hooks/useDashboardInsights";
import { useFloorItems } from "@/lib/hooks/useFloorItems";
import { useIncomeItems } from "@/lib/hooks/useIncomeItems";
import { generateAIContext } from "@/lib/insights/ai-context";

const APP_VERSION = "0.1.0";

export default function AdvisorPage() {
  const insights = useDashboardInsights();
  const space = useActiveSpace();
  const spaceId = useActiveSpaceId();
  const floor = useFloorItems({
    space_id: spaceId,
    includeArchived: true,
  });
  const income = useIncomeItems({
    space_id: spaceId,
    includeArchived: true,
  });
  const assets = useAssets({ space_id: spaceId, includeArchived: true });

  const [copied, setCopied] = useState(false);

  const ready =
    insights !== undefined &&
    space !== undefined &&
    floor !== undefined &&
    income !== undefined &&
    assets !== undefined;

  const cards = insights ? buildInsightCards(insights) : [];

  const onExport = async () => {
    if (!ready) return;
    const md = generateAIContext({
      space,
      floor,
      income,
      assets,
      insights,
      today: new Date().toISOString().slice(0, 10),
      appVersion: APP_VERSION,
    });
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback: log in console; il browser ha bloccato clipboard write
      // (es. iframe non-secure). UX di errore arriva in F10.
      console.error("clipboard write failed", err);
    }
  };

  return (
    <>
      <PageHeader title="Advisor" />

      <OnboardingBanner
        storageKey="advisor-intro"
        title="Insight + export"
        body="Qui leggi osservazioni sui tuoi dati attuali. Il pulsante in fondo genera un blocco markdown da incollare in qualunque LLM."
        tone="emerald"
      />

      <div className="px-4 py-4">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-stone-500" />
          <div className="text-[10px] font-medium tracking-widest text-stone-400 uppercase">
            Insight automatici
          </div>
        </div>
        <div className="text-sm text-stone-600">
          {ready
            ? `${cards.length} ${cards.length === 1 ? "osservazione" : "osservazioni"} dai tuoi dati attuali`
            : "Caricamento…"}
        </div>
      </div>

      <div className="space-y-2 px-4">
        {cards.map((card, i) => (
          <InsightCard key={i} {...card} />
        ))}
      </div>

      <div className="px-4 pt-6">
        <div className="rounded-2xl bg-stone-900 p-4 text-white">
          <div className="mb-2 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            <div className="text-sm font-semibold">Esporta contesto AI</div>
          </div>
          <div className="mb-3 text-xs leading-relaxed text-stone-300">
            Genera un report completo da incollare in Claude, ChatGPT o DeepSeek
            per consigli basati sui tuoi dati reali. Niente lascia il tuo
            dispositivo finché non incolli da qualche parte.
          </div>
          <button
            type="button"
            onClick={onExport}
            disabled={!ready}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-stone-900 disabled:bg-stone-300"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiato negli appunti
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copia contesto
              </>
            )}
          </button>
        </div>

        <div className="mt-3 flex gap-2 rounded-xl bg-stone-100 p-3">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-500" />
          <div className="text-xs text-stone-600">
            <span className="font-semibold">Prossimamente:</span> chat AI
            integrata con DeepSeek (API key locale). Per ora l&apos;export è il
            modo più diretto per portare il tuo contesto in qualunque LLM.
          </div>
        </div>
      </div>
    </>
  );
}
