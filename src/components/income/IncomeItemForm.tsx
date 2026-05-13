"use client";

import { Archive, RotateCcw } from "lucide-react";
import { useState } from "react";
import { FREQUENCY_META, FREQUENCY_ORDER } from "@/lib/constants";
import {
  archiveIncomeItem,
  createIncomeItem,
  unarchiveIncomeItem,
  updateIncomeItem,
} from "@/lib/repo/income";
import { cn } from "@/lib/cn";
import type { Frequency, IncomeItem } from "@/lib/types";

interface Props {
  item: IncomeItem | null;
  spaceId: string;
  onClose: () => void;
}

export function IncomeItemForm({ item, spaceId, onClose }: Props) {
  const [name, setName] = useState(item?.name ?? "");
  const [amount, setAmount] = useState(item?.amount.toString() ?? "");
  const [frequency, setFrequency] = useState<Frequency>(
    item?.frequency ?? "monthly",
  );
  const [active, setActive] = useState(item?.active ?? true);
  const [note, setNote] = useState(item?.note ?? "");
  const [submitting, setSubmitting] = useState(false);

  const canSave =
    name.trim().length > 0 &&
    amount.trim().length > 0 &&
    !isNaN(parseFloat(amount.replace(",", ".")));

  const onSave = async () => {
    if (!canSave || submitting) return;
    const n = parseFloat(amount.replace(",", "."));
    setSubmitting(true);
    try {
      if (item) {
        await updateIncomeItem(item.id, {
          name: name.trim(),
          amount: n,
          frequency,
          active,
          note: note.trim() || undefined,
        });
      } else {
        await createIncomeItem({
          space_id: spaceId,
          name: name.trim(),
          amount: n,
          frequency,
          active,
          note: note.trim() || undefined,
        });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const onArchiveToggle = async () => {
    if (!item) return;
    if (item.archived_at) await unarchiveIncomeItem(item.id);
    else await archiveIncomeItem(item.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item ? "Modifica entrata" : "Nuova entrata"}
    >
      <div
        className="mx-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="mb-4 text-lg font-semibold">
          {item ? "Modifica entrata" : "Nuova entrata"}
        </h2>

        <div className="space-y-4">
          <Field label="Nome" htmlFor="income-name">
            <input
              id="income-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Stipendio, pensione, affitto attivo…"
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm outline-none"
              autoFocus={!item}
            />
          </Field>

          <Field label="Importo (€)" htmlFor="income-amount">
            <input
              id="income-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm tabular-nums outline-none"
              placeholder="0"
            />
          </Field>

          <Field label="Frequenza">
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCY_ORDER.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={cn(
                    "rounded-xl p-2 text-xs font-medium",
                    frequency === freq
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-700",
                  )}
                  aria-pressed={frequency === freq}
                >
                  {FREQUENCY_META[freq].label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Nota (opzionale)" htmlFor="income-note">
            <input
              id="income-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm outline-none"
            />
          </Field>

          <button
            type="button"
            onClick={() => setActive(!active)}
            className="flex w-full items-center justify-between rounded-xl border border-stone-200 p-3"
          >
            <div className="text-left">
              <div className="text-sm font-medium">
                {active ? "Entrata attiva" : "Entrata dormiente"}
              </div>
              <div className="text-[11px] text-stone-500">
                Le entrate dormienti non concorrono al totale
              </div>
            </div>
            <div
              className={cn(
                "h-6 w-10 rounded-full p-0.5 transition-colors",
                active ? "bg-emerald-500" : "bg-stone-300",
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full bg-white transition-transform",
                  active && "translate-x-4",
                )}
              />
            </div>
          </button>

          {item && (
            <button
              type="button"
              onClick={onArchiveToggle}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-xs font-medium text-stone-700"
            >
              {item.archived_at ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Ripristina dall&apos;archivio
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  Archivia entrata
                </>
              )}
            </button>
          )}
        </div>

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
            {item ? "Salva" : "Aggiungi"}
          </button>
        </div>
      </div>
    </div>
  );
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
