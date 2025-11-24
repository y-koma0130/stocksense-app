import { calculateValueScore } from "../../domain/services/calculateValueScore.service";
import { isTrapStock } from "../../domain/services/isTrapStock.service";
import type { PeriodType } from "../../domain/values/periodType";
import type { GetLatestStockIndicators } from "../../infrastructure/queryServices/getStockIndicators";
import { type ValueStockDto, valueStockDtoSchema } from "../dto/stockIndicator.dto";

/**
 * ユースケースの依存関係
 */
type Dependencies = Readonly<{
  getLatestStockIndicators: GetLatestStockIndicators;
}>;

/**
 * ユースケースのパラメータ
 */
type Params = Readonly<{
  periodType: PeriodType;
  limit: number;
}>;

/**
 * 上位割安株取得ユースケースの型定義
 */
export type GetTopValueStocks = (
  dependencies: Dependencies,
  params: Params,
) => Promise<ValueStockDto[]>;

/**
 * PROマーケット（TOKYO PRO Market）かどうかを判定
 */
const isProMarket = (market: string | null): boolean => {
  if (!market) return false;
  return market.includes("PRO") || market.includes("プロ");
};

/**
 * 上位割安株を取得するユースケース
 * 1. クエリサービスから最新の指標データを取得
 * 2. PROマーケットを除外
 * 3. 罠銘柄を除外
 * 4. ドメインサービスでスコアを計算
 * 5. スコア順にソートして上位N件を返却
 */
export const getTopValueStocks: GetTopValueStocks = async (dependencies, params) => {
  // クエリサービスから全件取得
  const indicators = await dependencies.getLatestStockIndicators(params.periodType);

  // PROマーケット除外 → 罠銘柄除外 → スコア計算
  const stocksWithScores = indicators
    .filter((indicator) => !isProMarket(indicator.market))
    .filter((indicator) => !isTrapStock(indicator).isTrap)
    .map((indicator) => ({
      ...indicator,
      valueScore: calculateValueScore(indicator),
    }))
    .sort((a, b) => b.valueScore.totalScore - a.valueScore.totalScore)
    .slice(0, params.limit);

  // DTOとしてバリデーション
  return stocksWithScores.map((stock) => valueStockDtoSchema.parse(stock));
};
