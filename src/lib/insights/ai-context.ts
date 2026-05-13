// Generazione del blocco markdown "Contesto finanziario — Soldi_Lab"
// che l'utente copia per incollarlo in Claude, ChatGPT o DeepSeek.
// Layout fissato da SPEC §6.
//
// Funzione pura: prende dati grezzi e insights già calcolati e restituisce
// la stringa markdown. Testabile senza React.

import {
  ASSET_TYPE_META,
  FREQUENCY_META,
  NECESSITY_META,
  NECESSITY_ORDER,
  PATRIMONY_META,
} from "../constants";
import { formatEUR, toMonthly } from "../format";
import type { Asset, FloorItem, IncomeItem, Space } from "../types";
import type { DashboardInsights } from "./composite";

interface AIContextInput {
  space: Space;
  floor: FloorItem[];
  income: IncomeItem[];
  assets: Asset[];
  insights: DashboardInsights;
  // ISO date (YYYY-MM-DD). Iniettabile per snapshot testing deterministico.
  today: string;
  appVersion: string;
}

export function generateAIContext(input: AIContextInput): string {
  const { space, floor, income, assets, insights, today, appVersion } = input;
  const lines: string[] = [];

  lines.push(`# Contesto finanziario — Soldi_Lab`);
  lines.push(`## Spazio: ${space.name}`);
  lines.push(`## Data: ${today}`);
  lines.push(`## App: ${appVersion}`);
  lines.push("");

  // === FLOOR ====================================================
  lines.push(`## Floor (spese permanenti)`);
  lines.push(
    `- Totale mensile normalizzato: ${formatEUR(insights.floor.total)}`,
  );
  for (const level of NECESSITY_ORDER) {
    lines.push(
      `  - ${NECESSITY_META[level].label}: ${formatEUR(insights.floor.byLevel[level])}`,
    );
  }
  lines.push("");

  const activeFloor = floor.filter((i) => i.active && i.archived_at === null);
  for (const level of NECESSITY_ORDER) {
    const items = activeFloor.filter((i) => i.necessity_level === level);
    if (items.length === 0) continue;
    lines.push(`### ${NECESSITY_META[level].label}`);
    for (const item of items) {
      const monthly = toMonthly(item.amount, item.frequency);
      const flags: string[] = [item.type];
      if (item.is_variable_life) flags.push("vita variabile");
      lines.push(
        `- ${item.name} — ${formatEUR(item.amount)} ${FREQUENCY_META[item.frequency].short} — ${flags.join(", ")} — mensile ≈ ${formatEUR(monthly)}`,
      );
    }
    lines.push("");
  }

  // === ENTRATE ==================================================
  lines.push(`## Entrate stabili`);
  lines.push(
    `- Totale mensile normalizzato: ${formatEUR(insights.income.totalMonthly)}`,
  );
  for (const item of income.filter((i) => i.active && i.archived_at === null)) {
    lines.push(
      `- ${item.name} — ${formatEUR(item.amount)} ${FREQUENCY_META[item.frequency].short}`,
    );
  }
  lines.push("");

  // === CAPACITÀ DI ACCUMULO =====================================
  const acc = insights.accumulation;
  lines.push(`## Capacità di accumulo`);
  lines.push(`- Reale (margine attuale): ${formatEUR(acc.real)}/mese`);
  lines.push(
    `- Compresso (senza lifestyle): ${formatEUR(acc.compressed)}/mese`,
  );
  lines.push(`- Estremo (solo essential): ${formatEUR(acc.extreme)}/mese`);
  if (insights.strategicCushion !== null) {
    lines.push(
      `- Cuscinetto strategico: ${insights.strategicCushion.toFixed(2)}x`,
    );
  }
  if (insights.deficitWarning) {
    lines.push(`- ANOMALIA: margine reale negativo → deficit strutturale`);
  }
  if (insights.yearsToAnnualFloor !== null) {
    lines.push(
      `- Anni per accumulare 1 anno di floor: ${insights.yearsToAnnualFloor.toFixed(1)}`,
    );
  }
  lines.push("");

  // === HEALTH CHECK =============================================
  lines.push(`## Health check`);
  lines.push(
    `- Floor health: ${insights.floorHealth.label} (floor/entrate ${(insights.floorHealth.ratio * 100).toFixed(0)}%)`,
  );
  lines.push(
    `- Reserve adequacy: ${reserveStatusLabel(insights.reserveStatus.level)} (${insights.reserveStatus.months.toFixed(1)} mesi di essential coperti)`,
  );
  if (insights.baselineAnomaly) {
    lines.push(`- Anomalia: baseline > essential`);
  }
  if (insights.concentrationAlert) {
    lines.push(
      `- Alert concentrazione: un singolo asset rappresenta ${(insights.patrimony.concentrationRatio * 100).toFixed(0)}% del patrimonio`,
    );
  }
  if (insights.parkedAlert) {
    lines.push(
      `- Alert parked: ${(insights.patrimony.parkedRatio * 100).toFixed(0)}% del patrimonio è fermo senza piano`,
    );
  }
  lines.push("");

  // === PATRIMONIO ===============================================
  lines.push(`## Patrimonio`);
  lines.push(`- Totale: ${formatEUR(insights.patrimony.total)}`);
  for (const fn of ["reserve", "productive", "parked"] as const) {
    const value = insights.patrimony.byType[fn];
    const pct =
      insights.patrimony.total > 0
        ? ((value / insights.patrimony.total) * 100).toFixed(0)
        : "0";
    lines.push(
      `  - ${PATRIMONY_META[fn].label}: ${formatEUR(value)} (${pct}%)`,
    );
  }
  lines.push("");

  const activeAssets = assets.filter((a) => a.archived_at === null);
  if (activeAssets.length > 0) {
    lines.push(`### Dettaglio asset`);
    for (const asset of activeAssets) {
      const parts = [
        `${asset.name}`,
        `${formatEUR(asset.current_value)}`,
        `${ASSET_TYPE_META[asset.type].label}`,
        `${PATRIMONY_META[asset.patrimony_type].label}`,
      ];
      if (asset.expected_return_pct !== undefined) {
        parts.push(`rend ${asset.expected_return_pct}%/anno`);
      }
      if (asset.monthly_contribution !== undefined) {
        parts.push(`PAC ${formatEUR(asset.monthly_contribution)}/mese`);
      }
      if (asset.maturity_date) {
        parts.push(`scad ${asset.maturity_date}`);
      }
      lines.push(`- ${parts.join(" — ")}`);
    }
    lines.push("");
  }

  // === REGOLE OPERATIVE (SPEC §6) ===============================
  lines.push(`## Regole operative`);
  lines.push(
    `Soldi_Lab gestisce solo spese necessarie strutturali e stato patrimoniale.`,
  );
  lines.push(
    `Le spese discrezionali (caffè, cene fuori, regali, viaggi extra) sono fuori scope e si gestiscono sul margine "reale".`,
  );
  lines.push(
    `Le tre categorie di Floor sono: essential (sopravvivenza), baseline (standard scelto), lifestyle (riducibile).`,
  );
  lines.push(
    `Le tre funzioni di Patrimonio sono: reserve (emergenza), productive (rende), parked (fermo senza piano).`,
  );
  lines.push("");

  lines.push(`## Domanda`);
  lines.push(`[Scrivi qui la tua domanda all'AI]`);

  return lines.join("\n");
}

function reserveStatusLabel(level: string): string {
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
