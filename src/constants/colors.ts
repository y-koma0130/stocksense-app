/**
 * アプリケーション共通のカラーテーマ
 *
 * ダークモード (背景: #434343, アクセント: #E9F355) に調和する
 * 5段階評価カラーパレット
 *
 * デザインコンセプト:
 * - 緑の多様性を抑え、統一感のある配色
 * - 黄色のアクセントカラーとのグラデーションを意識
 * - ブルー → シアン → イエローグリーン → オレンジ → レッドの流れ
 */

/**
 * 評価レベルに応じたカラーパレット
 * スコアや評価の表示で統一的に使用
 */
export const RATING_COLORS = {
  EXCELLENT: "#7ED97E", // ミディアムグリーン (マーケットサマリの前日比プラス色)
  GOOD: "#06b6d4", // シアンブルー (爽やかで洗練)
  FAIR: "#94a3b8", // スレートグレー (中立)
  POOR: "#fb923c", // コーラルオレンジ (警告)
  VERY_POOR: "#f43f5e", // ローズレッド (危険)
} as const;

/**
 * 成功・完了を表すカラー
 * AI解析完了マークなどで使用
 */
export const SUCCESS_COLOR = "#7ED97E"; // EXCELLENT と同じミディアムグリーンを使用

/**
 * スコアの範囲に応じた色を返す（0-100のスケール）
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return RATING_COLORS.EXCELLENT;
  if (score >= 60) return RATING_COLORS.GOOD;
  if (score >= 40) return RATING_COLORS.FAIR;
  if (score >= 20) return RATING_COLORS.POOR;
  return RATING_COLORS.VERY_POOR;
};

/**
 * バリュー株評価の色キーから実際の色を返す
 */
export const getRatingColorFromKey = (colorKey: string): string => {
  const colorMap: Record<string, string> = {
    excellent: RATING_COLORS.EXCELLENT,
    good: RATING_COLORS.GOOD,
    fair: RATING_COLORS.FAIR,
    poor: RATING_COLORS.POOR,
    veryPoor: RATING_COLORS.VERY_POOR,
  };

  return colorMap[colorKey] ?? RATING_COLORS.FAIR;
};
