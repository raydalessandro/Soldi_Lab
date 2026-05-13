"use client";

import { Edit3 } from "lucide-react";
import { useState } from "react";
import { ASSET_TYPE_META, PATRIMONY_META } from "@/lib/constants";
import { formatEUR } from "@/lib/format";
import { updateAsset } from "@/lib/repo/assets";
import { cn } from "@/lib/cn";
import type { Asset } from "@/lib/types";

interface Props {
  asset: Asset;
  onEdit: () => void;
}

export function AssetCard({ asset, onEdit }: Props) {
  const meta = PATRIMONY_META[asset.patrimony_type];
  const typeLabel = ASSET_TYPE_META[asset.type].label;
  const [editingValue, setEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState(asset.current_value.toString());

  const commit = async () => {
    const n = parseFloat(tempValue.replace(",", "."));
    if (!isNaN(n) && n >= 0 && n !== asset.current_value) {
      await updateAsset(asset.id, { current_value: n });
    }
    setEditingValue(false);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase",
                meta.bg,
                meta.text,
              )}
            >
              {meta.label}
            </span>
            <span className="text-[9px] font-medium tracking-wider text-stone-500 uppercase">
              {typeLabel}
            </span>
          </div>
          <div className="text-sm font-semibold">{asset.name}</div>
        </div>

        <div className="flex-shrink-0 text-right">
          {editingValue ? (
            <input
              type="number"
              inputMode="decimal"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditingValue(false);
              }}
              className="w-28 rounded-lg border border-stone-300 px-2 py-1 text-right text-sm font-bold outline-none focus:border-stone-900"
              autoFocus
              aria-label={`Valore ${asset.name}`}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempValue(asset.current_value.toString());
                setEditingValue(true);
              }}
              className="text-right active:opacity-50"
              aria-label={`Modifica valore ${asset.name}`}
            >
              <div className="text-base font-bold tabular-nums">
                {formatEUR(asset.current_value)}
              </div>
              <div className="text-[10px] tracking-wider text-stone-400 uppercase">
                Valore
              </div>
            </button>
          )}
        </div>
      </div>

      {(asset.expected_return_pct !== undefined ||
        asset.monthly_contribution !== undefined ||
        asset.maturity_date) && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-100 pt-2 text-[11px] text-stone-500">
          {asset.expected_return_pct !== undefined && (
            <span>
              Rend:{" "}
              <strong className="text-stone-700">
                {asset.expected_return_pct}%
              </strong>
              /anno
            </span>
          )}
          {asset.monthly_contribution !== undefined && (
            <span>
              PAC:{" "}
              <strong className="text-stone-700">
                {formatEUR(asset.monthly_contribution)}
              </strong>
              /mese
            </span>
          )}
          {asset.maturity_date && (
            <span>
              Scad:{" "}
              <strong className="text-stone-700">
                {new Date(asset.maturity_date).toLocaleDateString("it-IT", {
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-end border-t border-stone-100 pt-2">
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
