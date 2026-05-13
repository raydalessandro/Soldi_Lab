"use client";

// Hooks reattivi su Dexie via useLiveQuery (dexie-react-hooks).
// I componenti leggono lo stato e si re-renderizzano in automatico
// quando il DB cambia.
//
// Stato "loading" vs "missing": useLiveQuery restituisce undefined
// durante il primo fetch e prima che la promise risolva. Per
// distinguere caricamento da "no row in DB" usiamo il wrapper che
// mappa esplicitamente i due casi.

import { useLiveQuery } from "dexie-react-hooks";
import { getAppSettings } from "../repo/settings";
import { getSpace, listSpaces } from "../repo/spaces";
import type { AppSettings, Space } from "../types";

export type AppInitState = "loading" | "missing" | AppSettings;

export function useAppInitState(): AppInitState {
  const result = useLiveQuery(async () => {
    const s = await getAppSettings();
    return s ?? null;
  });
  if (result === undefined) return "loading";
  if (result === null) return "missing";
  return result;
}

export function useActiveSpaceId(): string | undefined {
  const state = useAppInitState();
  if (typeof state === "string") return undefined;
  return state.active_space_id;
}

export function useActiveSpace(): Space | undefined {
  const id = useActiveSpaceId();
  return useLiveQuery(async () => (id ? await getSpace(id) : undefined), [id]);
}

export function useSpaces(): Space[] | undefined {
  return useLiveQuery(() => listSpaces({ includeArchived: false }));
}
