// Schemi Zod che validano i bordi del sistema: input form, import backup,
// payload AI export. Riflettono SPEC §4.2 con vincoli di dominio
// (importi non negativi, frequenze valide, lunghezze ragionevoli).
//
// L'interno dell'app si fida dei tipi TS — Zod parla solo dove i dati
// arrivano da fuori (utente, file JSON, ipoteticamente API esterne in v2).

import { z } from "zod";

export const frequencySchema = z.enum([
  "monthly",
  "bimonthly",
  "quarterly",
  "semiannual",
  "annual",
]);

export const necessityLevelSchema = z.enum([
  "essential",
  "baseline",
  "lifestyle",
]);

export const assetTypeSchema = z.enum([
  "liquid",
  "deposit",
  "bonds",
  "etf_stocks",
  "pension",
  "real_estate",
  "other",
]);

export const patrimonyTypeSchema = z.enum(["reserve", "productive", "parked"]);

export const quoteSourceSchema = z.enum([
  "yahoo",
  "coingecko",
  "ecb",
  "manual",
]);

const idSchema = z.string().uuid();
const isoDateTimeSchema = z.string().datetime({ offset: true });
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const positiveAmount = z.number().finite().nonnegative();
const optionalNonEmptyString = z.string().min(1).max(500).optional();

export const spaceSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(80),
  icon: z.string().max(8).optional(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
  archived_at: isoDateTimeSchema.nullable(),
});

export const floorItemSchema = z.object({
  id: idSchema,
  space_id: idSchema,
  name: z.string().min(1).max(120),
  amount: positiveAmount,
  frequency: frequencySchema,
  type: z.enum(["fixed", "variable"]),
  necessity_level: necessityLevelSchema,
  active: z.boolean(),
  note: optionalNonEmptyString,
  is_variable_life: z.boolean(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
  archived_at: isoDateTimeSchema.nullable(),
});

export const incomeItemSchema = z.object({
  id: idSchema,
  space_id: idSchema,
  name: z.string().min(1).max(120),
  amount: positiveAmount,
  frequency: frequencySchema,
  active: z.boolean(),
  note: optionalNonEmptyString,
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
  archived_at: isoDateTimeSchema.nullable(),
});

export const assetSchema = z.object({
  id: idSchema,
  space_id: idSchema,
  name: z.string().min(1).max(120),
  type: assetTypeSchema,
  patrimony_type: patrimonyTypeSchema,
  current_value: positiveAmount,
  expected_return_pct: z.number().finite().optional(),
  monthly_contribution: positiveAmount.optional(),
  maturity_date: isoDateSchema.optional(),
  note: optionalNonEmptyString,
  quote_symbol: z.string().max(32).optional(),
  quote_source: quoteSourceSchema.optional(),
  quantity: z.number().finite().nonnegative().optional(),
  last_quote: z.number().finite().nonnegative().optional(),
  last_quote_at: isoDateTimeSchema.optional(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
  archived_at: isoDateTimeSchema.nullable(),
});

export const spaceSettingsSchema = z.object({
  space_id: idSchema,
  deepseek_api_key: z.string().max(200).optional(),
  ai_advisor_enabled: z.boolean(),
});

export const appSettingsSchema = z.object({
  id: z.literal("singleton"),
  active_space_id: idSchema,
  theme: z.enum(["light", "dark", "auto"]),
  onboarding_completed: z.boolean(),
});

// Schema per il backup file completo (SPEC §8.2).
export const backupFileSchema = z.object({
  schema_version: z.number().int().positive(),
  exported_at: isoDateTimeSchema,
  exported_by_device: z.string().max(80).optional(),
  app_version: z.string().max(20),
  spaces: z.array(spaceSchema),
  floor_items: z.array(floorItemSchema),
  income_items: z.array(incomeItemSchema),
  assets: z.array(assetSchema),
  space_settings: z.array(spaceSettingsSchema),
});

export type BackupFile = z.infer<typeof backupFileSchema>;
