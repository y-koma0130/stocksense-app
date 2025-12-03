import type { GetLatestMarketAnalysis } from "@/server/features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
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
  getLatestMarketAnalysis: GetLatestMarketAnalysis;
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
 * 2. マーケット分析データを取得（有望タグ情報）
 * 3. PROマーケット銘柄を除外
 * 4. 罠銘柄を除外
 * 5. 長期スコアを計算（市場別重み配分、全市場でタグスコア・EPS成長率・ROE使用）
 * 6. スコア順にランキング
 * 7. DTOにパースして返却
 */
export const getTopLongTermValueStocks: GetTopLongTermValueStocks = async (
  dependencies,
  params,
) => {
  // 1. クエリサービスから長期指標データを取得
  const indicators = await dependencies.getLatestLongTermIndicators();

  // 2. マーケット分析データを取得（有利/不利タグ情報）
  const marketAnalysis = await dependencies.getLatestMarketAnalysis({ periodType: "long_term" });
  const favorableMacroTagIds = marketAnalysis?.favorableMacroTags ?? [];
  const favorableThemeTagIds = marketAnalysis?.favorableThemeTags ?? [];
  const unfavorableMacroTagIds = marketAnalysis?.unfavorableMacroTags ?? [];
  const unfavorableThemeTagIds = marketAnalysis?.unfavorableThemeTags ?? [];

  // 3. PROマーケット除外
  const filteredByMarket = filterProMarket(indicators);

  // 4. 罠銘柄除外
  const filteredByTrap = filteredByMarket.filter((indicator) => !isTrapStock(indicator).isTrap);

  // 5. 長期スコア計算
  const scoredStocks = filteredByTrap.map((indicator) => ({
    ...indicator,
    valueScore: calculateLongTermValueStockScore({
      indicator,
      stockMacroTagIds: indicator.macroTagIds,
      stockThemeTagIds: indicator.themeTagIds,
      favorableMacroTagIds,
      favorableThemeTagIds,
      unfavorableMacroTagIds,
      unfavorableThemeTagIds,
    }),
  }));

  // 6. ランキング
  const rankedStocks = rankByScore(scoredStocks, params.limit);

  // 7. DTOとしてバリデーション
  return rankedStocks.map((stock) => longTermValueStockDtoSchema.parse(stock));
};
