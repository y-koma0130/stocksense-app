import { z } from "zod";

/**
 * 銘柄財務健全性エンティティのZodスキーマ
 * 罠銘柄除外判定に使用する財務健全性指標
 */
export const stockFinancialHealthSchema = z.object({
  stockId: z.string().uuid(),
  equityRatio: z.number().nullable(), // 自己資本比率(%)
  operatingIncomeDeclineYears: z.number().int().nullable(), // 営業利益減少連続年数
  operatingCashFlowNegativeYears: z.number().int().nullable(), // 営業CF負の連続年数
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
  operatingIncomeDeclineYears: number | null;
  operatingCashFlowNegativeYears: number | null;
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
    operatingIncomeDeclineYears: params.operatingIncomeDeclineYears,
    operatingCashFlowNegativeYears: params.operatingCashFlowNegativeYears,
  });
};
