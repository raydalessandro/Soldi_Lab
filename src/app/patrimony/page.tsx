"use client";

import { Info, Plus, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { PageHeader } from "@/components/PageHeader";
import { AssetCard } from "@/components/patrimony/AssetCard";
import { AssetForm } from "@/components/patrimony/AssetForm";
import { PatrimonyFilters } from "@/components/patrimony/PatrimonyFilters";
import { PatrimonyHeader } from "@/components/patrimony/PatrimonyHeader";
import { useActiveSpaceId } from "@/lib/hooks/useActiveSpace";
import { useAssets } from "@/lib/hooks/useAssets";
import {
  computePatrimonyBreakdown,
  sortAssets,
} from "@/lib/insights/patrimony";
import { useUIStore } from "@/lib/store/ui";
import { PATRIMONY_META } from "@/lib/constants";
import type { Asset, PatrimonyType } from "@/lib/types";

export default function PatrimonyPage() {
  const spaceId = useActiveSpaceId();
  const filter = useUIStore((s) => s.patrimonyFilter);
  // Tutti gli asset del space attivo (compresi archiviati), filtriamo
  // client-side per coerenza col pattern Floor/Income.
  const assets = useAssets({ space_id: spaceId, includeArchived: true });

  const [showInfo, setShowInfo] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const breakdown = useMemo(
    () => computePatrimonyBreakdown(assets ?? []),
    [assets],
  );

  const visibleAssets = useMemo(() => {
    if (!assets) return [];
    const active = assets.filter((a) => a.archived_at === null);
    const filtered =
      filter === "all"
        ? active
        : active.filter((a) => a.patrimony_type === (filter as PatrimonyType));
    return sortAssets(filtered);
  }, [assets, filter]);

  if (!spaceId) return null;

  return (
    <>
      <PageHeader
        title="Patrimonio"
        action={
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="-mr-1 p-2"
              aria-label="Informazioni sul Patrimonio"
            >
              <Info className="h-5 w-5 text-stone-500" />
            </button>
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="-mr-2 p-2"
              aria-label="Aggiungi asset"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <OnboardingBanner
        storageKey="patrimony-rule"
        title="Ogni asset ha una funzione"
        body="Reserve protegge in emergenza, productive lavora e rende, parked è fermo senza piano. Etichetta gli asset onestamente."
        tone="sky"
      />

      <PatrimonyHeader breakdown={breakdown} />
      <PatrimonyFilters />

      <div className="space-y-2 px-4 pt-2">
        {visibleAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onEdit={() => setEditingAsset(asset)}
          />
        ))}

        {visibleAssets.length === 0 && (
          <div className="py-12 text-center text-stone-400">
            <TrendingUp className="mx-auto mb-2 h-12 w-12 opacity-30" />
            <div className="text-sm">
              {assets === undefined
                ? "Caricamento…"
                : "Nessun asset in questa categoria"}
            </div>
            {assets !== undefined && filter === "all" && (
              <div className="mt-1 text-xs">
                Tocca + per aggiungere conti, ETF, BTP, immobili
              </div>
            )}
          </div>
        )}
      </div>

      {showInfo && <PatrimonyRuleSheet onClose={() => setShowInfo(false)} />}

      {(addingNew || editingAsset) && (
        <AssetForm
          asset={editingAsset}
          spaceId={spaceId}
          onClose={() => {
            setAddingNew(false);
            setEditingAsset(null);
          }}
        />
      )}
    </>
  );
}

function PatrimonyRuleSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Le tre funzioni del Patrimonio"
    >
      <div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="mb-3 text-lg font-semibold">
          Le tre funzioni del Patrimonio
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-stone-700">
          Ogni asset ha una <strong>funzione strategica</strong> indipendente
          dalla sua natura tecnica (conto, ETF, immobile…).
        </p>
        <div className="space-y-2">
          {(["reserve", "productive", "parked"] as const).map((p) => {
            const meta = PATRIMONY_META[p];
            return (
              <div key={p} className={`rounded-xl p-3 ${meta.bg}`}>
                <div className={`text-sm font-semibold ${meta.text}`}>
                  {meta.label}
                </div>
                <div className={`text-xs ${meta.text} opacity-90`}>
                  {meta.hint}
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-stone-900 py-3 text-sm font-medium text-white"
        >
          Ho capito
        </button>
      </div>
    </div>
  );
}
