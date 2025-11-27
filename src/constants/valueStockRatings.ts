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
  [VALUE_STOCK_RATINGS.EXCELLENT]: "上位銘柄の中でも特に優れる",
  [VALUE_STOCK_RATINGS.GOOD]: "上位銘柄として十分魅力がある",
  [VALUE_STOCK_RATINGS.FAIR]: "上位銘柄の中では平均的",
  [VALUE_STOCK_RATINGS.POOR]: "上位抽出されているが慎重に判断すべき",
  [VALUE_STOCK_RATINGS.VERY_POOR]: "上位抽出されているが割安株とは言えない",
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
 */
export const VALUE_STOCK_RATING_COLORS: Record<ValueStockRatingConstant, string> = {
  [VALUE_STOCK_RATINGS.EXCELLENT]: "green",
  [VALUE_STOCK_RATINGS.GOOD]: "blue",
  [VALUE_STOCK_RATINGS.FAIR]: "gray",
  [VALUE_STOCK_RATINGS.POOR]: "orange",
  [VALUE_STOCK_RATINGS.VERY_POOR]: "red",
};
