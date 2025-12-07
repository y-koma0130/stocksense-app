import type { GetLatestMarketAnalysis } from "@/server/features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import type { CalculateMidTermValueStockScore } from "../../domain/services/calculateMidTermValueStockScore.service";
import type { FilterProMarket } from "../../domain/services/filterProMarket.service";
import type { TrapStockCheckResult } from "../../domain/services/isTrapStock.service";
import type { RankByScore } from "../../domain/services/rankByScore.service";
import type { GetLatestMidTermIndicators } from "../../infrastructure/queryServices/getIndicators";
import type { FilterConditionsInputDto } from "../dto/filterConditionsInput.dto";
import type { MidTermIndicatorDto } from "../dto/midTermIndicator.dto";
import { type MidTermValueStockDto, midTermValueStockDtoSchema } from "../dto/valueStock.dto";

/**
 * 罠銘柄判定関数の型定義
 */
type IsTrapStock = (indicator: MidTermIndicatorDto) => TrapStockCheckResult;

/**
 * ユースケースの依存関係
 */
type Dependencies = Readonly<{
  getLatestMidTermIndicators: GetLatestMidTermIndicators;
  getLatestMarketAnalysis: GetLatestMarketAnalysis;
  calculateMidTermValueStockScore: CalculateMidTermValueStockScore;
  filterProMarket: FilterProMarket;
  isTrapStock: IsTrapStock;
  rankByScore: RankByScore;
}>;

/**
 * ユースケースのパラメータ
 */
type Params = Readonly<{
  limit: number;
  filterConditions?: FilterConditionsInputDto;
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
 * 2. マーケット分析データを取得（有望タグ情報）
 * 3. PROマーケット銘柄を除外
 * 4. 罠銘柄を除外
 * 5. 中期スコアを計算（市場別重み配分、グロース市場はEPS成長率・タグスコア使用）
 * 6. スコア順にランキング
 * 7. DTOにパースして返却
 */
export const getTopMidTermValueStocks: GetTopMidTermValueStocks = async (dependencies, params) => {
  const {
    getLatestMidTermIndicators,
    getLatestMarketAnalysis,
    calculateMidTermValueStockScore,
    filterProMarket,
    isTrapStock,
    rankByScore,
  } = dependencies;

  // 1. クエリサービスから中期指標データを取得
  const indicators = await getLatestMidTermIndicators(params.filterConditions);

  // 2. マーケット分析データを取得（有望・不利タグ情報）
  const marketAnalysis = await getLatestMarketAnalysis({ periodType: "mid_term" });
  const favorableMacroTagIds = marketAnalysis?.favorableMacroTags ?? [];
  const favorableThemeTagIds = marketAnalysis?.favorableThemeTags ?? [];
  const unfavorableMacroTagIds = marketAnalysis?.unfavorableMacroTags ?? [];
  const unfavorableThemeTagIds = marketAnalysis?.unfavorableThemeTags ?? [];

  // 3. PROマーケット除外
  const filteredByMarket = filterProMarket(indicators);

  // 4. 罠銘柄除外
  const filteredByTrap = filteredByMarket.filter((indicator) => !isTrapStock(indicator).isTrap);

  // 5. 中期スコア計算
  const scoredStocks = filteredByTrap.map((indicator) => ({
    ...indicator,
    valueScore: calculateMidTermValueStockScore({
      indicator,
      stockMacroTagIds: indicator.macroTagIds,
      stockThemeTagIds: indicator.themeTagIds,
      favorableMacroTagIds,
      favorableThemeTagIds,
      unfavorableMacroTagIds,
      unfavorableThemeTagIds,
      epsLatest: indicator.epsLatest,
      eps3yAgo: indicator.eps3yAgo,
    }),
  }));

  // 6. ランキング
  const rankedStocks = rankByScore(scoredStocks, params.limit);

  // 7. DTOとしてバリデーション
  return rankedStocks.map((stock) => midTermValueStockDtoSchema.parse(stock));
};
