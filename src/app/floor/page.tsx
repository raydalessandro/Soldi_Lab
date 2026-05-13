"use client";

import { Info, Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FloorFilters } from "@/components/floor/FloorFilters";
import { FloorHeader } from "@/components/floor/FloorHeader";
import { FloorItemCard } from "@/components/floor/FloorItemCard";
import { FloorItemForm } from "@/components/floor/FloorItemForm";
import { useActiveSpaceId } from "@/lib/hooks/useActiveSpace";
import { useFloorItems } from "@/lib/hooks/useFloorItems";
import { computeFloorBreakdown, sortFloorItems } from "@/lib/insights/floor";
import { useUIStore } from "@/lib/store/ui";
import type { FloorItem, NecessityLevel } from "@/lib/types";

export default function FloorPage() {
  const spaceId = useActiveSpaceId();
  const filter = useUIStore((s) => s.floorFilter);
  // Carichiamo sempre tutte le voci del floor (incluse archiviate) per
  // calcolare i breakdown su tutto e poi filtrare lato client.
  // SPEC §5: tutti gli insight runtime.
  const items = useFloorItems({
    space_id: spaceId,
    includeArchived: true,
  });

  const [showInfo, setShowInfo] = useState(false);
  const [editingItem, setEditingItem] = useState<FloorItem | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const breakdown = useMemo(() => computeFloorBreakdown(items ?? []), [items]);

  const visibleItems = useMemo(() => {
    if (!items) return [];
    const list = applyFloorFilter(items, filter);
    return sortFloorItems(list, breakdown.monthlyByItemId);
  }, [items, filter, breakdown]);

  if (!spaceId) return null;

  return (
    <>
      <PageHeader
        title="Floor"
        action={
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="-mr-1 p-2"
              aria-label="Informazioni sul Floor"
            >
              <Info className="h-5 w-5 text-stone-500" />
            </button>
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="-mr-2 p-2"
              aria-label="Aggiungi voce"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <FloorHeader breakdown={breakdown} />
      <FloorFilters />

      <div className="space-y-2 px-4 pt-2">
        {visibleItems.map((item) => (
          <FloorItemCard
            key={item.id}
            item={item}
            onEdit={() => setEditingItem(item)}
          />
        ))}

        {visibleItems.length === 0 && (
          <div className="py-12 text-center text-stone-400">
            <Wallet className="mx-auto mb-2 h-12 w-12 opacity-30" />
            <div className="text-sm">
              {items === undefined
                ? "Caricamento…"
                : "Nessuna voce in questa categoria"}
            </div>
            {items !== undefined && filter === "all" && (
              <div className="mt-1 text-xs">
                Tocca + per aggiungere mutuo, bollette, abbonamenti
              </div>
            )}
          </div>
        )}
      </div>

      {showInfo && <FloorRuleSheet onClose={() => setShowInfo(false)} />}

      {(addingNew || editingItem) && (
        <FloorItemForm
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

function applyFloorFilter(
  items: FloorItem[],
  filter: "all" | "essential" | "baseline" | "lifestyle" | "dormant",
): FloorItem[] {
  if (filter === "dormant")
    return items.filter((i) => !i.active && i.archived_at === null);
  const active = items.filter((i) => i.active && i.archived_at === null);
  if (filter === "all") return active;
  return active.filter((i) => i.necessity_level === (filter as NecessityLevel));
}

function FloorRuleSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="La regola del Floor"
    >
      <div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="mb-3 text-lg font-semibold">La regola del Floor</h2>
        <p className="mb-3 text-sm leading-relaxed text-stone-700">
          Una spesa entra nel Floor se{" "}
          <strong>ricorre con regolarità prevedibile</strong> e se la sua
          interruzione cambierebbe in modo strutturale la tua vita o
          richiederebbe una decisione consapevole.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-stone-700">
          Tutto il resto — caffè, cene fuori, regali improvvisati, viaggi extra
          — <strong>sta fuori</strong>. Quelle spese le gestisci tu sul margine
          che ti resta.
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
