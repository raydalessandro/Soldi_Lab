"use client";

import { useEffect } from "react";

// Registra public/sw.js dopo il mount. Lo facciamo in un client component
// dedicato così non blocca il render iniziale e isola il dev/prod toggle.
//
// In dev può essere fastidioso: la cache nasconde gli hot-reload. Per
// disabilitarlo basta NEXT_PUBLIC_SW_DISABLED=1.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NEXT_PUBLIC_SW_DISABLED === "1") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
