import type { ValueStockDto } from "@/server/features/valueStockScoring/application/dto/valueStock.dto";
import { trpc } from "../../../../trpc/client";

type UseValueStockScoringParams = {
  periodType: "mid_term" | "long_term";
  limit?: number;
};

type UseValueStockScoringResult = {
  data: ValueStockDto[];
  loading: boolean;
  error: { message: string } | null;
};

/**
 * 割安株スコアリングデータを取得するフック
 * スコア計算とソートはサーバー側で実行済み
 */
export const useValueStockScoring = (
  params: UseValueStockScoringParams,
): UseValueStockScoringResult => {
  const { data, isLoading, error } = trpc.valueStockScoring.getTopValueStocks.useQuery(
    {
      periodType: params.periodType,
      limit: params.limit ?? 20,
    },
    {
      refetchInterval: 60 * 60 * 1000, // 1時間ごとに再取得
      staleTime: 30 * 60 * 1000, // 30分間はキャッシュを使用
    },
  );

  return {
    data: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
};
