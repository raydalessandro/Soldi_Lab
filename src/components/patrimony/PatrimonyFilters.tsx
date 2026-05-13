"use client";

import { PATRIMONY_META, PATRIMONY_ORDER } from "@/lib/constants";
import { useUIStore } from "@/lib/store/ui";
import { cn } from "@/lib/cn";

const ALL = { id: "all", label: "Tutti" } as const;

export function PatrimonyFilters() {
  const filter = useUIStore((s) => s.patrimonyFilter);
  const setFilter = useUIStore((s) => s.setPatrimonyFilter);

  const filters = [
    ALL,
    ...PATRIMONY_ORDER.map((p) => ({ id: p, label: PATRIMONY_META[p].label })),
  ] as const;

  return (
    <div className="sticky top-[104px] z-[5] flex gap-2 overflow-x-auto bg-stone-50 px-4 py-2">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => setFilter(f.id)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
            filter === f.id
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-700",
          )}
          aria-pressed={filter === f.id}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
