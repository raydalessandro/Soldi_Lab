"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDismissibleBanner } from "@/lib/hooks/useDismissibleBanner";

// Tipo minimo del beforeinstallprompt event (non-standard, gli unici browser
// che lo emettono sono Chromium-based su desktop e Android).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// Banner non invadente che mostra "Installa l'app" quando il browser emette
// beforeinstallprompt e l'utente non l'ha già chiuso. Dismissibile.
export function InstallPrompt() {
  const { visible: dismissable, dismiss } = useDismissibleBanner("install");
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!dismissable || !event) return null;

  const onInstall = async () => {
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === "accepted") dismiss();
    } finally {
      // qualunque sia la scelta, l'evento è consumato — non ri-mostriamo
      setEvent(null);
    }
  };

  return (
    <div
      className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm"
      role="note"
    >
      <Download className="h-5 w-5 flex-shrink-0 text-stone-700" />
      <div className="flex-1">
        <div className="text-sm font-semibold">Installa Soldi_Lab</div>
        <div className="text-xs text-stone-500">
          Aggiungila alla home per accederci offline.
        </div>
      </div>
      <button
        type="button"
        onClick={onInstall}
        className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Installa
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="-mt-1 -mr-1 p-1 text-stone-400"
        aria-label="Chiudi suggerimento installa"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
