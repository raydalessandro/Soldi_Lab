"use client";

import { ChevronDown, Settings } from "lucide-react";
import Link from "next/link";
import { useActiveSpace } from "@/lib/hooks/useActiveSpace";
import { useUIStore } from "@/lib/store/ui";
import { DEFAULT_SPACE_ICON } from "@/lib/bootstrap";

// Barra mostrata in cima alla Dashboard: spazio attivo (tap → switcher)
// e accesso rapido alle impostazioni. È diversa dal PageHeader: il
// PageHeader è il titolo della singola pagina, questo è il contesto-spazio.
export function SpaceContextBar() {
  const space = useActiveSpace();
  const openSwitcher = useUIStore((s) => s.openSpaceSwitcher);

  if (!space) return null;

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3">
      <button
        type="button"
        onClick={openSwitcher}
        className="flex items-center gap-2 active:opacity-70"
        aria-label="Cambia spazio"
      >
        <span className="text-2xl">{space.icon ?? DEFAULT_SPACE_ICON}</span>
        <div className="text-left">
          <div className="text-[10px] font-medium tracking-widest text-stone-400 uppercase">
            Spazio
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold">
            {space.name}
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </button>
      <Link
        href="/settings"
        className="-mr-2 p-2 text-stone-600"
        aria-label="Apri impostazioni"
      >
        <Settings className="h-5 w-5" />
      </Link>
    </div>
  );
}
