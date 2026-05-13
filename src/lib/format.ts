// Formatter EUR italiani + utility frequenza/monthly.
// Centralizzati qui per uniformità in tutta l'app.

import { FREQUENCY_META } from "./constants";
import type { Frequency } from "./types";

const eurFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const eurPreciseFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

export const formatEUR = (n: number): string => eurFormatter.format(n);
export const formatEURPrecise = (n: number): string =>
  eurPreciseFormatter.format(n);

export const toMonthly = (amount: number, frequency: Frequency): number =>
  amount / FREQUENCY_META[frequency].divisor;
