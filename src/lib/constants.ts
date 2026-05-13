// Costanti condivise e meta-data delle tassonomie SPEC §2.
// La regola SPEC §13 vieta array hardcoded di tipologie/livelli nelle viste:
// tutto deve passare da qui. Le label sono in italiano.

import type {
  AssetType,
  Frequency,
  NecessityLevel,
  PatrimonyType,
} from "./types";

export const PARENT_APP_URL = "https://la-famiglia-alpha.vercel.app";
export const APP_NAME = "Soldi_Lab";
export const APP_ECOSYSTEM_LABEL = "Polo B";

export interface NecessityMeta {
  label: string;
  short: string;
  hint: string;
  color: string;
  bg: string;
  bgDark: string;
  text: string;
  border: string;
}

export const NECESSITY_META: Record<NecessityLevel, NecessityMeta> = {
  essential: {
    label: "Essenziale",
    short: "ESS",
    hint: "Se la togli, la vita salta",
    color: "rose",
    bg: "bg-rose-50",
    bgDark: "bg-rose-500",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  baseline: {
    label: "Standard",
    short: "STD",
    hint: "Stile di vita stabile scelto",
    color: "indigo",
    bg: "bg-indigo-50",
    bgDark: "bg-indigo-500",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  lifestyle: {
    label: "Lifestyle",
    short: "LIFE",
    hint: "Comportamenti ricorrenti riducibili",
    color: "amber",
    bg: "bg-amber-50",
    bgDark: "bg-amber-500",
    text: "text-amber-700",
    border: "border-amber-200",
  },
};

export const NECESSITY_ORDER: readonly NecessityLevel[] = [
  "essential",
  "baseline",
  "lifestyle",
] as const;

export interface PatrimonyMeta {
  label: string;
  hint: string;
  color: string;
  bg: string;
  bgDark: string;
  text: string;
  border: string;
}

export const PATRIMONY_META: Record<PatrimonyType, PatrimonyMeta> = {
  reserve: {
    label: "Reserve",
    hint: "Liquidità per emergenze",
    color: "sky",
    bg: "bg-sky-50",
    bgDark: "bg-sky-500",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  productive: {
    label: "Productive",
    hint: "Capitale che lavora",
    color: "emerald",
    bg: "bg-emerald-50",
    bgDark: "bg-emerald-500",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  parked: {
    label: "Parked",
    hint: "Patrimonio fermo senza piano",
    color: "stone",
    bg: "bg-stone-100",
    bgDark: "bg-stone-500",
    text: "text-stone-700",
    border: "border-stone-300",
  },
};

export const PATRIMONY_ORDER: readonly PatrimonyType[] = [
  "reserve",
  "productive",
  "parked",
] as const;

export interface FrequencyMeta {
  label: string;
  short: string;
  divisor: number;
}

export const FREQUENCY_META: Record<Frequency, FrequencyMeta> = {
  monthly: { label: "Mensile", short: "/mese", divisor: 1 },
  bimonthly: { label: "Bimestrale", short: "/2mesi", divisor: 2 },
  quarterly: { label: "Trimestrale", short: "/3mesi", divisor: 3 },
  semiannual: { label: "Semestrale", short: "/6mesi", divisor: 6 },
  annual: { label: "Annuale", short: "/anno", divisor: 12 },
};

export const FREQUENCY_ORDER: readonly Frequency[] = [
  "monthly",
  "bimonthly",
  "quarterly",
  "semiannual",
  "annual",
] as const;

export const ASSET_TYPE_META: Record<AssetType, { label: string }> = {
  liquid: { label: "Liquido" },
  deposit: { label: "Deposito" },
  bonds: { label: "Obbligazioni" },
  etf_stocks: { label: "ETF/Azioni" },
  pension: { label: "Pensione" },
  real_estate: { label: "Immobile" },
  other: { label: "Altro" },
};

export const ASSET_TYPE_ORDER: readonly AssetType[] = [
  "liquid",
  "deposit",
  "bonds",
  "etf_stocks",
  "pension",
  "real_estate",
  "other",
] as const;
