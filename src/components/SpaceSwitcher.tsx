"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { useSpaces } from "@/lib/hooks/useActiveSpace";
import { createSpace } from "@/lib/repo/spaces";
import { updateAppSettings } from "@/lib/repo/settings";
import { useUIStore } from "@/lib/store/ui";
import { cn } from "@/lib/cn";
import { DEFAULT_SPACE_ICON } from "@/lib/bootstrap";

interface SpaceSwitcherProps {
  activeSpaceId: string;
}

// Bottom-sheet con la lista degli spazi disponibili, switch e creazione.
// Aperto/chiuso da useUIStore.
export function SpaceSwitcher({ activeSpaceId }: SpaceSwitcherProps) {
  const open = useUIStore((s) => s.spaceSwitcherOpen);
  const close = useUIStore((s) => s.closeSpaceSwitcher);
  const spaces = useSpaces();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  if (!open) return null;

  const onSelect = async (id: string) => {
    if (id === activeSpaceId) {
      close();
      return;
    }
    await updateAppSettings({ active_space_id: id });
    close();
  };

  const onCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    const space = await createSpace({ name, icon: DEFAULT_SPACE_ICON });
    await updateAppSettings({ active_space_id: space.id });
    setNewName("");
    setCreating(false);
    close();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Cambia spazio"
    >
      <div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-stone-300" />
        <h2 className="mb-4 text-lg font-semibold">Cambia spazio</h2>

        <div className="space-y-2">
          {spaces?.map((space) => (
            <button
              key={space.id}
              type="button"
              onClick={() => onSelect(space.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl p-3",
                space.id === activeSpaceId
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {space.icon ?? DEFAULT_SPACE_ICON}
                </span>
                <span className="font-medium">{space.name}</span>
              </div>
              {space.id === activeSpaceId && <Check className="h-5 w-5" />}
            </button>
          ))}

          {creating ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
              <label
                htmlFor="space-switcher-new-name"
                className="mb-1 block text-[11px] font-medium tracking-wider text-stone-500 uppercase"
              >
                Nome nuovo spazio
              </label>
              <input
                id="space-switcher-new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Casa Genitori"
                autoFocus
                aria-label="Nome nuovo spazio"
                className="w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-200 outline-none focus:ring-stone-900"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                  }}
                  className="flex-1 rounded-lg bg-stone-100 py-2 text-sm font-medium text-stone-700"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={onCreate}
                  disabled={newName.trim().length === 0}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-semibold",
                    newName.trim().length === 0
                      ? "bg-stone-200 text-stone-400"
                      : "bg-stone-900 text-white",
                  )}
                >
                  Crea
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-3 text-stone-600"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Nuovo spazio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
