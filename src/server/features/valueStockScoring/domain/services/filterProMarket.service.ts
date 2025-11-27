import type { IndicatorDto } from "../../application/dto/indicator.dto";

/**
 * PROマーケット判定関数の型定義
 */
export type FilterProMarket = <T extends IndicatorDto>(indicators: readonly T[]) => T[];

/**
 * PROマーケット（TOKYO PRO Market）かどうかを判定
 */
const isProMarket = (market: string | null): boolean => {
  if (!market) return false;
  return market.includes("PRO") || market.includes("プロ");
};

/**
 * PROマーケットの銘柄を除外する
 * PROマーケットは機関投資家向け市場であり、個人投資家向けではない
 */
export const filterProMarket: FilterProMarket = (indicators) => {
  return indicators.filter((indicator) => !isProMarket(indicator.market));
};
