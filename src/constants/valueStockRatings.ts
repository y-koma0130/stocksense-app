/**
 * バリュー株評価の定数定義
 * 既に内部スコアリングにより上位に抽出された銘柄の相対評価
 */

export const VALUE_STOCK_RATINGS = {
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
  VERY_POOR: "very_poor",
} as const;

export type ValueStockRatingConstant =
  (typeof VALUE_STOCK_RATINGS)[keyof typeof VALUE_STOCK_RATINGS];

/**
 * 評価レベルのラベル（日本語）
 */
export const VALUE_STOCK_RATING_LABELS: Record<ValueStockRatingConstant, string> = {
  [VALUE_STOCK_RATINGS.EXCELLENT]: "超おすすめ",
  [VALUE_STOCK_RATINGS.GOOD]: "おすすめ",
  [VALUE_STOCK_RATINGS.FAIR]: "中立",
  [VALUE_STOCK_RATINGS.POOR]: "注意",
  [VALUE_STOCK_RATINGS.VERY_POOR]: "要注意",
};

/**
 * 評価レベルの数値スコア（5段階）
 */
export const VALUE_STOCK_RATING_SCORES: Record<ValueStockRatingConstant, number> = {
  [VALUE_STOCK_RATINGS.EXCELLENT]: 5,
  [VALUE_STOCK_RATINGS.GOOD]: 4,
  [VALUE_STOCK_RATINGS.FAIR]: 3,
  [VALUE_STOCK_RATINGS.POOR]: 2,
  [VALUE_STOCK_RATINGS.VERY_POOR]: 1,
};

/**
 * 評価レベルの色（UI表示用）
 * 実際の色コードは colors.ts の RATING_COLORS を使用
 */
export const VALUE_STOCK_RATING_COLORS: Record<ValueStockRatingConstant, string> = {
  [VALUE_STOCK_RATINGS.EXCELLENT]: "excellent",
  [VALUE_STOCK_RATINGS.GOOD]: "good",
  [VALUE_STOCK_RATINGS.FAIR]: "fair",
  [VALUE_STOCK_RATINGS.POOR]: "poor",
  [VALUE_STOCK_RATINGS.VERY_POOR]: "veryPoor",
};
