import type { IndicatorScore } from "../values/indicatorScore";

/**
 * 業種相対スコア計算関数の型定義
 */
export type CalculateSectorScore = (perScore: IndicatorScore, pbrScore: IndicatorScore) => number;

/**
 * 業種相対スコアを計算（PERとPBRの平均）
 * TODO: 将来的には業種指数のMA13/MA26を使った業種トレンドスコアに置き換え
 */
export const calculateSectorScore: CalculateSectorScore = (perScore, pbrScore) => {
  return (perScore + pbrScore) / 2;
};
