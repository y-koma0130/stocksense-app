import { trpc } from "../../../../trpc/client";

export const useTopStockScores = (params: {
  limit?: number;
  scoreType?: "mid_term" | "long_term";
}) => {
  const { data, isLoading, error } = trpc.valueStockScoring.getTopScores.useQuery(
    {
      limit: params.limit ?? 20,
      scoreType: params.scoreType,
    },
    {
      refetchInterval: 60 * 60 * 1000, // Refresh every 1 hour
      staleTime: 30 * 60 * 1000, // Consider data stale after 30 minutes
    },
  );

  return {
    data: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
};
