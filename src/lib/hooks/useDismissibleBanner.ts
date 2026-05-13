"use client";

import { useEffect, useState } from "react";

// Banner one-time dismissibili. Lo stato vive in localStorage perché:
//  - non è strutturale (non finisce nei backup)
//  - è preferenza device-specific (un nuovo browser ri-mostra il banner)
//  - non vale la pena complicare lo schema Dexie

const STORAGE_PREFIX = "soldi-lab.banner.";

export function useDismissibleBanner(key: string): {
  visible: boolean;
  dismiss: () => void;
} {
  // SSR/SSG safety: il valore iniziale è "false" per evitare flash; il vero
  // valore viene letto dopo il mount nell'effect.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Sincronizzazione con localStorage al mount. È un caso legittimo di
    // setState nel useEffect (localStorage non è disponibile in SSR e
    // non vale un useSyncExternalStore per una lettura una-tantum).
    let dismissed: string | null = null;
    let canRead = true;
    try {
      dismissed = window.localStorage.getItem(STORAGE_PREFIX + key);
    } catch {
      canRead = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!canRead || dismissed === null);
  }, [key]);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, "1");
    } catch {
      // ignore
    }
  };

  return { visible, dismiss };
}
