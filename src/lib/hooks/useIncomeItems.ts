"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { listIncomeItems, type ListIncomeItemsOptions } from "../repo/income";

export function useIncomeItems(
  options: Partial<ListIncomeItemsOptions> & { space_id: string | undefined },
) {
  return useLiveQuery(async () => {
    if (!options.space_id) return [];
    return listIncomeItems({
      ...options,
      space_id: options.space_id,
    } as ListIncomeItemsOptions);
  }, [options.space_id, options.includeArchived, options.onlyActive]);
}
