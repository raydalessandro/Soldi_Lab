"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { listAssets, type ListAssetsOptions } from "../repo/assets";

export function useAssets(
  options: Partial<ListAssetsOptions> & { space_id: string | undefined },
) {
  return useLiveQuery(async () => {
    if (!options.space_id) return [];
    return listAssets({
      ...options,
      space_id: options.space_id,
    } as ListAssetsOptions);
  }, [
    options.space_id,
    options.includeArchived,
    options.patrimony_type,
    options.type,
  ]);
}
