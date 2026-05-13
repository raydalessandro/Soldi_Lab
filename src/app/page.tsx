"use client";

import { SpaceContextBar } from "@/components/SpaceContextBar";

// Dashboard (route "/").
// In F3 mostra solo SpaceContextBar e placeholder; i numeri grandi,
// triangolo accumulo, breakdown e card insight arrivano in F7 quando
// il motore di insight sarà calcolato.
export default function DashboardPage() {
  return (
    <>
      <SpaceContextBar />
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-stone-500">
          I tre numeri grandi, triangolo accumulo e health check arrivano nelle
          fasi successive (F4 → F7).
        </p>
      </div>
    </>
  );
}
