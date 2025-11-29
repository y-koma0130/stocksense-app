import { z } from "zod";

/**
 * 銘柄財務健全性エンティティのZodスキーマ
 * 罠銘柄除外判定に使用する財務健全性指標 + 長期スコアリング用EPS
 */
export const stockFinancialHealthSchema = z.object({
  stockId: z.string().uuid(),
  equityRatio: z.number().nullable(), // 自己資本比率(%)
  roe: z.number().nullable(), // ROE(%)
  operatingIncomeDeclineYears: z.number().int().nullable(), // 営業利益減少連続年数
  operatingCashFlowNegativeYears: z.number().int().nullable(), // 営業CF負の連続年数
  revenueDeclineYears: z.number().int().nullable(), // 売上減少連続年数
  // EPS成長率計算用（長期スコアリング用）
  epsLatest: z.number().nullable(), // 最新年度のEPS
  eps3yAgo: z.number().nullable(), // 3年前のEPS
});

/**
 * 銘柄財務健全性エンティティ型
 */
export type StockFinancialHealth = z.infer<typeof stockFinancialHealthSchema>;

/**
 * 銘柄財務健全性エンティティの生成パラメータ
 */
export type CreateStockFinancialHealthParams = {
  stockId: string;
  equityRatio: number | null;
  roe: number | null;
  operatingIncomeDeclineYears: number | null;
  operatingCashFlowNegativeYears: number | null;
  revenueDeclineYears: number | null;
  epsLatest: number | null;
  eps3yAgo: number | null;
};

/**
 * 銘柄財務健全性エンティティを生成する
 * バリデーションを行い、正しい形式のエンティティを返す
 */
export const createStockFinancialHealth = (
  params: CreateStockFinancialHealthParams,
): StockFinancialHealth => {
  return stockFinancialHealthSchema.parse({
    stockId: params.stockId,
    equityRatio: params.equityRatio,
    roe: params.roe,
    operatingIncomeDeclineYears: params.operatingIncomeDeclineYears,
    operatingCashFlowNegativeYears: params.operatingCashFlowNegativeYears,
    revenueDeclineYears: params.revenueDeclineYears,
    epsLatest: params.epsLatest,
    eps3yAgo: params.eps3yAgo,
  });
};
