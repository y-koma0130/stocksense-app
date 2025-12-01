import type { IndicatorDto } from "../../application/dto/indicator.dto";
import { VOLUME_TRAP_THRESHOLDS } from "../values/volumeConfig";

/**
 * 市場タイプ
 */
type MarketType = "プライム" | "スタンダード" | "グロース" | "other";

/**
 * 市場別罠株除外の閾値設定
 */
const TRAP_STOCK_THRESHOLDS = {
  /** プライム市場（大型・安定企業） */
  プライム: {
    equityRatioMin: 25, // 自己資本比率の下限(%)
    roeMin: 3, // ROEの下限(%)
    operatingIncomeDeclineYearsMax: 3, // 営業利益減少の連続年数上限
    operatingCashFlowNegativeYearsMax: 2, // 営業CF負の連続年数上限
    revenueDeclineYearsMax: null, // 売上減少は見ない
    avgVolumeShortMin: VOLUME_TRAP_THRESHOLDS.PRIME,
  },
  /** スタンダード市場（中堅企業） */
  スタンダード: {
    equityRatioMin: 20,
    roeMin: null, // ROEは見ない
    operatingIncomeDeclineYearsMax: 2,
    operatingCashFlowNegativeYearsMax: 2,
    revenueDeclineYearsMax: null,
    avgVolumeShortMin: VOLUME_TRAP_THRESHOLDS.STANDARD,
  },
  /** グロース市場（成長企業・赤字可） */
  グロース: {
    equityRatioMin: 10,
    roeMin: null, // ROEは見ない（赤字可）
    operatingIncomeDeclineYearsMax: null, // 営業利益は見ない（赤字可）
    operatingCashFlowNegativeYearsMax: 3, // 緩め
    revenueDeclineYearsMax: 3, // 成長企業なのに縮小は除外
    avgVolumeShortMin: VOLUME_TRAP_THRESHOLDS.GROWTH,
  },
  /** その他市場 */
  other: {
    equityRatioMin: 20,
    roeMin: null,
    operatingIncomeDeclineYearsMax: 3,
    operatingCashFlowNegativeYearsMax: 2,
    revenueDeclineYearsMax: null,
    avgVolumeShortMin: VOLUME_TRAP_THRESHOLDS.OTHER,
  },
} as const;

/**
 * 罠銘柄判定結果
 */
export type TrapStockCheckResult = Readonly<{
  isTrap: boolean;
  reasons: string[];
}>;

/**
 * 市場名からMarketTypeを取得
 */
const getMarketType = (market: string | null): MarketType => {
  if (!market) return "other";
  if (market.includes("プライム")) return "プライム";
  if (market.includes("スタンダード")) return "スタンダード";
  if (market.includes("グロース")) return "グロース";
  return "other";
};

/**
 * 罠銘柄かどうかを判定する（市場別）
 *
 * プライム市場:
 * - 自己資本比率 < 25%
 * - ROE < 3%
 * - 営業利益が3期連続で減少
 * - 営業CFが2期連続マイナス
 *
 * スタンダード市場:
 * - 自己資本比率 < 20%
 * - 営業利益が2期連続減少
 * - 営業CFが2期連続マイナス
 *
 * グロース市場:
 * - 自己資本比率 < 10%
 * - 営業CFが3期連続マイナス
 * - 売上が3期連続マイナス
 */
export const isTrapStock = (indicator: IndicatorDto): TrapStockCheckResult => {
  const reasons: string[] = [];
  const marketType = getMarketType(indicator.market);
  const thresholds = TRAP_STOCK_THRESHOLDS[marketType];

  // 1. 自己資本比率チェック
  if (
    thresholds.equityRatioMin !== null &&
    indicator.equityRatio !== null &&
    indicator.equityRatio < thresholds.equityRatioMin
  ) {
    reasons.push(
      `自己資本比率が${thresholds.equityRatioMin}%未満 (${indicator.equityRatio.toFixed(1)}%)`,
    );
  }

  // 2. ROEチェック（プライムのみ）
  if (thresholds.roeMin !== null && indicator.roe !== null && indicator.roe < thresholds.roeMin) {
    reasons.push(`ROEが${thresholds.roeMin}%未満 (${indicator.roe.toFixed(1)}%)`);
  }

  // 3. 営業利益減少連続年数チェック
  if (
    thresholds.operatingIncomeDeclineYearsMax !== null &&
    indicator.operatingIncomeDeclineYears !== null &&
    indicator.operatingIncomeDeclineYears >= thresholds.operatingIncomeDeclineYearsMax
  ) {
    reasons.push(`営業利益が${indicator.operatingIncomeDeclineYears}年連続で減少`);
  }

  // 4. 営業CF負の連続年数チェック
  if (
    thresholds.operatingCashFlowNegativeYearsMax !== null &&
    indicator.operatingCashFlowNegativeYears !== null &&
    indicator.operatingCashFlowNegativeYears >= thresholds.operatingCashFlowNegativeYearsMax
  ) {
    reasons.push(`営業CFが${indicator.operatingCashFlowNegativeYears}年連続で負`);
  }

  // 5. 売上減少連続年数チェック（グロースのみ）
  if (
    thresholds.revenueDeclineYearsMax !== null &&
    indicator.revenueDeclineYears !== null &&
    indicator.revenueDeclineYears >= thresholds.revenueDeclineYearsMax
  ) {
    reasons.push(`売上が${indicator.revenueDeclineYears}年連続で減少`);
  }

  // 6. 出来高チェック（中期・長期共通）
  if ("avgVolumeShort" in indicator && indicator.avgVolumeShort !== null) {
    if (indicator.avgVolumeShort <= thresholds.avgVolumeShortMin) {
      reasons.push(
        `短期平均出来高が${thresholds.avgVolumeShortMin.toLocaleString()}株以下 (${indicator.avgVolumeShort.toLocaleString()}株)`,
      );
    }
  }

  return {
    isTrap: reasons.length > 0,
    reasons,
  };
};
