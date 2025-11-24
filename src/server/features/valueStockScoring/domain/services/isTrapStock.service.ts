import type { StockIndicatorDto } from "../../application/dto/stockIndicator.dto";

/**
 * 罠銘柄除外の閾値設定
 */
const TRAP_STOCK_THRESHOLDS = {
  /** 自己資本比率の下限(%) - これ以下は除外 */
  EQUITY_RATIO_MIN: 20,
  /** 営業利益減少の連続年数上限 - これ以上は除外 */
  OPERATING_INCOME_DECLINE_YEARS_MAX: 3,
  /** 営業CF負の連続年数上限 - これ以上は除外 */
  OPERATING_CASH_FLOW_NEGATIVE_YEARS_MAX: 2,
} as const;

/**
 * 罠銘柄判定結果
 */
export type TrapStockCheckResult = Readonly<{
  isTrap: boolean;
  reasons: string[];
}>;

/**
 * 罠銘柄かどうかを判定する
 *
 * 除外条件:
 * 1. 営業利益が3年連続で減少している
 * 2. 営業CFが2年連続で負
 * 3. 自己資本比率が20%未満
 */
export const isTrapStock = (indicator: StockIndicatorDto): TrapStockCheckResult => {
  const reasons: string[] = [];

  // 1. 自己資本比率チェック（20%未満は除外）
  if (
    indicator.equityRatio !== null &&
    indicator.equityRatio < TRAP_STOCK_THRESHOLDS.EQUITY_RATIO_MIN
  ) {
    reasons.push(
      `自己資本比率が${TRAP_STOCK_THRESHOLDS.EQUITY_RATIO_MIN}%未満 (${indicator.equityRatio.toFixed(1)}%)`,
    );
  }

  // 2. 営業利益減少連続年数チェック（3年以上は除外）
  if (
    indicator.operatingIncomeDeclineYears !== null &&
    indicator.operatingIncomeDeclineYears >=
      TRAP_STOCK_THRESHOLDS.OPERATING_INCOME_DECLINE_YEARS_MAX
  ) {
    reasons.push(`営業利益が${indicator.operatingIncomeDeclineYears}年連続で減少`);
  }

  // 3. 営業CF負の連続年数チェック（2年以上は除外）
  if (
    indicator.operatingCashFlowNegativeYears !== null &&
    indicator.operatingCashFlowNegativeYears >=
      TRAP_STOCK_THRESHOLDS.OPERATING_CASH_FLOW_NEGATIVE_YEARS_MAX
  ) {
    reasons.push(`営業CFが${indicator.operatingCashFlowNegativeYears}年連続で負`);
  }

  return {
    isTrap: reasons.length > 0,
    reasons,
  };
};
