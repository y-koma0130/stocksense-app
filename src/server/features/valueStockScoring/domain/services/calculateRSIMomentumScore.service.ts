import { clamp } from "../utils/clamp";

/**
 * RSIモメンタムスコア計算関数の型定義
 * @param rsiShort - 短期RSI（2週）
 * @param rsi - ベースRSI（14週）
 * @returns 0-100のスコア（nullの場合は中央値50を返す）
 */
export type CalculateRSIMomentumScore = (rsiShort: number | null, rsi: number | null) => number;

/**
 * RSIモメンタム（短期RSI - 長期RSI）をスコアに変換する
 *
 * モメンタムの解釈:
 * - 正の値: 短期RSIが長期RSIより高い = 上昇モメンタム（反発初動）
 * - 負の値: 短期RSIが長期RSIより低い = 下降モメンタム
 *
 * スコアリング:
 * - +30以上: 100点（強い上昇モメンタム）
 * - +15: 75点
 * - 0: 50点（モメンタムなし）
 * - -15: 25点
 * - -30以下: 0点（強い下降モメンタム）
 *
 * バリュー株投資では「売られすぎから反発し始めた銘柄」を狙うため、
 * 正のモメンタム（上昇初動）に高スコアを与える
 */
export const calculateRSIMomentumScore: CalculateRSIMomentumScore = (rsiShort, rsi) => {
  // どちらかがnullの場合は中央値を返す
  if (rsiShort === null || rsi === null) {
    return 50;
  }

  // RSIモメンタム計算（短期 - 長期）
  const momentum = rsiShort - rsi;

  // スコア変換（-30〜+30 を 0〜100 にマッピング）
  // momentum = -30 → score = 0
  // momentum = 0 → score = 50
  // momentum = +30 → score = 100
  const score = ((momentum + 30) / 60) * 100;

  return clamp(score, 0, 100);
};
