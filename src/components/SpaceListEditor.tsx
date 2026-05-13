"use client";

import { Check, Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DEFAULT_SPACE_ICON } from "@/lib/bootstrap";
import { useActiveSpaceId, useSpaces } from "@/lib/hooks/useActiveSpace";
import { updateAppSettings } from "@/lib/repo/settings";
import { createSpace, hardDeleteSpace, updateSpace } from "@/lib/repo/spaces";
import { cn } from "@/lib/cn";
import type { Space } from "@/lib/types";

// Lista degli spazi nelle Impostazioni con rename inline, creazione e
// hard-delete (SPEC §10.4 eccezione con conferma "ELIMINA").
//
// La cancellazione dello spazio attivo è permessa solo se esistono
// altri spazi a cui spostare il puntatore (impedisce la situazione
// "app senza spazio attivo").
export function SpaceListEditor() {
  const spaces = useSpaces();
  const activeSpaceId = useActiveSpaceId();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Space | null>(null);

  if (!spaces || !activeSpaceId) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {spaces.map((space, i) => (
        <SpaceRow
          key={space.id}
          space={space}
          isLast={i === spaces.length - 1 && !creating}
          isActive={space.id === activeSpaceId}
          isEditing={editingId === space.id}
          onStartEdit={() => setEditingId(space.id)}
          onCancelEdit={() => setEditingId(null)}
          onSaveEdit={async (patch) => {
            await updateSpace(space.id, patch);
            setEditingId(null);
          }}
          onSetActive={() => updateAppSettings({ active_space_id: space.id })}
          onRequestDelete={() =>
            spaces.length > 1 ? setConfirmDelete(space) : undefined
          }
          canDelete={spaces.length > 1}
        />
      ))}

      {creating ? (
        <NewSpaceRow
          onCancel={() => setCreating(false)}
          onCreate={async (name, icon) => {
            await createSpace({ name, icon });
            setCreating(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex w-full items-center gap-3 p-3 active:bg-stone-50"
        >
          <Plus className="h-5 w-5 text-stone-600" />
          <div className="text-left">
            <div className="text-sm font-medium">Nuovo spazio</div>
            <div className="text-xs text-stone-500">
              Aggiungi una nuova famiglia o unità economica
            </div>
          </div>
        </button>
      )}

      {confirmDelete && (
        <DeleteConfirmModal
          space={confirmDelete}
          isActive={confirmDelete.id === activeSpaceId}
          fallbackSpaces={spaces.filter((s) => s.id !== confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
          onConfirm={async () => {
            const target = confirmDelete;
            const fallback = spaces.find((s) => s.id !== target.id);
            if (target.id === activeSpaceId && fallback) {
              await updateAppSettings({ active_space_id: fallback.id });
            }
            await hardDeleteSpace(target.id);
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}

interface SpaceRowProps {
  space: Space;
  isLast: boolean;
  isActive: boolean;
  isEditing: boolean;
  canDelete: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (patch: { name: string; icon?: string }) => Promise<void>;
  onSetActive: () => Promise<unknown>;
  onRequestDelete: () => void;
}

function SpaceRow({
  space,
  isLast,
  isActive,
  isEditing,
  canDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSetActive,
  onRequestDelete,
}: SpaceRowProps) {
  const [name, setName] = useState(space.name);
  const [icon, setIcon] = useState(space.icon ?? DEFAULT_SPACE_ICON);

  if (isEditing) {
    return (
      <div className={cn("p-3", !isLast && "border-b border-stone-100")}>
        <div className="flex items-center gap-2">
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value.slice(0, 4))}
            className="w-12 rounded-lg bg-stone-100 px-2 py-2 text-center text-xl outline-none"
            aria-label="Icona spazio"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg bg-stone-100 px-3 py-2 text-sm outline-none"
            aria-label="Nome spazio"
            autoFocus
          />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 rounded-lg bg-stone-100 py-2 text-sm font-medium text-stone-700"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={() =>
              onSaveEdit({ name: name.trim() || space.name, icon })
            }
            className="flex-1 rounded-lg bg-stone-900 py-2 text-sm font-semibold text-white"
          >
            Salva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3",
        !isLast && "border-b border-stone-100",
      )}
    >
      <button
        type="button"
        onClick={isActive ? undefined : () => onSetActive()}
        className="text-2xl active:opacity-60"
        aria-label={
          isActive ? "Spazio attivo" : `Imposta ${space.name} come attivo`
        }
        disabled={isActive}
      >
        {space.icon ?? DEFAULT_SPACE_ICON}
      </button>
      <div className="flex-1">
        <div className="text-sm font-medium">{space.name}</div>
        {isActive && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-700">
            <Check className="h-3 w-3" />
            Attivo
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onStartEdit}
        className="rounded-lg p-2 text-stone-500 active:bg-stone-100"
        aria-label={`Rinomina ${space.name}`}
      >
        <Edit3 className="h-4 w-4" />
      </button>
      {canDelete && (
        <button
          type="button"
          onClick={onRequestDelete}
          className="rounded-lg p-2 text-rose-600 active:bg-rose-50"
          aria-label={`Elimina ${space.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function NewSpaceRow({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (name: string, icon: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_SPACE_ICON);

  return (
    <div className="border-t border-stone-100 p-3">
      <div className="flex items-center gap-2">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value.slice(0, 4))}
          className="w-12 rounded-lg bg-stone-100 px-2 py-2 text-center text-xl outline-none"
          aria-label="Icona nuovo spazio"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg bg-stone-100 px-3 py-2 text-sm outline-none"
          placeholder="Es. Casa Genitori"
          aria-label="Nome nuovo spazio"
          autoFocus
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-stone-100 py-2 text-sm font-medium text-stone-700"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={() => onCreate(name.trim(), icon)}
          disabled={name.trim().length === 0}
          className={cn(
            "flex-1 rounded-lg py-2 text-sm font-semibold",
            name.trim().length === 0
              ? "bg-stone-200 text-stone-400"
              : "bg-stone-900 text-white",
          )}
        >
          Crea
        </button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  space,
  isActive,
  fallbackSpaces,
  onClose,
  onConfirm,
}: {
  space: Space;
  isActive: boolean;
  fallbackSpaces: Space[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const ok = typed === "ELIMINA";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Elimina ${space.name}`}
    >
      <div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="text-lg font-semibold">Elimina {space.name}</h2>
        <p className="mt-2 text-sm text-stone-600">
          Verranno cancellate <strong>tutte</strong> le voci di Floor, Entrate e
          Patrimonio di questo spazio. L&apos;operazione è irreversibile.
        </p>
        {isActive && fallbackSpaces[0] && (
          <p className="mt-2 text-sm text-stone-600">
            Lo spazio attivo passerà automaticamente a{" "}
            <strong>{fallbackSpaces[0].name}</strong>.
          </p>
        )}

        <label
          htmlFor="space-delete-confirm"
          className="mt-4 mb-1 block text-[11px] font-medium tracking-wider text-stone-500 uppercase"
        >
          Scrivi <code className="font-mono">ELIMINA</code> per confermare
        </label>
        <input
          id="space-delete-confirm"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          aria-label="Conferma eliminazione"
          className="w-full rounded-xl bg-stone-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-600"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-700"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!ok}
            className={cn(
              "flex-1 rounded-xl py-3 text-sm font-semibold",
              ok
                ? "bg-rose-600 text-white active:bg-rose-700"
                : "bg-stone-200 text-stone-400",
            )}
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
}
