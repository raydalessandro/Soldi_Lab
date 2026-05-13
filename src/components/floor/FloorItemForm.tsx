"use client";

import { useState } from "react";
import { Archive, RotateCcw } from "lucide-react";
import {
  FREQUENCY_META,
  FREQUENCY_ORDER,
  NECESSITY_META,
  NECESSITY_ORDER,
} from "@/lib/constants";
import {
  archiveFloorItem,
  createFloorItem,
  unarchiveFloorItem,
  updateFloorItem,
} from "@/lib/repo/floor";
import { cn } from "@/lib/cn";
import type { Frequency, FloorItem, NecessityLevel } from "@/lib/types";

interface FloorItemFormProps {
  // Quando item è presente siamo in modalità edit.
  item: FloorItem | null;
  spaceId: string;
  onClose: () => void;
}

// Bottom-sheet usata sia per add nuova voce (item === null) che per edit
// completo di una voce esistente. La SPEC §10.5 chiede edit inline dove
// possibile e questa modal solo per i campi strutturali.
export function FloorItemForm({ item, spaceId, onClose }: FloorItemFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [amount, setAmount] = useState(item?.amount.toString() ?? "");
  const [frequency, setFrequency] = useState<Frequency>(
    item?.frequency ?? "monthly",
  );
  const [type, setType] = useState<"fixed" | "variable">(item?.type ?? "fixed");
  const [necessity, setNecessity] = useState<NecessityLevel>(
    item?.necessity_level ?? "essential",
  );
  const [active, setActive] = useState(item?.active ?? true);
  const [variableLife, setVariableLife] = useState(
    item?.is_variable_life ?? false,
  );
  const [note, setNote] = useState(item?.note ?? "");
  const [submitting, setSubmitting] = useState(false);

  // Quando l'utente marca "vita variabile" forziamo essential + variable
  // (vincolo SPEC §2.1).
  const onToggleVariableLife = () => {
    const next = !variableLife;
    setVariableLife(next);
    if (next) {
      setNecessity("essential");
      setType("variable");
    }
  };

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
        await updateFloorItem(item.id, {
          name: name.trim(),
          amount: n,
          frequency,
          type,
          necessity_level: necessity,
          active,
          is_variable_life: variableLife,
          note: note.trim() || undefined,
        });
      } else {
        await createFloorItem({
          space_id: spaceId,
          name: name.trim(),
          amount: n,
          frequency,
          type,
          necessity_level: necessity,
          active,
          is_variable_life: variableLife,
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
    if (item.archived_at) await unarchiveFloorItem(item.id);
    else await archiveFloorItem(item.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item ? "Modifica voce" : "Nuova voce"}
    >
      <div
        className="mx-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="mb-4 text-lg font-semibold">
          {item ? "Modifica voce" : "Nuova voce"}
        </h2>

        <div className="space-y-4">
          <Field label="Nome" htmlFor="floor-name">
            <input
              id="floor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Bolletta luce"
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm outline-none"
              autoFocus={!item}
            />
          </Field>

          <Field label="Importo (€)" htmlFor="floor-amount">
            <input
              id="floor-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm tabular-nums outline-none"
            />
          </Field>

          <Field label="Livello">
            <div className="grid grid-cols-3 gap-2">
              {NECESSITY_ORDER.map((l) => {
                const meta = NECESSITY_META[l];
                const selected = necessity === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setNecessity(l)}
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
              {NECESSITY_META[necessity].hint}
            </div>
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

          <Field label="Tipo">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("fixed")}
                className={cn(
                  "rounded-xl p-2 text-xs font-medium",
                  type === "fixed"
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-700",
                )}
                aria-pressed={type === "fixed"}
              >
                Fissa
              </button>
              <button
                type="button"
                onClick={() => setType("variable")}
                className={cn(
                  "rounded-xl p-2 text-xs font-medium",
                  type === "variable"
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-700",
                )}
                aria-pressed={type === "variable"}
              >
                Variabile (media)
              </button>
            </div>
          </Field>

          <Field label="Nota (opzionale)" htmlFor="floor-note">
            <input
              id="floor-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Aggiungi un dettaglio"
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
                {active ? "Voce attiva" : "Voce dormiente"}
              </div>
              <div className="text-[11px] text-stone-500">
                Le voci dormienti non concorrono al floor
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

          <button
            type="button"
            onClick={onToggleVariableLife}
            className="flex w-full items-center justify-between rounded-xl border border-stone-200 p-3"
          >
            <div className="text-left">
              <div className="text-sm font-medium">Vita variabile mensile</div>
              <div className="text-[11px] text-stone-500">
                Stima del giorno-per-giorno (alimentari, benzina, piccole spese)
              </div>
            </div>
            <div
              className={cn(
                "h-6 w-10 rounded-full p-0.5 transition-colors",
                variableLife ? "bg-stone-900" : "bg-stone-300",
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full bg-white transition-transform",
                  variableLife && "translate-x-4",
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
                  Archivia voce
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
