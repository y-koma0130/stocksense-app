import type { HistoricalDataPointDto } from "../../application/dto/yahooFinance.dto";

/**
 * 週足データから平均日次出来高を計算する関数の型定義
 *
 * @param weeklyData 週足データ（新しい順）
 * @param weeks 計算に使用する週数
 * @returns 日次平均出来高（株数）
 */
export type CalculateAvgDailyVolume = (
  weeklyData: HistoricalDataPointDto[],
  weeks: number,
) => number | null;

/**
 * 週足データから平均日次出来高を計算
 *
 * 週足の出来高を営業日数で割って日次平均を算出
 * 週足データがない場合はnullを返す
 */
export const calculateAvgDailyVolume: CalculateAvgDailyVolume = (weeklyData, weeks) => {
  const targetData = weeklyData.slice(0, weeks);
  if (targetData.length === 0) return null;

  const totalVolume = targetData.reduce((sum, d) => sum + d.volume, 0);
  // 週足の出来高合計を営業日数（5日 × 週数）で割る
  const tradingDaysPerWeek = 5;
  const tradingDays = targetData.length * tradingDaysPerWeek;
  return Math.round(totalVolume / tradingDays);
};
