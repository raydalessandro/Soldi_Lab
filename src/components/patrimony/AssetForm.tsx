"use client";

import { Archive, RotateCcw } from "lucide-react";
import { useState } from "react";
import {
  ASSET_TYPE_META,
  ASSET_TYPE_ORDER,
  PATRIMONY_META,
  PATRIMONY_ORDER,
} from "@/lib/constants";
import {
  archiveAsset,
  createAsset,
  unarchiveAsset,
  updateAsset,
} from "@/lib/repo/assets";
import { cn } from "@/lib/cn";
import type { Asset, AssetType, PatrimonyType } from "@/lib/types";

interface Props {
  asset: Asset | null;
  spaceId: string;
  onClose: () => void;
}

export function AssetForm({ asset, spaceId, onClose }: Props) {
  const [name, setName] = useState(asset?.name ?? "");
  const [type, setType] = useState<AssetType>(asset?.type ?? "liquid");
  const [patrimonyType, setPatrimonyType] = useState<PatrimonyType>(
    asset?.patrimony_type ?? "reserve",
  );
  const [currentValue, setCurrentValue] = useState(
    asset?.current_value.toString() ?? "",
  );
  const [expectedReturn, setExpectedReturn] = useState(
    asset?.expected_return_pct?.toString() ?? "",
  );
  const [monthlyContribution, setMonthlyContribution] = useState(
    asset?.monthly_contribution?.toString() ?? "",
  );
  const [maturityDate, setMaturityDate] = useState(asset?.maturity_date ?? "");
  const [note, setNote] = useState(asset?.note ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave =
    name.trim().length > 0 &&
    currentValue.trim().length > 0 &&
    !isNaN(parseFloat(currentValue.replace(",", ".")));

  const parseOptionalFloat = (s: string): number | undefined => {
    if (!s.trim()) return undefined;
    const n = parseFloat(s.replace(",", "."));
    return isNaN(n) ? undefined : n;
  };

  const onSave = async () => {
    if (!canSave || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const value = parseFloat(currentValue.replace(",", "."));
      const payload = {
        name: name.trim(),
        type,
        patrimony_type: patrimonyType,
        current_value: value,
        expected_return_pct: parseOptionalFloat(expectedReturn),
        monthly_contribution: parseOptionalFloat(monthlyContribution),
        maturity_date: maturityDate.trim() || undefined,
        note: note.trim() || undefined,
      };
      if (asset) {
        await updateAsset(asset.id, payload);
      } else {
        await createAsset({ space_id: spaceId, ...payload });
      }
      onClose();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onArchiveToggle = async () => {
    if (!asset) return;
    setError(null);
    try {
      if (asset.archived_at) await unarchiveAsset(asset.id);
      else await archiveAsset(asset.id);
      onClose();
    } catch (err) {
      setError(formatError(err));
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={asset ? "Modifica asset" : "Nuovo asset"}
    >
      <div
        className="mx-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="mb-4 text-lg font-semibold">
          {asset ? "Modifica asset" : "Nuovo asset"}
        </h2>

        <div className="space-y-4">
          <Field label="Nome" htmlFor="asset-name">
            <input
              id="asset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. PAC ETF MSCI World"
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm outline-none"
              autoFocus={!asset}
            />
          </Field>

          <Field label="Valore corrente (€)" htmlFor="asset-value">
            <input
              id="asset-value"
              type="number"
              inputMode="decimal"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm tabular-nums outline-none"
            />
          </Field>

          <Field label="Funzione strategica">
            <div className="grid grid-cols-3 gap-2">
              {PATRIMONY_ORDER.map((p) => {
                const meta = PATRIMONY_META[p];
                const selected = patrimonyType === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPatrimonyType(p)}
                    className={cn(
                      "rounded-xl border p-2 text-xs font-medium",
                      selected
                        ? `${meta.bg} ${meta.text} ${meta.border}`
                        : "border-stone-200 bg-stone-50 text-stone-600",
                    )}
                    aria-pressed={selected}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-1.5 text-[10px] text-stone-500">
              {PATRIMONY_META[patrimonyType].hint}
            </div>
          </Field>

          <Field label="Tipo di asset">
            <div className="grid grid-cols-3 gap-2">
              {ASSET_TYPE_ORDER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-xl p-2 text-xs font-medium",
                    type === t
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-700",
                  )}
                  aria-pressed={type === t}
                >
                  {ASSET_TYPE_META[t].label}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Rendimento atteso % annuo (opzionale)"
            htmlFor="asset-return"
          >
            <input
              id="asset-return"
              type="number"
              inputMode="decimal"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              placeholder="Es. 7"
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm tabular-nums outline-none"
            />
          </Field>

          <Field
            label="Contributo mensile (PAC, €) — opzionale"
            htmlFor="asset-monthly"
          >
            <input
              id="asset-monthly"
              type="number"
              inputMode="decimal"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm tabular-nums outline-none"
            />
          </Field>

          <Field label="Scadenza (opzionale)" htmlFor="asset-maturity">
            <input
              id="asset-maturity"
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturityDate(e.target.value)}
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm outline-none"
            />
          </Field>

          <Field label="Nota (opzionale)" htmlFor="asset-note">
            <input
              id="asset-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm outline-none"
            />
          </Field>

          {asset && (
            <button
              type="button"
              onClick={onArchiveToggle}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-xs font-medium text-stone-700"
            >
              {asset.archived_at ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Ripristina dall&apos;archivio
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  Archivia asset
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-700"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave || submitting}
            className={cn(
              "flex-1 rounded-xl py-3 text-sm font-semibold",
              canSave && !submitting
                ? "bg-stone-900 text-white"
                : "bg-stone-200 text-stone-400",
            )}
          >
            {asset ? "Salva" : "Aggiungi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatError(err: unknown): string {
  if (err instanceof Error) return err.message || "Errore sconosciuto";
  return String(err);
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  if (htmlFor) {
    return (
      <div>
        <label
          htmlFor={htmlFor}
          className="mb-1 block text-[11px] font-medium tracking-wider text-stone-500 uppercase"
        >
          {label}
        </label>
        {children}
      </div>
    );
  }
  return (
    <div>
      <div className="mb-2 text-[11px] font-medium tracking-wider text-stone-500 uppercase">
        {label}
      </div>
      {children}
    </div>
  );
}
