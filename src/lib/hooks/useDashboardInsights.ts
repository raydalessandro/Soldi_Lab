"use client";

import { useMemo } from "react";
import { useActiveSpaceId } from "./useActiveSpace";
import { useAssets } from "./useAssets";
import { useFloorItems } from "./useFloorItems";
import { useIncomeItems } from "./useIncomeItems";
import { computeInsights, type DashboardInsights } from "../insights/composite";

// Hook unico per la Dashboard: aggrega le tre live-query (floor, income,
// assets) e calcola computeInsights ogni volta che cambiano.
//
// Restituisce `undefined` finché tutti e tre i dataset non sono caricati,
// così la UI può mostrare un placeholder coerente.
export function useDashboardInsights(): DashboardInsights | undefined {
  const spaceId = useActiveSpaceId();
  const floor = useFloorItems({
    space_id: spaceId,
    includeArchived: true,
  });
  const income = useIncomeItems({
    space_id: spaceId,
    includeArchived: true,
  });
  const assets = useAssets({ space_id: spaceId, includeArchived: true });

  return useMemo(() => {
    if (!floor || !income || !assets) return undefined;
    return computeInsights(floor, income, assets);
  }, [floor, income, assets]);
}
