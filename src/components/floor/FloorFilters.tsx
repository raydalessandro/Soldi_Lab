"use client";

import { NECESSITY_META, NECESSITY_ORDER } from "@/lib/constants";
import { useUIStore } from "@/lib/store/ui";
import { cn } from "@/lib/cn";

const ALL_FILTER = { id: "all", label: "Tutte" } as const;
const DORMANT_FILTER = { id: "dormant", label: "Dormienti" } as const;

export function FloorFilters() {
  const filter = useUIStore((s) => s.floorFilter);
  const setFilter = useUIStore((s) => s.setFloorFilter);

  const filters = [
    ALL_FILTER,
    ...NECESSITY_ORDER.map((level) => ({
      id: level,
      label: NECESSITY_META[level].label,
    })),
    DORMANT_FILTER,
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
