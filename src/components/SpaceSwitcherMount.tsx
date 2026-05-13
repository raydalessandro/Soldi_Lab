"use client";

import { useActiveSpaceId } from "@/lib/hooks/useActiveSpace";
import { SpaceSwitcher } from "./SpaceSwitcher";

// Mounter sicuro: rende SpaceSwitcher solo dopo che AppSettings esiste
// (cioè dopo l'onboarding). Evita di leggere un activeSpaceId mancante.
export function SpaceSwitcherMount() {
  const activeSpaceId = useActiveSpaceId();
  if (!activeSpaceId) return null;
  return <SpaceSwitcher activeSpaceId={activeSpaceId} />;
}
