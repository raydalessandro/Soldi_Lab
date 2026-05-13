"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { listFloorItems, type ListFloorItemsOptions } from "../repo/floor";

export function useFloorItems(
  options: Partial<ListFloorItemsOptions> & { space_id: string | undefined },
) {
  return useLiveQuery(async () => {
    if (!options.space_id) return [];
    return listFloorItems({
      ...options,
      space_id: options.space_id,
    } as ListFloorItemsOptions);
  }, [
    options.space_id,
    options.includeArchived,
    options.necessity_level,
    options.onlyActive,
  ]);
}
