/**
 * 出来高関連の設定定数
 */

/**
 * 出来高計算の期間設定（週数）
 */
export const VOLUME_PERIOD = {
  /** 短期平均の計算期間（週） */
  SHORT: 1,
  /** 長期平均の計算期間（週） */
  LONG: 5,
} as const;

/**
 * 罠株除外用の出来高閾値（市場別・1日平均株数）
 */
export const VOLUME_TRAP_THRESHOLDS = {
  /** プライム市場の下限 */
  PRIME: 30000,
  /** スタンダード市場の下限 */
  STANDARD: 7000,
  /** グロース市場の下限 */
  GROWTH: 5000,
  /** その他市場の下限（スタンダードと同等） */
  OTHER: 7000,
} as const;

/**
 * 出来高急増スコアの閾値設定（線形補間用）
 * ratio = avgVolumeShort / avgVolumeLong
 *
 * スコアリング:
 * - ratio >= MAX_RATIO (2.0): 100点（大幅増加）
 * - ratio = NEUTRAL_RATIO (1.0): 50点（横ばい）
 * - ratio <= MIN_RATIO (0.5): 0点（大幅減少）
 * - 中間値は線形補間
 */
export const VOLUME_SURGE_CONFIG = {
  /** 100点を付与する出来高比率の閾値 */
  MAX_RATIO: 2.0,
  /** 50点を付与する出来高比率（横ばい） */
  NEUTRAL_RATIO: 1.0,
  /** 0点を付与する出来高比率の閾値 */
  MIN_RATIO: 0.5,
  /** データ不足時のスコア */
  NEUTRAL_SCORE: 50,
} as const;
