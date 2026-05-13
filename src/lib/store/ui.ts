// Store Zustand per stato di interfaccia transitorio.
// I dati strutturali (spazi, floor, income, assets) stanno in Dexie e
// arrivano ai componenti via useLiveQuery. Qui sta solo ciò che non
// merita persistenza: modali aperte, filtri attivi, voce in edit.

import { create } from "zustand";

interface UIState {
  spaceSwitcherOpen: boolean;
  openSpaceSwitcher: () => void;
  closeSpaceSwitcher: () => void;

  // Pagina Floor: filtro corrente.
  floorFilter: "all" | "essential" | "baseline" | "lifestyle" | "dormant";
  setFloorFilter: (f: UIState["floorFilter"]) => void;

  // Pagina Patrimony: filtro corrente.
  patrimonyFilter: "all" | "reserve" | "productive" | "parked";
  setPatrimonyFilter: (f: UIState["patrimonyFilter"]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  spaceSwitcherOpen: false,
  openSpaceSwitcher: () => set({ spaceSwitcherOpen: true }),
  closeSpaceSwitcher: () => set({ spaceSwitcherOpen: false }),

  floorFilter: "all",
  setFloorFilter: (floorFilter) => set({ floorFilter }),

  patrimonyFilter: "all",
  setPatrimonyFilter: (patrimonyFilter) => set({ patrimonyFilter }),
}));
