import type { ValueStockScore } from "../entities/valueStockScore";

/**
 * スコア付き指標の型
 */
type ScoredIndicator<T> = T & { valueScore: ValueStockScore };

/**
 * スコア順ランキング関数の型定義
 */
export type RankByScore = <T>(
  scoredIndicators: readonly ScoredIndicator<T>[],
  limit: number,
) => ScoredIndicator<T>[];

/**
 * スコア順に並び替えて上位N件を取得する
 * トータルスコアの降順でソートし、指定された件数まで返却
 */
export const rankByScore: RankByScore = (scoredIndicators, limit) => {
  return [...scoredIndicators]
    .sort((a, b) => b.valueScore.totalScore - a.valueScore.totalScore)
    .slice(0, limit);
};
