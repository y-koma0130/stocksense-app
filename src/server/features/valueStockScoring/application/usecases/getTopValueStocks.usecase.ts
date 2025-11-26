import type { PeriodType } from "@/constants/periodTypes";
import { PERIOD_TYPES } from "@/constants/periodTypes";
import { calculateValueStockScore } from "../../domain/services/calculateValueStockScore.service";
import { filterProMarket } from "../../domain/services/filterProMarket.service";
import { isTrapStock } from "../../domain/services/isTrapStock.service";
import { rankByScore } from "../../domain/services/rankByScore.service";
import { LONG_TERM_CONFIG, MID_TERM_CONFIG } from "../../domain/values/scoringConfig";
import type { GetLatestIndicators } from "../../infrastructure/queryServices/getIndicators";
import { type ValueStockDto, valueStockDtoSchema } from "../dto/valueStock.dto";

/**
 * ユースケースの依存関係
 */
type Dependencies = Readonly<{
  getLatestIndicators: GetLatestIndicators;
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
 * 上位割安株を取得するユースケース
 * 1. クエリサービスから最新の指標データを取得
 * 2. ドメインサービスでフィルタリング（PROマーケット、罠銘柄）
 * 3. ドメインサービスでスコア計算
 * 4. ドメインサービスでランキング
 * 5. DTOにパースして返却
 */
export const getTopValueStocks: GetTopValueStocks = async (dependencies, params) => {
  // 1. クエリサービスから全件取得
  const indicators = await dependencies.getLatestIndicators(params.periodType);

  // 2. 期間タイプに応じたスコアリング設定を取得
  const config = params.periodType === PERIOD_TYPES.MID_TERM ? MID_TERM_CONFIG : LONG_TERM_CONFIG;

  // 3. PROマーケット除外
  const filteredByMarket = filterProMarket(indicators);

  // 4. 罠銘柄除外
  const filteredByTrap = filteredByMarket.filter((indicator) => !isTrapStock(indicator).isTrap);

  // 5. スコア計算（各指標にスコアを付与）
  const scoredStocks = filteredByTrap.map((indicator) => ({
    ...indicator,
    valueScore: calculateValueStockScore(indicator, config),
  }));

  // 6. ランキング
  const rankedStocks = rankByScore(scoredStocks, params.limit);

  // 7. DTOとしてバリデーション
  return rankedStocks.map((stock) => valueStockDtoSchema.parse(stock));
};
