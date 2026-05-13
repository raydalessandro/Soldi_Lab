"use client";

import { AlertCircle, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { SpaceContextBar } from "@/components/SpaceContextBar";
import { AccumulationCard } from "@/components/dashboard/AccumulationCard";
import { BigNumber } from "@/components/dashboard/BigNumber";
import {
  CompositionCard,
  type CompositionSegment,
} from "@/components/dashboard/CompositionCard";
import { HealthBadge } from "@/components/dashboard/HealthBadge";
import { IncomeSummaryCard } from "@/components/dashboard/IncomeSummaryCard";
import { formatEUR } from "@/lib/format";
import { useDashboardInsights } from "@/lib/hooks/useDashboardInsights";

// Dashboard completa — SPEC §9.2.
// Sezione 1: tre numeri grandi (Floor, Margine reale, Patrimonio).
// Sezione 2: composizione Floor.
// Sezione 3: entrate mensili.
// Sezione 4: triangolo accumulo.
// Sezione 5: composizione patrimonio.
// Sezione 6: health checks (floor + reserve) + warning condizionali.
// Sezione 7: CTA Advisor.
export default function DashboardPage() {
  const insights = useDashboardInsights();

  return (
    <>
      <SpaceContextBar />

      {!insights ? (
        <div className="px-4 pt-6 text-sm text-stone-400">Caricamento…</div>
      ) : (
        <DashboardBody insights={insights} />
      )}
    </>
  );
}

function DashboardBody({
  insights,
}: {
  insights: NonNullable<ReturnType<typeof useDashboardInsights>>;
}) {
  const {
    floor,
    income,
    patrimony,
    accumulation,
    floorHealth,
    reserveStatus,
    parkedAlert,
    concentrationAlert,
    baselineAnomaly,
    deficitWarning,
    strategicCushion,
  } = insights;

  const realPositive = accumulation.real >= 0;

  const floorSegments: [
    CompositionSegment,
    CompositionSegment,
    CompositionSegment,
  ] = [
    {
      label: "Essenziale",
      value: floor.byLevel.essential,
      className: "bg-rose-500",
    },
    {
      label: "Standard",
      value: floor.byLevel.baseline,
      className: "bg-indigo-500",
    },
    {
      label: "Lifestyle",
      value: floor.byLevel.lifestyle,
      className: "bg-amber-500",
    },
  ];

  const patrimonySegments: [
    CompositionSegment,
    CompositionSegment,
    CompositionSegment,
  ] = [
    {
      label: "Reserve",
      value: patrimony.byType.reserve,
      className: "bg-sky-500",
    },
    {
      label: "Productive",
      value: patrimony.byType.productive,
      className: "bg-emerald-500",
    },
    {
      label: "Parked",
      value: patrimony.byType.parked,
      className: "bg-stone-400",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. tre numeri grandi */}
      <div className="space-y-4 px-4 py-2">
        <BigNumber
          label="Floor mensile"
          value={formatEUR(floor.total)}
          hint="quanto ti costa stare al mondo"
        />
        <BigNumber
          label="Margine reale"
          value={formatEUR(accumulation.real)}
          hint={
            realPositive ? "puoi accumulare ogni mese" : "deficit strutturale"
          }
          tone={realPositive ? "positive" : "negative"}
        />
        <BigNumber
          label="Patrimonio totale"
          value={formatEUR(patrimony.total)}
          hint="tutti gli asset registrati"
        />
      </div>

      {/* 2. composizione floor */}
      <div className="px-4">
        <CompositionCard
          href="/floor"
          title="Composizione Floor"
          segments={floorSegments}
        />
      </div>

      {/* 3. entrate */}
      <div className="px-4">
        <IncomeSummaryCard
          totalMonthly={income.totalMonthly}
          activeCount={income.activeCount}
        />
      </div>

      {/* 4. triangolo accumulo */}
      <div className="px-4">
        <AccumulationCard
          accumulation={accumulation}
          strategicCushion={strategicCushion}
        />
      </div>

      {/* 5. composizione patrimonio */}
      <div className="px-4">
        <CompositionCard
          href="/patrimony"
          title="Composizione Patrimonio"
          segments={patrimonySegments}
        />
      </div>

      {/* 6. health checks */}
      <div className="grid grid-cols-2 gap-2 px-4">
        <HealthBadge
          label="Floor health"
          status={floorHealth.label}
          color={floorHealth.color as "emerald" | "amber" | "orange" | "rose"}
          detail={`${(floorHealth.ratio * 100).toFixed(0)}% delle entrate`}
        />
        <HealthBadge
          label="Reserve"
          status={statusLabel(reserveStatus.level)}
          color={statusColor(reserveStatus.level)}
          detail={`${reserveStatus.months.toFixed(1)} mesi`}
        />
      </div>

      {/* warning condizionali */}
      {deficitWarning && (
        <div className="px-4">
          <WarningBanner
            title="Deficit strutturale"
            body="Stai vivendo in deficit: il tuo Floor supera le entrate stabili. Riduci lifestyle o baseline prima di tutto."
          />
        </div>
      )}
      {baselineAnomaly && !deficitWarning && (
        <div className="px-4">
          <WarningBanner
            tone="info"
            title="Standard sopra Essenziale"
            body="Il tuo stile di vita stabile costa più della pura sopravvivenza. In emergenza, il margine maggiore lo trovi rivedendo lo Standard."
          />
        </div>
      )}
      {concentrationAlert && (
        <div className="px-4">
          <WarningBanner
            tone="warn"
            title="Concentrazione patrimoniale"
            body="Un singolo asset rappresenta oltre il 70% del patrimonio. Diversificare riduce la fragilità."
          />
        </div>
      )}
      {parkedAlert && (
        <div className="px-4">
          <WarningBanner
            tone="warn"
            title="Patrimonio parked elevato"
            body="Più del 30% del patrimonio è fermo senza piano chiaro. Valuta di riallocarlo verso reserve o productive."
          />
        </div>
      )}

      {/* 7. CTA advisor */}
      <div className="px-4 pb-4">
        <Link
          href="/advisor"
          className="flex items-center justify-between rounded-2xl bg-stone-900 p-4 text-white active:bg-stone-800"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5" />
            <div>
              <div className="text-sm font-semibold">
                Chiedi all&apos;Advisor
              </div>
              <div className="text-xs text-stone-300">
                Insight automatici + esporta contesto AI
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

function WarningBanner({
  title,
  body,
  tone = "danger",
}: {
  title: string;
  body: string;
  tone?: "danger" | "warn" | "info";
}) {
  const className =
    tone === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-900"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-sky-200 bg-sky-50 text-sky-900";
  return (
    <div className={`flex gap-3 rounded-2xl border p-3 ${className}`}>
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed opacity-90">{body}</div>
      </div>
    </div>
  );
}

function statusLabel(level: string): string {
  switch (level) {
    case "critical":
      return "Critica";
    case "insufficient":
      return "Insufficiente";
    case "healthy":
      return "Sana";
    case "comfortable":
      return "Comoda";
    case "over":
      return "In eccesso";
    default:
      return level;
  }
}

function statusColor(
  level: string,
): "emerald" | "sky" | "amber" | "orange" | "rose" {
  switch (level) {
    case "critical":
      return "rose";
    case "insufficient":
      return "orange";
    case "healthy":
      return "emerald";
    case "comfortable":
      return "sky";
    case "over":
      return "amber";
    default:
      return "rose";
  }
}
