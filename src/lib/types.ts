// Tipi delle entità della v1 — corrispondono a SPEC §4.2.
// Sono il riferimento canonico TS per tutto il resto dell'app
// (Dexie store, validatori Zod, store Zustand, componenti UI).

export type Frequency =
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "semiannual"
  | "annual";

export type NecessityLevel = "essential" | "baseline" | "lifestyle";

export type AssetType =
  | "liquid"
  | "deposit"
  | "bonds"
  | "etf_stocks"
  | "pension"
  | "real_estate"
  | "other";

export type PatrimonyType = "reserve" | "productive" | "parked";

export type ISODateTime = string; // ISO 8601 UTC
export type ISODate = string; // YYYY-MM-DD

export interface Space {
  id: string;
  name: string;
  icon?: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  archived_at: ISODateTime | null;
}

export interface FloorItem {
  id: string;
  space_id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  type: "fixed" | "variable";
  necessity_level: NecessityLevel;
  active: boolean;
  note?: string;
  is_variable_life: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  archived_at: ISODateTime | null;
}

export interface IncomeItem {
  id: string;
  space_id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  active: boolean;
  note?: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  archived_at: ISODateTime | null;
}

export interface Asset {
  id: string;
  space_id: string;
  name: string;
  type: AssetType;
  patrimony_type: PatrimonyType;
  current_value: number;
  expected_return_pct?: number;
  monthly_contribution?: number;
  maturity_date?: ISODate;
  note?: string;
  // Quotazione automatica (opzionale, popolato in v2)
  quote_symbol?: string;
  quote_source?: "yahoo" | "coingecko" | "ecb" | "manual";
  quantity?: number;
  last_quote?: number;
  last_quote_at?: ISODateTime;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  archived_at: ISODateTime | null;
}

export interface SpaceSettings {
  space_id: string;
  deepseek_api_key?: string;
  ai_advisor_enabled: boolean;
}

export interface AppSettings {
  id: "singleton";
  active_space_id: string;
  theme: "light" | "dark" | "auto";
  onboarding_completed: boolean;
}
