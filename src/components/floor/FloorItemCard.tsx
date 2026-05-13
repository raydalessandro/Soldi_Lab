"use client";

import { Edit3 } from "lucide-react";
import { useState } from "react";
import { FREQUENCY_META, NECESSITY_META } from "@/lib/constants";
import { formatEUR, toMonthly } from "@/lib/format";
import { updateFloorItem } from "@/lib/repo/floor";
import { cn } from "@/lib/cn";
import type { FloorItem } from "@/lib/types";

interface FloorItemCardProps {
  item: FloorItem;
  onEdit: () => void;
}

// Card singola con edit inline sull'importo.
// L'edit completo (frequenza, livello, ecc.) passa dal modal FloorItemForm
// triggerato dal bottone "Modifica".
export function FloorItemCard({ item, onEdit }: FloorItemCardProps) {
  const meta = NECESSITY_META[item.necessity_level];
  const monthly = toMonthly(item.amount, item.frequency);
  const isAnnualish = item.frequency !== "monthly";
  const [editingAmount, setEditingAmount] = useState(false);
  const [tempAmount, setTempAmount] = useState(item.amount.toString());

  const commit = async () => {
    const n = parseFloat(tempAmount.replace(",", "."));
    if (!isNaN(n) && n >= 0 && n !== item.amount) {
      await updateFloorItem(item.id, { amount: n });
    }
    setEditingAmount(false);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-3",
        item.active ? "border-stone-200" : "border-stone-200 opacity-60",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase",
                meta.bg,
                meta.text,
              )}
            >
              {meta.short}
            </span>
            {!item.active && (
              <span className="text-[9px] font-medium tracking-wider text-stone-400 uppercase">
                Dormiente
              </span>
            )}
            {item.is_variable_life && (
              <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-medium tracking-wider text-stone-600 uppercase">
                Vita variabile
              </span>
            )}
          </div>
          <div className="text-sm font-semibold">{item.name}</div>
          {item.note && (
            <div className="mt-0.5 text-[11px] text-stone-500">{item.note}</div>
          )}
        </div>

        <div className="flex-shrink-0 text-right">
          {editingAmount ? (
            <input
              type="number"
              inputMode="decimal"
              value={tempAmount}
              onChange={(e) => setTempAmount(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditingAmount(false);
              }}
              className="w-24 rounded-lg border border-stone-300 px-2 py-1 text-right text-sm font-semibold outline-none focus:border-stone-900"
              autoFocus
              aria-label={`Importo ${item.name}`}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempAmount(item.amount.toString());
                setEditingAmount(true);
              }}
              className="text-right active:opacity-50"
              aria-label={`Modifica importo ${item.name}`}
            >
              <div className="text-base font-bold tabular-nums">
                {formatEUR(item.amount)}
              </div>
              <div className="text-[10px] tracking-wider text-stone-400 uppercase">
                {FREQUENCY_META[item.frequency].short}
              </div>
            </button>
          )}
          {isAnnualish && (
            <div className="mt-0.5 text-[10px] text-stone-500 tabular-nums">
              ≈ {formatEUR(monthly)}/mese
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2">
        <div className="flex items-center gap-2 text-[11px] text-stone-500">
          <span>{FREQUENCY_META[item.frequency].label}</span>
          <span>·</span>
          <span>{item.type === "fixed" ? "Fissa" : "Variabile"}</span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-stone-600 active:bg-stone-100"
        >
          <Edit3 className="h-3 w-3" />
          Modifica
        </button>
      </div>
    </div>
  );
}
