"use client";

import { Banknote, Info, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { IncomeHeader } from "@/components/income/IncomeHeader";
import { IncomeItemCard } from "@/components/income/IncomeItemCard";
import { IncomeItemForm } from "@/components/income/IncomeItemForm";
import { useActiveSpaceId } from "@/lib/hooks/useActiveSpace";
import { useIncomeItems } from "@/lib/hooks/useIncomeItems";
import { computeIncomeBreakdown, sortIncomeItems } from "@/lib/insights/income";
import type { IncomeItem } from "@/lib/types";

export default function IncomePage() {
  const spaceId = useActiveSpaceId();
  const items = useIncomeItems({
    space_id: spaceId,
    includeArchived: true,
  });

  const [showInfo, setShowInfo] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const breakdown = useMemo(() => computeIncomeBreakdown(items ?? []), [items]);

  const activeItems = useMemo(() => {
    if (!items) return [];
    const active = items.filter((i) => i.active && i.archived_at === null);
    return sortIncomeItems(active, breakdown.monthlyByItemId);
  }, [items, breakdown]);

  const dormantItems = useMemo(() => {
    if (!items) return [];
    return items.filter((i) => !i.active && i.archived_at === null);
  }, [items]);

  if (!spaceId) return null;

  return (
    <>
      <PageHeader
        title="Entrate"
        action={
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="-mr-1 p-2"
              aria-label="Informazioni sulle entrate"
            >
              <Info className="h-5 w-5 text-stone-500" />
            </button>
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="-mr-2 p-2"
              aria-label="Aggiungi entrata"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <IncomeHeader breakdown={breakdown} />

      <div className="space-y-2 px-4 pt-2">
        {activeItems.map((item) => (
          <IncomeItemCard
            key={item.id}
            item={item}
            onEdit={() => setEditingItem(item)}
          />
        ))}

        {activeItems.length === 0 && (
          <div className="py-12 text-center text-stone-400">
            <Banknote className="mx-auto mb-2 h-12 w-12 opacity-30" />
            <div className="text-sm">
              {items === undefined
                ? "Caricamento…"
                : "Nessuna entrata registrata"}
            </div>
            {items !== undefined && (
              <div className="mt-1 text-xs">
                Tocca + per aggiungere stipendio, pensione o affitto attivo
              </div>
            )}
          </div>
        )}

        {dormantItems.length > 0 && (
          <>
            <div className="px-1 pt-4 pb-1 text-[10px] font-medium tracking-widest text-stone-400 uppercase">
              Dormienti
            </div>
            {dormantItems.map((item) => (
              <IncomeItemCard
                key={item.id}
                item={item}
                onEdit={() => setEditingItem(item)}
              />
            ))}
          </>
        )}
      </div>

      {showInfo && <IncomeRuleSheet onClose={() => setShowInfo(false)} />}

      {(addingNew || editingItem) && (
        <IncomeItemForm
          item={editingItem}
          spaceId={spaceId}
          onClose={() => {
            setAddingNew(false);
            setEditingItem(null);
          }}
        />
      )}
    </>
  );
}

function IncomeRuleSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cosa entra nelle Entrate"
    >
      <div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="mb-3 text-lg font-semibold">Cosa entra nelle Entrate</h2>
        <p className="mb-3 text-sm leading-relaxed text-stone-700">
          Solo <strong>flussi stabili e ricorrenti</strong>: stipendio,
          pensione, affitti attivi, consulenze regolari, rendite.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-stone-700">
          <strong>Fuori scope:</strong> bonus una tantum, vendite occasionali,
          rimborsi. Quelli sono extra e si gestiscono sul margine.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-stone-900 py-3 text-sm font-medium text-white"
        >
          Ho capito
        </button>
      </div>
    </div>
  );
}
