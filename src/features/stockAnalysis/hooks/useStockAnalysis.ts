import type { PeriodType } from "@/constants/periodTypes";
import { trpc } from "../../../../trpc/client";

type UseStockAnalysisParams = Readonly<{
  stockId: string;
  periodType: PeriodType;
}>;

export const useStockAnalysis = ({ stockId, periodType }: UseStockAnalysisParams) => {
  const query = trpc.stockAnalysis.getStockAnalysis.useQuery(
    {
      stockId,
      periodType,
    },
    {
      enabled: !!stockId,
    },
  );

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
  };
};
