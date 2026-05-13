import { Building, ExternalLink } from "lucide-react";
import Image from "next/image";
import { APP_ECOSYSTEM_LABEL, APP_NAME, PARENT_APP_URL } from "@/lib/constants";

// Header globale sticky: logo Soldi_Lab a sinistra (anche icona PWA),
// link diretto all'app madre La Famiglia Alpha a destra.
// Presente su tutte le pagine via RootLayout.
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <Image
          src="/icons/icon-192.png"
          alt={APP_NAME}
          width={36}
          height={36}
          priority
          className="h-9 w-9 rounded-lg object-cover"
        />
        <div className="leading-tight">
          <div className="text-[9px] font-medium tracking-widest text-stone-400 uppercase">
            {APP_ECOSYSTEM_LABEL}
          </div>
          <div className="text-xs font-semibold tracking-tight">{APP_NAME}</div>
        </div>
      </div>
      <a
        href={PARENT_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1.5 text-stone-700 transition-colors active:bg-stone-200"
        title="Apri La Famiglia Alpha"
      >
        <Building className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold">La Famiglia</span>
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    </header>
  );
}
