"use client";

import type { ReactNode } from "react";
import { useAppInitState } from "@/lib/hooks/useActiveSpace";
import { WelcomeFlow } from "./WelcomeFlow";

// Decide cosa mostrare al primo render dell'app.
// - "loading": il fetch iniziale di AppSettings non è ancora tornato
// - "missing": il DB è vuoto, va eseguito l'onboarding
// - oggetto: l'app è già stata inizializzata, renderizziamo l'app
//
// Il caricamento è quasi istantaneo (in-memory IndexedDB per Dexie),
// quindi mostriamo solo un placeholder neutro per evitare un flash.
export function AppBootstrap({ children }: { children: ReactNode }) {
  const state = useAppInitState();

  if (state === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-pulse rounded-full bg-stone-200" />
      </div>
    );
  }

  if (state === "missing") {
    return <WelcomeFlow />;
  }

  return <>{children}</>;
}
