import { calculateLongTermValueStockScore } from "../../domain/services/calculateLongTermValueStockScore.service";
import { filterProMarket } from "../../domain/services/filterProMarket.service";
import { isTrapStock } from "../../domain/services/isTrapStock.service";
import { rankByScore } from "../../domain/services/rankByScore.service";
import type { GetLatestLongTermIndicators } from "../../infrastructure/queryServices/getIndicators";
import { type LongTermValueStockDto, longTermValueStockDtoSchema } from "../dto/valueStock.dto";

/**
 * ユースケースの依存関係
 */
type Dependencies = Readonly<{
  getLatestLongTermIndicators: GetLatestLongTermIndicators;
}>;

/**
 * ユースケースのパラメータ
 */
type Params = Readonly<{
  limit: number;
}>;

/**
 * 長期上位割安株取得ユースケースの型定義
 */
export type GetTopLongTermValueStocks = (
  dependencies: Dependencies,
  params: Params,
) => Promise<LongTermValueStockDto[]>;

/**
 * 長期上位割安株を取得するユースケース
 *
 * 処理フロー:
 * 1. クエリサービスから長期指標データを取得
 * 2. PROマーケット銘柄を除外
 * 3. 罠銘柄を除外
 * 4. 長期スコアを計算
 * 5. スコア順にランキング
 * 6. DTOにパースして返却
 */
export const getTopLongTermValueStocks: GetTopLongTermValueStocks = async (
  dependencies,
  params,
) => {
  // 1. クエリサービスから長期指標データを取得
  const indicators = await dependencies.getLatestLongTermIndicators();

  // 2. PROマーケット除外
  const filteredByMarket = filterProMarket(indicators);

  // 3. 罠銘柄除外
  const filteredByTrap = filteredByMarket.filter((indicator) => !isTrapStock(indicator).isTrap);

  // 4. 長期スコア計算
  const scoredStocks = filteredByTrap.map((indicator) => ({
    ...indicator,
    valueScore: calculateLongTermValueStockScore(indicator),
  }));

  // 5. ランキング
  const rankedStocks = rankByScore(scoredStocks, params.limit);

  // 6. DTOとしてバリデーション
  return rankedStocks.map((stock) => longTermValueStockDtoSchema.parse(stock));
};
