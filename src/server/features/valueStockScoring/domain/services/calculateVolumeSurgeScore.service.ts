import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";
import { VOLUME_SURGE_CONFIG } from "../values/volumeConfig";

/**
 * 出来高急増スコア計算関数の型定義
 *
 * 短期平均出来高と長期平均出来高の比率からスコアを算出
 */
export type CalculateVolumeSurgeScore = (
  avgVolumeShort: number | null,
  avgVolumeLong: number | null,
) => IndicatorScore;

/**
 * 出来高急増スコアを計算（線形スケール 0-100）
 *
 * バリュー投資の観点から、出来高増加は以下のシグナル:
 * - 大口投資家の参入
 * - 市場の注目度上昇
 * - 反発局面の可能性
 *
 * スコアリング（線形補間）:
 * - ratio >= 2.0: 100点（大幅増加）
 * - ratio = 1.0: 50点（横ばい）
 * - ratio <= 0.5: 0点（大幅減少）
 * - 中間値は線形補間
 */
export const calculateVolumeSurgeScore: CalculateVolumeSurgeScore = (
  avgVolumeShort,
  avgVolumeLong,
) => {
  // データが不足している場合はニュートラルスコア
  if (avgVolumeShort === null || avgVolumeLong === null || avgVolumeLong === 0) {
    return indicatorScoreSchema.parse(VOLUME_SURGE_CONFIG.NEUTRAL_SCORE);
  }

  const ratio = avgVolumeShort / avgVolumeLong;
  const { MAX_RATIO, NEUTRAL_RATIO, MIN_RATIO } = VOLUME_SURGE_CONFIG;

  let score: number;

  if (ratio >= MAX_RATIO) {
    // 大幅増加: 100点
    score = 100;
  } else if (ratio >= NEUTRAL_RATIO) {
    // 横ばい〜大幅増加の間: 線形補間 (50-100点)
    score = 50 + ((ratio - NEUTRAL_RATIO) / (MAX_RATIO - NEUTRAL_RATIO)) * 50;
  } else if (ratio >= MIN_RATIO) {
    // 大幅減少〜横ばいの間: 線形補間 (0-50点)
    score = ((ratio - MIN_RATIO) / (NEUTRAL_RATIO - MIN_RATIO)) * 50;
  } else {
    // 大幅減少: 0点
    score = 0;
  }

  return indicatorScoreSchema.parse(Math.round(clamp(score, 0, 100)));
};
