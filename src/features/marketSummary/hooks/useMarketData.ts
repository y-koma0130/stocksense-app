"use client";

import { trpc } from "../../../../trpc/client";

export function useMarketData() {
  const { data, isLoading, error } = trpc.market.getAll.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
  });

  return {
    data: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}
