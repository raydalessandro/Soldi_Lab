// Trasforma DashboardInsights in una lista di card da renderizzare in
// /advisor. Vive in un file separato per essere testabile senza React.

import { formatEUR } from "@/lib/format";
import type { DashboardInsights } from "@/lib/insights/composite";

export interface InsightCardData {
  title: string;
  value: string;
  detail: string;
  explain: string;
  color: "emerald" | "sky" | "amber" | "orange" | "rose" | "stone";
}

export function buildInsightCards(
  insights: DashboardInsights,
): InsightCardData[] {
  const cards: InsightCardData[] = [];

  // Floor health
  cards.push({
    title: "Health check del Floor",
    value: insights.floorHealth.label,
    color: insights.floorHealth.color as InsightCardData["color"],
    detail: `Il tuo floor rappresenta il ${(insights.floorHealth.ratio * 100).toFixed(0)}% delle entrate stabili.`,
    explain:
      insights.floorHealth.level === "healthy"
        ? "Hai ampio margine di manovra. Ottima base per accumulare."
        : insights.floorHealth.level === "tense"
          ? "Margine decente, ma poca elasticità. Ogni nuova spesa fissa va valutata bene."
          : insights.floorHealth.level === "fragile"
            ? "Il floor è alto rispetto alle entrate. Una spesa imprevista può creare problemi."
            : "Floor critico. Margine reale quasi nullo, valuta riduzione baseline/lifestyle.",
  });

  // Reserve adequacy
  const rs = insights.reserveStatus;
  cards.push({
    title: "Adeguatezza Reserve",
    value: reserveLabel(rs.level),
    color: reserveColor(rs.level),
    detail: `La tua reserve copre ${rs.months.toFixed(1)} mesi di spese essenziali.`,
    explain:
      rs.level === "critical"
        ? "Reserve sotto un mese: priorità assoluta rafforzarla prima di tutto il resto."
        : rs.level === "insufficient"
          ? "Reserve sotto i 3 mesi consigliati. Continua ad accumulare in liquidità prima di investire."
          : rs.level === "healthy"
            ? "Reserve nella zona sana (3-6 mesi). Puoi destinare il margine a productive."
            : rs.level === "comfortable"
              ? "Reserve comoda. Spostare una parte verso productive può rendere di più."
              : "Reserve molto sopra il necessario. Probabile sub-ottimalità: parte può migrare a productive.",
  });

  // Deficit warning (SPEC §5.9) — alert forte
  if (insights.deficitWarning) {
    cards.push({
      title: "Deficit strutturale",
      value: formatEUR(insights.accumulation.real),
      color: "rose",
      detail:
        "Stai vivendo in deficit: il tuo Floor supera le entrate stabili.",
      explain:
        "Senza margine positivo non si accumula nulla. Riduci lifestyle o baseline prima di considerare investimenti.",
    });
  }

  // Parked alert
  if (insights.parkedAlert) {
    cards.push({
      title: "Patrimonio parked elevato",
      value: `${(insights.patrimony.parkedRatio * 100).toFixed(0)}%`,
      color: "amber",
      detail: `${formatEUR(insights.patrimony.byType.parked)} sono fermi senza piano chiaro.`,
      explain:
        "Soldi parked non proteggono (non sono accessibili come reserve) e non producono. Valuta di riallocarli verso reserve o productive.",
    });
  }

  // Concentration alert
  if (insights.concentrationAlert) {
    cards.push({
      title: "Concentrazione patrimoniale",
      value: `${(insights.patrimony.concentrationRatio * 100).toFixed(0)}%`,
      color: "orange",
      detail: "Un singolo asset rappresenta oltre il 70% del patrimonio.",
      explain:
        "Concentrazione elevata = rischio elevato. Diversificare riduce la fragilità rispetto a eventi singoli.",
    });
  }

  // Strategic cushion
  if (insights.strategicCushion !== null && insights.accumulation.real > 0) {
    const cushion = insights.strategicCushion;
    cards.push({
      title: "Cuscinetto strategico",
      value: `${cushion.toFixed(1)}x`,
      color: cushion > 3 ? "emerald" : cushion > 2 ? "sky" : "amber",
      detail: `In emergenza puoi tirare fuori ${cushion.toFixed(1)} volte il tuo margine attuale.`,
      explain:
        "Comprimendo lifestyle e baseline il tuo margine cresce. Sapere quanto si può comprimere è una forma di sicurezza.",
    });
  }

  // Baseline anomaly (SPEC §5.8)
  if (insights.baselineAnomaly) {
    cards.push({
      title: "Standard sopra Essenziale",
      value: "Osservazione",
      color: "sky",
      detail: `Standard (${formatEUR(insights.floor.byLevel.baseline)}) > Essenziale (${formatEUR(insights.floor.byLevel.essential)}).`,
      explain:
        "Lo stile di vita stabile costa più della pura sopravvivenza. In emergenza il margine maggiore lo trovi rivedendo lo Standard.",
    });
  }

  // Distance to annual floor
  if (insights.yearsToAnnualFloor !== null) {
    cards.push({
      title: "Distanza dal floor annuale",
      value: `${insights.yearsToAnnualFloor.toFixed(1)} anni`,
      color: "stone",
      detail: `Al ritmo attuale accumuli l'equivalente di 1 anno di vita in ${insights.yearsToAnnualFloor.toFixed(1)} anni.`,
      explain:
        "È una misura di indipendenza finanziaria: ogni anno di vita accumulato è un anno in cui potresti fare scelte diverse.",
    });
  }

  return cards;
}

function reserveLabel(level: string): string {
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

function reserveColor(level: string): InsightCardData["color"] {
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
      return "stone";
  }
}
