import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";

/**
 * タグスコア計算の入力データ
 */
export type TagScoreInput = Readonly<{
  /** 銘柄が持つマクロタグIDの配列 */
  stockMacroTagIds: readonly string[];
  /** 銘柄が持つテーマタグIDの配列 */
  stockThemeTagIds: readonly string[];
  /** マーケット分析で有望とされたマクロタグIDの配列 */
  favorableMacroTagIds: readonly string[];
  /** マーケット分析で有望とされたテーマタグIDの配列 */
  favorableThemeTagIds: readonly string[];
  /** マーケット分析で不利とされたマクロタグIDの配列 */
  unfavorableMacroTagIds: readonly string[];
  /** マーケット分析で不利とされたテーマタグIDの配列 */
  unfavorableThemeTagIds: readonly string[];
}>;

/**
 * タグスコア計算関数の型定義
 */
export type CalculateTagScore = (input: TagScoreInput, useOnlyTheme?: boolean) => IndicatorScore;

/**
 * タグ一致数から加点/減点を計算
 *
 * - 0個一致: 0点
 * - 1個一致: 15点
 * - 2個一致: 30点
 * - 3個以上一致: 50点
 */
const calculateTagPoints = (matchCount: number): number => {
  if (matchCount === 0) return 0;
  if (matchCount === 1) return 15;
  if (matchCount === 2) return 30;
  return 50; // 3個以上
};

/**
 * 一致するタグの数をカウント
 */
const countMatchingTags = (
  stockTagIds: readonly string[],
  targetTagIds: readonly string[],
): number => {
  return stockTagIds.filter((id) => targetTagIds.includes(id)).length;
};

/**
 * テーマタグスコアを計算
 *
 * ベース: 50点
 * - 有望テーマ一致: +15/30/50点（1/2/3個）
 * - 不利テーマ一致: -15/30/50点（1/2/3個）
 * 相殺方式: 純一致数でスコア計算
 */
const calculateThemeScore = (
  stockThemeTagIds: readonly string[],
  favorableThemeTagIds: readonly string[],
  unfavorableThemeTagIds: readonly string[],
): number => {
  const favorableMatchCount = countMatchingTags(stockThemeTagIds, favorableThemeTagIds);
  const unfavorableMatchCount = countMatchingTags(stockThemeTagIds, unfavorableThemeTagIds);

  const favorablePoints = calculateTagPoints(favorableMatchCount);
  const unfavorablePoints = calculateTagPoints(unfavorableMatchCount);

  // ベース50点 + 加点 - 減点
  return 50 + favorablePoints - unfavorablePoints;
};

/**
 * マクロタグスコアを計算
 *
 * ベース: 50点
 * - 有望マクロ一致: +15/30/50点（1/2/3個）
 * - 不利マクロ一致: -15/30/50点（1/2/3個）
 * 相殺方式: 純一致数でスコア計算
 */
const calculateMacroScore = (
  stockMacroTagIds: readonly string[],
  favorableMacroTagIds: readonly string[],
  unfavorableMacroTagIds: readonly string[],
): number => {
  const favorableMatchCount = countMatchingTags(stockMacroTagIds, favorableMacroTagIds);
  const unfavorableMatchCount = countMatchingTags(stockMacroTagIds, unfavorableMacroTagIds);

  const favorablePoints = calculateTagPoints(favorableMatchCount);
  const unfavorablePoints = calculateTagPoints(unfavorableMatchCount);

  // ベース50点 + 加点 - 減点
  return 50 + favorablePoints - unfavorablePoints;
};

/**
 * タグスコアを計算
 *
 * 中期（グロースのみ）: テーマスコアのみ使用
 * 長期（全市場）: (テーマスコア × 0.6) + (マクロスコア × 0.4)
 *
 * @param input - タグスコア計算の入力データ
 * @param useOnlyTheme - true: テーマスコアのみ使用（中期用）、false: テーマ+マクロ合成（長期用）
 */
export const calculateTagScore: CalculateTagScore = (input, useOnlyTheme = false) => {
  const themeScore = calculateThemeScore(
    input.stockThemeTagIds,
    input.favorableThemeTagIds,
    input.unfavorableThemeTagIds,
  );

  if (useOnlyTheme) {
    // 中期: テーマスコアのみ
    return indicatorScoreSchema.parse(Math.round(clamp(themeScore, 0, 100)));
  }

  // 長期: テーマ + マクロの合成
  const macroScore = calculateMacroScore(
    input.stockMacroTagIds,
    input.favorableMacroTagIds,
    input.unfavorableMacroTagIds,
  );
  const combinedScore = themeScore * 0.6 + macroScore * 0.4;

  return indicatorScoreSchema.parse(Math.round(clamp(combinedScore, 0, 100)));
};
