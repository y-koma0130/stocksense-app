import { calculateMidTermValueStockScore } from "../../domain/services/calculateMidTermValueStockScore.service";
import { filterProMarket } from "../../domain/services/filterProMarket.service";
import { isTrapStock } from "../../domain/services/isTrapStock.service";
import { rankByScore } from "../../domain/services/rankByScore.service";
import type { GetLatestMidTermIndicators } from "../../infrastructure/queryServices/getIndicators";
import { type MidTermValueStockDto, midTermValueStockDtoSchema } from "../dto/valueStock.dto";

/**
 * ユースケースの依存関係
 */
type Dependencies = Readonly<{
  getLatestMidTermIndicators: GetLatestMidTermIndicators;
}>;

/**
 * ユースケースのパラメータ
 */
type Params = Readonly<{
  limit: number;
}>;

/**
 * 中期上位割安株取得ユースケースの型定義
 */
export type GetTopMidTermValueStocks = (
  dependencies: Dependencies,
  params: Params,
) => Promise<MidTermValueStockDto[]>;

/**
 * 中期上位割安株を取得するユースケース
 *
 * 処理フロー:
 * 1. クエリサービスから中期指標データを取得
 * 2. PROマーケット銘柄を除外
 * 3. 罠銘柄を除外
 * 4. 中期スコアを計算
 * 5. スコア順にランキング
 * 6. DTOにパースして返却
 */
export const getTopMidTermValueStocks: GetTopMidTermValueStocks = async (dependencies, params) => {
  // 1. クエリサービスから中期指標データを取得
  const indicators = await dependencies.getLatestMidTermIndicators();

  // 2. PROマーケット除外
  const filteredByMarket = filterProMarket(indicators);

  // 3. 罠銘柄除外
  const filteredByTrap = filteredByMarket.filter((indicator) => !isTrapStock(indicator).isTrap);

  // 4. 中期スコア計算
  const scoredStocks = filteredByTrap.map((indicator) => ({
    ...indicator,
    valueScore: calculateMidTermValueStockScore(indicator),
  }));

  // 5. ランキング
  const rankedStocks = rankByScore(scoredStocks, params.limit);

  // 6. DTOとしてバリデーション
  return rankedStocks.map((stock) => midTermValueStockDtoSchema.parse(stock));
};
